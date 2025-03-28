
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        if (!mounted) return;
        setIsCheckingSession(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log("User already logged in, checking application status and credentials");
          
          // Check if profile exists and application is approved
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('application_status, credentials')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (profile && profile.application_status === 'approved') {
            // Redirect based on credentials
            if (profile.credentials === 'supervisor') {
              navigate('/supervisor');
            } else {
              navigate('/dashboard');
            }
          } else if (profile && profile.application_status === 'rejected') {
            // Rejected user, show notification and sign out
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            setIsCheckingSession(false);
          } else {
            // User exists but not approved, redirect to signup
            navigate('/signup');
          }
        } else if (mounted) {
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && mounted) {
          // Check if profile exists and application is approved
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('application_status, credentials')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (profile && profile.application_status === 'approved') {
            // Redirect based on credentials
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
            
            if (profile.credentials === 'supervisor') {
              navigate('/supervisor');
            } else {
              navigate('/dashboard');
            }
          } else if (profile && profile.application_status === 'rejected') {
            // Rejected user, show notification and sign out
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          } else {
            // User exists but not approved, redirect to signup
            console.log("User is not approved, redirecting to signup");
            navigate('/signup');
          }
        }
      }
    );
    
    checkSession();
    
    // Clean up
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      if (!email || !password) {
        setErrorMessage('Please enter both email and password');
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Auth state change listener will handle redirection
      
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage(error.message || 'Failed to sign in');
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="hidden md:block w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        {/* Geometric shapes */}
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
        
        {/* Testimonial */}
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
      
      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        {/* Back to Home Link (Mobile Only) */}
        <div className="block md:hidden mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          {/* Logo */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold inline">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Sign in</h1>
          <p className="text-gray-600 mb-8 text-center">Sign in to your account</p>
          
          {/* Form error */}
          {errorMessage && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>}
          
          {isCheckingSession ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Checking login status...</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="youremail@gmail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-indigo-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm">
              Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
