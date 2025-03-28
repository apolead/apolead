
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { idToString, profileExists, safelyAccessProfile } from '@/utils/supabaseHelpers';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    const checkSession = async () => {
      try {
        if (!mounted) return;
        setIsCheckingSession(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", !!session, session?.user?.email);
        
        if (session?.user && mounted) {
          console.log("User already logged in, checking application status");
          await handleUserAuthentication(session);
        } else if (mounted) {
          console.log("No active session found");
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };
    
    // Helper function to handle user authentication and profile checking
    const handleUserAuthentication = async (session) => {
      console.log("Handling user authentication for:", session.user.email);
      
      try {
        // First check if user profile exists
        const { data, error } = await supabase
          .from('user_profiles')
          .select('application_status, credentials')
          .eq('user_id', idToString(session.user.id))
          .maybeSingle();
        
        console.log("Profile check result:", data, error);
        
        if (error) {
          console.error("Error checking profile:", error);
          if (mounted) {
            setErrorMessage("Error fetching user profile: " + error.message);
            setIsCheckingSession(false);
          }
          return;
        }
        
        if (profileExists(data)) {
          // Profile exists, check application status
          const status = safelyAccessProfile(data, 'application_status');
          const credentials = safelyAccessProfile(data, 'credentials');
          
          console.log("Application status:", status, "Credentials:", credentials);
          
          if (status === 'approved') {
            console.log("User is approved with credentials:", credentials);
            // Redirect to appropriate dashboard based on credentials
            if (credentials === 'supervisor') {
              navigate('/supervisor');
            } else {
              navigate('/dashboard');
            }
          } else if (status === 'rejected') {
            console.log("User application was rejected");
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            if (mounted) setIsCheckingSession(false);
          } else {
            // Application pending or other status, redirect to signup
            console.log("User application is pending or incomplete, status:", status);
            navigate('/signup');
          }
        } else {
          // If no profile exists, we need to create one and redirect to signup
          console.log("No profile found for user, creating initial profile");
          
          try {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                email: session.user.email,
                first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                application_status: 'pending',
                credentials: 'agent',
                user_id: session.user.id
              });
            
            if (insertError) {
              console.error("Error creating initial profile:", insertError);
              toast({
                title: "Profile Creation Failed",
                description: "There was an error creating your profile. Please try again.",
                variant: "destructive",
              });
              if (mounted) setIsCheckingSession(false);
            } else {
              console.log("Created initial profile, redirecting to signup");
              navigate('/signup');
            }
          } catch (createError) {
            console.error("Error in profile creation:", createError);
            if (mounted) setIsCheckingSession(false);
          }
        }
      } catch (authError) {
        console.error("Error in handleUserAuthentication:", authError);
        if (mounted) setIsCheckingSession(false);
      }
    };
    
    // Set up auth state change listener
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && mounted) {
          setTimeout(async () => {
            // Use setTimeout to prevent deadlocks in Supabase client
            if (mounted) {
              await handleUserAuthentication(session);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT' && mounted) {
          setIsCheckingSession(false);
        }
      }
    ).data.subscription;
    
    checkSession();
    
    // Clean up
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate, toast]);
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Get the URL of the current page for proper redirect
      const siteUrl = window.location.origin;
      const currentPath = '/login'; // Always redirect back to login first for proper status checking
      
      console.log("Site URL:", siteUrl);
      console.log("Redirect path:", currentPath);
      
      // Force logout first to ensure Google auth prompt appears
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}${currentPath}`,
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
          
          {/* Google Login Button */}
          <Button 
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 transition py-6 mb-6"
            onClick={handleGoogleLogin}
            disabled={isLoading || isCheckingSession}
          >
            {isLoading || isCheckingSession ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isCheckingSession ? "Checking login status..." : "Signing in..."}
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
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
