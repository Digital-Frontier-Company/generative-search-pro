
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSignUp = location.state?.signUp || false;
  
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate('/dashboard');
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        navigate('/dashboard');
      }
    });
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);
  
  const handleToggleMode = () => setIsSignUp(!isSignUp);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isMagicLink) {
        // Send magic link email
        const { error } = await supabase.auth.signInWithOtp({
          email,
        });
        
        if (error) throw error;
        
        toast.success("Magic link sent to your email!");
      } else if (isSignUp) {
        // Sign up with email and password
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success("Account created! Please check your email for verification.");
      } else {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success("Successfully logged in!");
        navigate('/dashboard');
      }
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMagicLinkToggle = () => {
    setIsMagicLink(!isMagicLink);
    setPassword("");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')} 
        className="absolute top-4 left-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-aeo-blue to-aeo-purple flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            {isMagicLink ? "Magic Link Sign In" : isSignUp ? "Create an Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isMagicLink ? "We'll send a secure link to your email" : 
              isSignUp ? "Start optimizing your content for AI engines" : 
              "Sign in to your FrontierAEO account"}
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {!isMagicLink && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {!isSignUp && (
                        <a 
                          href="#" 
                          className="text-xs text-aeo-blue hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleMagicLinkToggle();
                          }}
                        >
                          Use magic link instead
                        </a>
                      )}
                    </div>
                    <Input
                      id="password"
                      placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-aeo-blue hover:bg-aeo-blue/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : isMagicLink ? (
                  <span className="flex items-center">
                    Send Magic Link
                    <Mail className="ml-2 h-4 w-4" />
                  </span>
                ) : isSignUp ? "Create Account" : "Sign In"}
              </Button>
              
              {!isMagicLink && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <a 
                    href="#" 
                    className="text-aeo-blue hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleMode();
                    }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </a>
                </p>
              )}
              
              {isMagicLink && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  <a 
                    href="#" 
                    className="text-aeo-blue hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMagicLinkToggle();
                    }}
                  >
                    Use password instead
                  </a>
                </p>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
