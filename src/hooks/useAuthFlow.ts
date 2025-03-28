
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthFlow = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCheckTimedOut, setSessionCheckTimedOut] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let sessionCheckTimeout: ReturnType<typeof setTimeout>;

    const checkSession = async () => {
      try {
        if (!mounted) return;

        // Set a timeout for session checking to prevent UI from being stuck
        sessionCheckTimeout = setTimeout(() => {
          if (mounted) {
            console.log('Session check timed out');
            setSessionCheckTimedOut(true);
            setIsCheckingSession(false);
          }
        }, 5000);

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session?.user?.email || 'No session');

        if (session?.user && mounted) {
          // Check user profile
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('application_status, credentials')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          console.log('User profile:', profile, error);

          if (profile) {
            setUser({
              ...session.user,
              profile
            });

            // Handle routing based on application status
            if (profile.application_status === 'approved') {
              if (profile.credentials === 'supervisor') {
                navigate('/supervisor');
              } else {
                navigate('/dashboard');
              }
            } else if (profile.application_status === 'rejected') {
              toast({
                title: "Application Rejected",
                description: "Unfortunately, your application didn't meet our qualifications.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
              navigate('/login');
            } else {
              // Application is pending or new user with profile
              navigate('/signup');
            }
          } else {
            // User is authenticated but doesn't have a profile
            setUser(session.user);
            navigate('/signup');
          }
        } else if (mounted) {
          setUser(null);
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsCheckingSession(false);
        }
      } finally {
        clearTimeout(sessionCheckTimeout);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN') {
          // Re-check session after sign in
          await checkSession();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        }
      }
    );

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(sessionCheckTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleCancelSessionCheck = () => {
    setSessionCheckTimedOut(true);
    setIsCheckingSession(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      
      const siteUrl = window.location.origin;
      
      // Sign out before signing in to ensure a fresh authentication
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/signup`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent',
          }
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to sign up with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      const siteUrl = window.location.origin;
      
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent',
          }
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isCheckingSession,
    sessionCheckTimedOut,
    user,
    handleCancelSessionCheck,
    handleGoogleSignUp,
    handleGoogleSignIn
  };
};
