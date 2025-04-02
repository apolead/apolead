
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if this is a password reset confirmation
  useEffect(() => {
    const checkResetParams = async () => {
      const url = new URL(window.location.href);
      const type = url.searchParams.get('type');
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      
      // Handle password reset link
      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            throw error;
          }
          
          // Redirect to password reset page
          navigate('/reset-password');
        } catch (error) {
          console.error('Error setting session from recovery link:', error);
          toast({
            title: "Invalid Reset Link",
            description: "The password reset link is invalid or has expired.",
            variant: "destructive"
          });
        }
      }
    };
    
    checkResetParams();
  }, [navigate, toast]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Login - Found existing session, checking credentials");
        
        // First check if we have cached credentials (fastest route)
        try {
          const cachedData = localStorage.getItem('tempCredentials');
          if (cachedData) {
            const { userId, credentials, timestamp } = JSON.parse(cachedData);
            // Check if cache is valid (30 minutes validity)
            const isValid = Date.now() - timestamp < 30 * 60 * 1000;
            
            if (isValid && userId === session.user.id) {
              console.log('Login - Using cached credentials:', credentials);
              if (credentials === 'supervisor') {
                navigate('/supervisor', { replace: true });
                return;
              } else {
                navigate('/dashboard', { replace: true });
                return;
              }
            }
          }
        } catch (e) {
          console.error('Error parsing cached credentials:', e);
          localStorage.removeItem('tempCredentials');
        }
        
        // If no valid cache, try using the is_supervisor function (most reliable)
        try {
          console.log('Checking supervisor status for user ID:', session.user.id);
          const { data: isSupervisor, error: supervisorError } = await supabase.rpc('is_supervisor', {
            check_user_id: session.user.id
          });
          
          if (supervisorError) {
            console.error('Supervisor check error:', supervisorError);
            // Fall back to the get_user_credentials if is_supervisor fails
          } else {
            console.log('Login checkSession - Is supervisor:', isSupervisor);
            
            // Cache the credentials
            localStorage.setItem('tempCredentials', JSON.stringify({
              userId: session.user.id,
              credentials: isSupervisor ? 'supervisor' : 'agent',
              timestamp: Date.now()
            }));
            
            if (isSupervisor) {
              console.log('Navigating to supervisor dashboard');
              navigate('/supervisor', { replace: true });
              setIsCheckingSession(false);
              return;
            } else {
              console.log('Navigating to regular dashboard');
              navigate('/dashboard', { replace: true });
              setIsCheckingSession(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking supervisor status:', error);
          // Continue to the next approach
        }
        
        // If that fails too, fetch from API as last resort
        try {
          console.log('Fetching credentials for user ID:', session.user.id);
          const { data, error } = await (supabase.rpc as any)('get_user_credentials', {
            user_id: session.user.id
          });
          
          if (error) {
            console.error('RPC error:', error);
            throw error;
          }
          
          console.log('Login checkSession - User credentials:', data);
          
          // Cache the credentials
          localStorage.setItem('tempCredentials', JSON.stringify({
            userId: session.user.id,
            credentials: data,
            timestamp: Date.now()
          }));
          
          if (data === 'supervisor') {
            console.log('Navigating to supervisor dashboard');
            navigate('/supervisor', { replace: true });
          } else {
            console.log('Navigating to regular dashboard');
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user credentials:', error);
          // Even if we have an error, still redirect the user somewhere
          setTimeout(() => {
            navigate('/dashboard', { replace: true }); // Fallback to dashboard
          }, 100);
        }
      }
      setIsCheckingSession(false);
    };
    
    checkSession();
  }, [navigate]);

  const handleEmailChange = e => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
  };

  const validateEmail = email => {
    if (!email.endsWith('@gmail.com')) {
      return 'Only Gmail accounts are allowed';
    }
    return null;
  };

  const handleLogin = async e => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      toast({
        title: "Invalid email",
        description: emailError,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });

      // Check user credentials and redirect accordingly
      try {
        // First try the is_supervisor function (most reliable)
        const { data: isSupervisor, error: supervisorError } = await supabase.rpc('is_supervisor', {
          check_user_id: data.user.id
        });
        
        if (supervisorError) {
          console.error('Supervisor check error:', supervisorError);
          // Fall back to the get_user_credentials if is_supervisor fails
        } else {
          console.log('Login successful - Is supervisor:', isSupervisor);
          
          // Cache the credentials
          localStorage.setItem('tempCredentials', JSON.stringify({
            userId: data.user.id,
            credentials: isSupervisor ? 'supervisor' : 'agent',
            timestamp: Date.now()
          }));
          
          if (isSupervisor) {
            console.log('Redirecting to supervisor dashboard');
            navigate('/supervisor', { replace: true });
            return;
          } else {
            console.log('Redirecting to regular dashboard');
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking supervisor status:', error);
        // Continue to the next approach if this fails
      }
        
      // Try with regular get_user_credentials as fallback
      try {
        // Make multiple attempts with timeouts to ensure we get a valid credential check
        let attempts = 0;
        const maxAttempts = 3;
        const checkCredentials = async () => {
          try {
            console.log('Checking credentials for user ID:', data.user.id);
            const { data: credentialData, error: credentialError } = await (supabase.rpc as any)('get_user_credentials', {
              user_id: data.user.id
            });
            
            if (credentialError) {
              console.error('RPC error:', credentialError);
              throw credentialError;
            }
            
            console.log('Login successful - User credentials:', credentialData);
            
            // Cache the credentials in localStorage for faster access
            localStorage.setItem('tempCredentials', JSON.stringify({
              userId: data.user.id,
              credentials: credentialData,
              timestamp: Date.now()
            }));
            
            // Force caching the credentials in localStorage to avoid any RLS issues
            if (credentialData) {
              const cachedProfile = localStorage.getItem('userProfile');
              if (cachedProfile) {
                try {
                  const profile = JSON.parse(cachedProfile);
                  profile.credentials = credentialData;
                  localStorage.setItem('userProfile', JSON.stringify(profile));
                  console.log('Updated credentials in cached profile');
                } catch (error) {
                  console.error('Error updating cached profile:', error);
                }
              }
            }
            
            if (credentialData === 'supervisor') {
              // Redirect with delay to ensure all state updates are processed
              console.log('Redirecting to supervisor dashboard');
              navigate('/supervisor', { replace: true });
            } else {
              console.log('Redirecting to regular dashboard');
              navigate('/dashboard', { replace: true });
            }
          } catch (error) {
            console.error(`Error getting user credentials (attempt ${attempts+1}/${maxAttempts}):`, error);
            attempts++;
            if (attempts < maxAttempts) {
              // Try again after a short delay
              setTimeout(checkCredentials, 500);
            } else {
              // After max attempts, default to dashboard
              console.log('Max credential check attempts reached, defaulting to dashboard');
              navigate('/dashboard', { replace: true });
            }
          }
        };
        
        // Start the credential check process
        checkCredentials();
        
      } catch (error) {
        console.error('Error getting user credentials:', error);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowResetForm(true);
    setResetEmail(email); // Pre-fill with login email if available
  };
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    const emailError = validateEmail(resetEmail);
    if (emailError) {
      toast({
        title: "Invalid email",
        description: emailError,
        variant: "destructive"
      });
      return;
    }
    
    setIsSendingReset(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login?type=recovery`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for a password reset link",
      });
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Error sending reset email",
        description: error.message || "An error occurred sending the reset email",
        variant: "destructive"
      });
    } finally {
      setIsSendingReset(false);
    }
  };
  
  const handleBackToLogin = (e) => {
    e.preventDefault();
    setShowResetForm(false);
    setResetSent(false);
  };

  if (isCheckingSession) {
    return <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-lg font-medium">Checking session...</div>
      </div>
    </div>;
  }

  return <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="hidden md:block w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>

          <h2 className="text-2xl font-bold mb-6">Welcome Back!</h2>
          <p className="text-white/80 mb-6">
            Sign in to your ApoLead account to access your dashboard, manage your leads, and track your performance.
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Why join ApoLead?</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Flexible work hours from anywhere</li>
              <li>Competitive compensation packages</li>
              <li>Supportive community of professionals</li>
              <li>Continuous training and skill development</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>© 2025 ApoLead. All rights reserved.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        {!showResetForm ? (
          // Login Form
          <div>
            <h2 className="text-2xl font-bold mb-4">Sign In</h2>
            <p className="text-gray-600 mb-8">Enter your credentials to access your account</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your.name@gmail.com"
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    onClick={handleForgotPassword} 
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </div>
                ) : 'Sign In'}
              </Button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800">Sign up</Link>
              </p>
            </form>
          </div>
        ) : (
          // Password Reset Form
          <div>
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            {resetSent ? (
              <div className="text-center p-6">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  Password reset instructions have been sent to your email address. Please check your inbox and follow the link to reset your password.
                </p>
                <Button 
                  onClick={handleBackToLogin} 
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-8">Enter your email address to receive a password reset link</p>
                
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div>
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <Input 
                      type="email"
                      id="resetEmail"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.name@gmail.com"
                      className="mt-1"
                      required
                      disabled={isSendingReset}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleBackToLogin}
                      className="flex-1"
                      disabled={isSendingReset}
                    >
                      Back to Login
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSendingReset}
                    >
                      {isSendingReset ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </div>
                      ) : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>;
};

export default Login;
