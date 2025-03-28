
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Function to handle profile check and redirection
    const checkProfileAndRedirect = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('application_status, credentials')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!profile) {
          // No profile means new user - redirect to signup
          navigate('/signup');
          return;
        }
        
        if (profile.application_status === 'approved') {
          // Redirect based on credentials
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
          // Pending or other status - continue with signup
          navigate('/signup');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        toast({
          title: "Error",
          description: "There was a problem checking your profile. Please try again.",
          variant: "destructive",
        });
      }
    };

    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (!mounted) return;
          
          if (session?.user) {
            await checkProfileAndRedirect(session.user.id);
          } else {
            navigate('/login');
          }
          
          setIsSessionChecking(false);
        }
      );

      return subscription;
    };

    // Initial session check
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          await checkProfileAndRedirect(session.user.id);
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsSessionChecking(false);
        }
      }
    };

    const subscription = setupAuthListener();
    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isLoading, isSessionChecking };
};
