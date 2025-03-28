import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase, forceSignOut } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionCheckTimedOut, setSessionCheckTimedOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCancelSessionCheck = () => {
    setSessionCheckTimedOut(true);
    setIsCheckingSession(false);
  };

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;
    let sessionCheckTimeout;
    
    const checkSession = async () => {
      try {
        if (!mounted) return;
        
        // Set a timeout to prevent hanging on session check
        sessionCheckTimeout = setTimeout(() => {
          if (mounted && isCheckingSession) {
            console.log("Session check timed out");
            setSessionCheckTimedOut(true);
            setIsCheckingSession(false);
          }
        }, 10000); // 10 second timeout
        
        console.log("Checking for existing session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        // Clear timeout since we got a response
        clearTimeout(sessionCheckTimeout);
        
        if (session?.user && mounted) {
          console.log("User already logged in, checking application status");
          
          // Check if profile exists and application is approved
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('application_status, credentials')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          console.log("Profile check results:", profile, error);
            
          if (profile && profile.application_status === 'approved') {
            // Approved user, redirect to appropriate dashboard
            console.log("User is approved, redirecting to dashboard");
            
            // Redirect based on credentials
            if (profile.credentials === 'supervisor') {
              navigate('/supervisor');
            } else {
              navigate('/dashboard');
            }
          } else if (profile && profile.application_status === 'rejected') {
            // Rejected user, show notification and sign out
            console.log("User was rejected, showing notification");
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await forceSignOut();
            setIsCheckingSession(false);
          } else {
            // User exists but application is pending or other status
            console.log("User exists but application is pending, redirecting to signup");
            navigate('/signup');
          }
        } else if (mounted) {
          console.log("No authenticated user found");
          setIsCheckingSession(false);
        }
      } catch (error) {
        // Clear timeout if there's an error
        clearTimeout(sessionCheckTimeout);
        
        console.error("Error checking session:", error);
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed in Login:", event, session?.user?.email);
        
        if (!mounted) return;
        
        // Clear timeout when auth state changes
        clearTimeout(sessionCheckTimeout);
        
        // Defer Supabase calls with setTimeout to avoid deadlocks
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              // User has signed in, check their profile status
              const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('application_status, credentials')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              console.log("Auth change profile check:", profile, error);
                
              if (profile && profile.application_status === 'approved') {
                // Approved user, redirect to dashboard
                toast({
                  title: "Login successful",
                  description: "Welcome back!",
                });
                
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
                await forceSignOut();
              } else {
                // User exists but not approved or no profile yet, redirect to signup
                console.log("User not approved or no profile, redirecting to signup");
                navigate('/signup');
              }
            } catch (error) {
              console.error('Error checking profile after auth state change:', error);
            }
          }, 0);
        }
      }
    );
    
    // Clean up
    return () => {
      mounted = false;
      clearTimeout(sessionCheckTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, toast, isCheckingSession]);
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Get the URL of the current page for proper redirect
      const siteUrl = window.location.origin;
      
      console.log("Starting Google login flow");
      console.log("Site URL:", siteUrl);
      
      // Force logout first to ensure Google auth prompt appears
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent', // Force Google to show account selection
          }
        },
      });

      if (error) throw error;
      
      console.log("OAuth flow initiated, awaiting redirect");
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setErrorMessage(error.message || 'Failed to sign in with Google');
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="hidden md:block w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        {/* Geometric shapes - adjusted to not overlap */}
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
          
          {isCheckingSession ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600 mb-2">Checking login status...</p>
              {sessionCheckTimedOut ? (
                <p className="text-red-500 text-sm mb-2">Session check is taking longer than expected</p>
              ) : null}
              <Button 
                variant="outline"
                onClick={handleCancelSessionCheck}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              {/* Form error - ENHANCED: make error more visible */}
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
              
              {/* Google Login Button */}
              <Button 
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 transition py-6 mb-6"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                  </div>
                )}
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm">
                  Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">We only support Google authentication</p>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
