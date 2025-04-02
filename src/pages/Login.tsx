
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

          <h2 className="text-3xl font-bold mb-6 text-white">Welcome back!</h2>
          <p className="text-white/80">Log in to access your dashboard and manage your calls.</p>
        </div>
        
        <div className="mt-auto relative z-10">
          <div className="bg-indigo-800 bg-opacity-70 rounded-lg p-5 mb-8">
            <p className="text-sm italic mb-3 text-white">"The platform has transformed my career as a call center agent. The tools and resources provided make handling calls much more efficient."</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold mr-2">
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sarah Johnson</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="block md:hidden mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold inline">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Sign in</h1>
          <p className="text-gray-600 mb-8 text-center">Sign in to your account</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email (Gmail only)</Label>
              <Input id="email" type="email" placeholder="your.name@gmail.com" value={email} onChange={handleEmailChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={handlePasswordChange} required />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full py-6 text-neutral-50">
              {isLoading ? <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </div> : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm">
              Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Only Gmail accounts are supported</p>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>;
};

export default Login;
