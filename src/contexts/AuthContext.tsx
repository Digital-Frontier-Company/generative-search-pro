
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureStore, secureRetrieve, secureRemove, clearSecureStorage } from '@/lib/security';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  lastActivity: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING = 5 * 60 * 1000; // 5 minutes before expiry
const REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if expires within 10 minutes

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  // Security monitoring
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastFailedAttempt, setLastFailedAttempt] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Update last activity
  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    secureStore('lastActivity', now.toISOString());
  }, []);

  // Check if session is expired or about to expire
  const isSessionExpired = useCallback(() => {
    if (!sessionExpiry) return false;
    return new Date() >= sessionExpiry;
  }, [sessionExpiry]);

  const isSessionExpiring = useCallback(() => {
    if (!sessionExpiry) return false;
    return (sessionExpiry.getTime() - Date.now()) <= SESSION_WARNING;
  }, [sessionExpiry]);

  // Refresh session if needed
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        
        // Update expiry time
        const expiryTime = new Date(Date.now() + SESSION_TIMEOUT);
        setSessionExpiry(expiryTime);
        secureStore('sessionExpiry', expiryTime.toISOString());
        
        updateActivity();
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      await signOut();
    }
  }, []);

  // Auto-refresh session when needed
  useEffect(() => {
    if (!session || !sessionExpiry) return;

    const checkAndRefresh = async () => {
      const timeToExpiry = sessionExpiry.getTime() - Date.now();
      
      if (timeToExpiry <= REFRESH_THRESHOLD && timeToExpiry > 0) {
        await refreshSession();
      } else if (isSessionExpired()) {
        toast.error('Session expired. Please sign in again.');
        await signOut();
      } else if (isSessionExpiring()) {
        toast.warning('Your session will expire soon. Activity detected - extending session.');
        await refreshSession();
      }
    };

    const interval = setInterval(checkAndRefresh, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session, sessionExpiry, refreshSession, isSessionExpired, isSessionExpiring]);

  // Activity monitoring
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (session && !isSessionExpired()) {
        updateActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [session, updateActivity, isSessionExpired]);

  // Check account lockout
  const checkLockout = useCallback(() => {
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS && lastFailedAttempt) {
      const timeSinceLastAttempt = Date.now() - lastFailedAttempt.getTime();
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        setIsLocked(true);
        return true;
      } else {
        // Reset after lockout period
        setLoginAttempts(0);
        setLastFailedAttempt(null);
        setIsLocked(false);
      }
    }
    return false;
  }, [loginAttempts, lastFailedAttempt]);

  // Enhanced sign in with security measures
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: AuthError }> => {
    if (checkLockout()) {
      const error = new Error(`Account locked due to too many failed attempts. Try again in ${Math.ceil(LOCKOUT_DURATION / 60000)} minutes.`) as AuthError;
      error.__isAuthError = true;
      return { error };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        // Track failed attempts
        setLoginAttempts(prev => prev + 1);
        setLastFailedAttempt(new Date());
        
        // Enhanced error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }

        const enhancedError = new Error(errorMessage) as AuthError;
        enhancedError.__isAuthError = true;
        return { error: enhancedError };
      }

      if (data.user && data.session) {
        // Reset security counters on successful login
        setLoginAttempts(0);
        setLastFailedAttempt(null);
        setIsLocked(false);
        
        setUser(data.user);
        setSession(data.session);
        
        // Set session expiry
        const expiryTime = new Date(Date.now() + SESSION_TIMEOUT);
        setSessionExpiry(expiryTime);
        secureStore('sessionExpiry', expiryTime.toISOString());
        
        updateActivity();
        
        // Store user preferences securely
        secureStore('userPreferences', {
          email: data.user.email,
          lastLogin: new Date().toISOString()
        });

        toast.success('Successfully signed in!');
      }

      return { error: undefined };
    } catch (error) {
      console.error('Sign in error:', error);
      const authError = new Error('An unexpected error occurred. Please try again.') as AuthError;
      authError.__isAuthError = true;
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, [checkLockout, updateActivity]);

  // Enhanced sign up with validation
  const signUp = useCallback(async (email: string, password: string): Promise<{ error?: AuthError }> => {
    try {
      setLoading(true);
      
      // Client-side password validation
      if (password.length < 8) {
        const error = new Error('Password must be at least 8 characters long.') as AuthError;
        error.__isAuthError = true;
        return { error };
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        const error = new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number.') as AuthError;
        error.__isAuthError = true;
        return { error };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        const enhancedError = new Error(errorMessage) as AuthError;
        enhancedError.__isAuthError = true;
        return { error: enhancedError };
      }

      if (data.user && !data.session) {
        toast.success('Please check your email and click the confirmation link to complete your registration.');
      }

      return { error: undefined };
    } catch (error) {
      console.error('Sign up error:', error);
      const authError = new Error('An unexpected error occurred. Please try again.') as AuthError;
      authError.__isAuthError = true;
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Secure sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clear all secure storage
      clearSecureStorage();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      setSessionExpiry(null);
      setLastActivity(null);
      setLoginAttempts(0);
      setLastFailedAttempt(null);
      setIsLocked(false);
      
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Password reset
  const resetPassword = useCallback(async (email: string): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );

      if (error) {
        return { error };
      }

      toast.success('Password reset email sent. Please check your inbox.');
      return { error: undefined };
    } catch (error) {
      console.error('Password reset error:', error);
      const authError = new Error('Failed to send password reset email. Please try again.') as AuthError;
      authError.__isAuthError = true;
      return { error: authError };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (password: string): Promise<{ error?: AuthError }> => {
    try {
      // Client-side validation
      if (password.length < 8) {
        const error = new Error('Password must be at least 8 characters long.') as AuthError;
        error.__isAuthError = true;
        return { error };
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        return { error };
      }

      toast.success('Password updated successfully');
      return { error: undefined };
    } catch (error) {
      console.error('Password update error:', error);
      const authError = new Error('Failed to update password. Please try again.') as AuthError;
      authError.__isAuthError = true;
      return { error: authError };
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Failed to get session:', error);
        }

        if (session) {
          setUser(session.user);
          setSession(session);
          
          // Restore or set session expiry
          const storedExpiry = secureRetrieve('sessionExpiry');
          if (storedExpiry) {
            const expiry = new Date(storedExpiry);
            if (expiry > new Date()) {
              setSessionExpiry(expiry);
            } else {
              // Session expired, sign out
              await signOut();
              return;
            }
          } else {
            // Set new expiry
            const expiryTime = new Date(Date.now() + SESSION_TIMEOUT);
            setSessionExpiry(expiryTime);
            secureStore('sessionExpiry', expiryTime.toISOString());
          }
          
          // Restore last activity
          const storedActivity = secureRetrieve('lastActivity');
          if (storedActivity) {
            setLastActivity(new Date(storedActivity));
          }
          
          updateActivity();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setSession(session);
          
          const expiryTime = new Date(Date.now() + SESSION_TIMEOUT);
          setSessionExpiry(expiryTime);
          secureStore('sessionExpiry', expiryTime.toISOString());
          
          updateActivity();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setSessionExpiry(null);
          setLastActivity(null);
          clearSecureStorage();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
          
          const expiryTime = new Date(Date.now() + SESSION_TIMEOUT);
          setSessionExpiry(expiryTime);
          secureStore('sessionExpiry', expiryTime.toISOString());
          
          updateActivity();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [signOut, updateActivity]);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    isAuthenticated: !!user && !!session && !isSessionExpired(),
    sessionExpiry,
    lastActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Add security-related UI elements here */}
      {isLocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Account Locked</h2>
            <p className="mb-4">
              Your account has been locked due to too many failed login attempts.
            </p>
              <p className="mb-4">
              Please try again in {Math.ceil(LOCKOUT_DURATION / 60000)} minutes.
            </p>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
