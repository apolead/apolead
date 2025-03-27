import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StepZero = ({
  userData,
  updateUserData,
  nextStep,
  isCheckingEmail = false
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is already authenticated with Google
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        if (!mounted) return;
        setIsCheckingSession(true);
        
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log("User is authenticated:", session.user);
          
          // Check if user profile exists to determine if they need to complete signup
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('application_status, first_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (profileError || !profile) {
            // If no profile exists or error, consider this a new signup
            console.log("Profile not found or error, continuing with signup flow");
            
            // Update user data with information from the session
            updateUserData({
              email: session.user.email,
              firstName: session.user.user_metadata?.given_name || 
                        session.user.user_metadata?.name?.split(' ')[0] || 
                        session.user.user_metadata?.full_name?.split(' ')[0] || '',
              lastName: session.user.user_metadata?.family_name || 
                      (session.user.user_metadata?.name?.split(' ').length > 1 ? 
                        session.user.user_metadata?.name?.split(' ').slice(1).join(' ') : '') ||
                      (session.user.user_metadata?.full_name?.split(' ').length > 1 ? 
                        session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') : '')
            });
            
            // Create a minimal user profile to start
            if (mounted) {
              try {
                const { error: insertError } = await supabase
                  .from('user_profiles')
                  .upsert({
                    user_id: session.user.id,
                    email: session.user.email,
                    first_name: session.user.user_metadata?.given_name || 
                              session.user.user_metadata?.name?.split(' ')[0] || 
                              session.user.user_metadata?.full_name?.split(' ')[0] || '',
                    last_name: session.user.user_metadata?.family_name || 
                            (session.user.user_metadata?.name?.split(' ').length > 1 ? 
                              session.user.user_metadata?.name?.split(' ').slice(1).join(' ') : '') ||
                            (session.user.user_metadata?.full_name?.split(' ').length > 1 ? 
                              session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') : ''),
                    application_status: 'pending'
                  });
                  
                if (insertError) {
                  console.error("Error creating initial profile:", insertError);
                }
              } catch (err) {
                console.error("Error in profile creation:", err);
              }
            }
            
            // Proceed to next step of signup flow
            setTimeout(() => {
              if (mounted) {
                nextStep();
                setIsCheckingSession(false);
              }
            }, 500);
          } else if (profile.application_status === 'rejected') {
            // User was previously rejected, show notification and sign out
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            setIsCheckingSession(false);
          } else if (profile?.application_status === 'approved') {
            // User is approved, redirect to dashboard
            toast({
              title: "Welcome back!",
              description: "You've been redirected to your dashboard",
            });
            navigate('/dashboard');
          } else if (profile?.first_name) {
            // User has started the application but not completed it
            // Proceed with signup flow
            setTimeout(() => {
              if (mounted) {
                nextStep();
                setIsCheckingSession(false);
              }
            }, 500);
          } else {
            // No name yet, treat as new signup
            setTimeout(() => {
              if (mounted) {
                nextStep();
                setIsCheckingSession(false);
              }
            }, 500);
          }
        } else if (mounted) {
          console.log("No authenticated user found");
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };
    
    // Set up an auth state change listener to handle redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && mounted) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('application_status, first_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          // Update user data
          updateUserData({
            email: session.user.email,
            firstName: session.user.user_metadata?.given_name || 
                      session.user.user_metadata?.name?.split(' ')[0] || 
                      session.user.user_metadata?.full_name?.split(' ')[0] || '',
            lastName: session.user.user_metadata?.family_name || 
                    (session.user.user_metadata?.name?.split(' ').length > 1 ? 
                      session.user.user_metadata?.name?.split(' ').slice(1).join(' ') : '') ||
                    (session.user.user_metadata?.full_name?.split(' ').length > 1 ? 
                      session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') : '')
          });
          
          if (!profileError && profile?.application_status === 'rejected') {
            // User was previously rejected, show notification and sign out
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            if (mounted) setIsCheckingSession(false);
          } else if (!profileError && profile?.application_status === 'approved') {
            // Existing approved user, redirect to dashboard
            navigate('/dashboard');
          } else {
            // New user or user with incomplete profile, continue signup flow
            setTimeout(() => {
              if (mounted) nextStep();
            }, 500);
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
  }, []);
  
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Get the URL of the current page for proper redirect
      const siteUrl = window.location.origin;
      const currentPath = '/signup'; // Always redirect back to signup page
      
      console.log("Current site URL:", siteUrl);
      console.log("Current path:", currentPath);
      
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
      
      // If successfully initiated OAuth flow, the page will redirect
      console.log("OAuth flow initiated, awaiting redirect");
      
    } catch (error) {
      console.error('Error signing up with Google:', error);
      setErrorMessage(error.message || 'Failed to sign up with Google');
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
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

          <h2 className="text-3xl font-bold mb-6 text-white">Let us help you run your call center career.</h2>
          <p className="text-white/80">Our registration process is quick and easy, taking no more than 10 minutes to complete.</p>
        </div>
        
        {/* Testimonial */}
        <div className="mt-auto relative z-10">
          <div className="bg-indigo-800 bg-opacity-70 rounded-lg p-5 mb-8">
            <p className="text-sm italic mb-3 text-white">"I'm impressed with how quickly I've seen progress since starting to use this platform. I began receiving clients and projects in the first week."</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold mr-2">
                J
              </div>
              <div>
                <p className="text-xs font-semibold text-white">James Kim</p>
              </div>
            </div>
          </div>
          
          {/* Bottom quote */}
          <div className="border-t border-indigo-500 pt-4 text-sm italic">
            <p className="text-white">"If you can build a great experience, customers will come back after their first call. Word of mouth is very powerful!"</p>
            <p className="mt-2 font-semibold text-white">— Alex W.</p>
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

          <h1 className="text-2xl font-bold mb-2 text-center">Get started</h1>
          <p className="text-gray-600 mb-8 text-center">Create your account now</p>
          
          {/* Session checking state */}
          {isCheckingSession && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Checking login status...</p>
            </div>
          )}
          
          {!isCheckingSession && (
            <>
              {/* Form error - ENHANCED: make error more visible */}
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
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
                </div>
              )}
              
              {/* Google Signup Button */}
              <Button 
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 transition py-6 mb-6"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing up...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </div>
                )}
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm">
                  Have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
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

export default StepZero;
