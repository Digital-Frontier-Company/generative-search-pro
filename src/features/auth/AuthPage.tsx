
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SmartInput } from '@/components/optimized/SmartInput';
import { ProgressIndicator, commonStepConfigurations } from '@/components/optimized/ProgressIndicator';
import { useAnalytics } from '@/hooks/useAnalytics';
import { commonRules } from '@/hooks/useFormValidation';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formStep, setFormStep] = useState(0);
  
  const { trackFormInteraction, trackConversion } = useAnalytics();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    trackFormInteraction('signin', 'start');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        trackFormInteraction('signin', 'error');
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      trackFormInteraction('signin', 'complete');
      trackConversion('signup');
      toast.success('Signed in successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Sign in error:', error);
      trackFormInteraction('signin', 'error');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    trackFormInteraction('signup', 'start');

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        trackFormInteraction('signup', 'error');
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
          setActiveTab('login');
        } else {
          toast.error(error.message);
        }
        return;
      }

      trackFormInteraction('signup', 'complete');
      trackConversion('signup');
      toast.success('Account created successfully! Please check your email for verification.');
      setActiveTab('login');
    } catch (error) {
      console.error('Sign up error:', error);
      trackFormInteraction('signup', 'error');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-auth-gradient-start to-auth-gradient-end p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <SmartInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={setEmail}
                  validationRules={commonRules.email}
                  formName="signin"
                  required
                />
                
                <div className="space-y-2">
                  <SmartInput
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={setPassword}
                    validationRules={commonRules.password}
                    formName="signin"
                    showValidationIcon={false}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-8 h-8 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <ProgressIndicator
                steps={commonStepConfigurations.onboarding.slice(0, 3)}
                currentStep={formStep}
                variant="minimal"
                className="mb-6"
              />
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <SmartInput
                  label="Full Name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={setFullName}
                  validationRules={commonRules.fullName}
                  formName="signup"
                  helpText="This will be displayed on your profile"
                  required
                />
                
                <SmartInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={setEmail}
                  validationRules={commonRules.email}
                  formName="signup"
                  helpText="We'll send verification to this email"
                  required
                />
                
                <div className="relative">
                  <SmartInput
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={setPassword}
                    validationRules={commonRules.password}
                    formName="signup"
                    helpText="Must be at least 6 characters long"
                    showValidationIcon={false}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-8 h-8 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
