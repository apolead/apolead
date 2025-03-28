import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(true); // Default to true to prevent login issues
  const [userCredentials, setUserCredentials] = useState('agent');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let authSubscription = null;
    
    const initializeAuth = async () => {
      // Set up the auth state listener first
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (!mounted) return;
          
          if (session) {
            setUser(session.user);
            setIsAuthenticated(true);
            setIsApproved(true); // Always approve for dashboard access initially
            
            // Prevent Supabase deadlocks with setTimeout
            setTimeout(async () => {
              if (!mounted) return;
              
              try {
                // Use the edge functions to get user data
                const credentialsResponse = await supabase.functions.invoke('get_user_credentials', {
                  body: { user_id: session.user.id }
                });
                
                if (credentialsResponse.error) {
                  console.error('Error getting credentials:', credentialsResponse.error);
                  // Do not update state if there's an error; keep defaults
                } else {
                  // Set user credentials if successful
                  setUserCredentials(credentialsResponse.data || 'agent');
                }
                
                // Now check application status
                const statusResponse = await supabase.functions.invoke('get_application_status', {
                  body: { user_id: session.user.id }
                });
                
                if (statusResponse.error) {
                  console.error('Error checking application status:', statusResponse.error);
                  // Do not update approval state if there's an error; keep defaults
                } else if (statusResponse.data === 'rejected') {
                  // Only handle rejection explicitly
                  toast({
                    title: "Application Rejected",
                    description: "Unfortunately, your application didn't meet our qualifications.",
                    variant: "destructive",
                  });
                  
                  await supabase.auth.signOut();
                  setIsAuthenticated(false);
                  setIsApproved(false);
                  setUserCredentials('agent');
                  navigate('/login');
                }
                // For all other statuses (approved, pending, null), allow dashboard access
              } catch (error) {
                console.error('Error checking profile:', error);
                // Keep default values on error
              } finally {
                if (mounted) setIsLoading(false);
              }
            }, 0);
          } else {
            // Not authenticated
            setUser(null);
            setIsAuthenticated(false);
            setIsApproved(false);
            setUserCredentials('agent');
            setIsLoading(false);
            
            // Check if on protected route and redirect if needed
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/supervisor')) {
              navigate('/login');
            }
          }
        }
      );
      
      authSubscription = subscription;

      // Then check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        setIsApproved(true); // Default to approved
        
        try {
          // Fetch user data but don't block the initialization
          const credentialsPromise = supabase.functions.invoke('get_user_credentials', {
            body: { user_id: session.user.id }
          });
          
          const statusPromise = supabase.functions.invoke('get_application_status', {
            body: { user_id: session.user.id }
          });
          
          // Wait for both promises to complete
          const [credentialsResponse, statusResponse] = await Promise.allSettled([
            credentialsPromise, 
            statusPromise
          ]);
          
          // Handle credentials response
          if (credentialsResponse.status === 'fulfilled' && !credentialsResponse.value.error) {
            setUserCredentials(credentialsResponse.value.data || 'agent');
          }
          
          // Only handle rejection for application status
          if (statusResponse.status === 'fulfilled' && 
              !statusResponse.value.error && 
              statusResponse.value.data === 'rejected') {
            toast({
              title: "Application Rejected",
              description: "Unfortunately, your application didn't meet our qualifications.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setIsApproved(false);
            setUserCredentials('agent');
            navigate('/login');
          }
        } catch (error) {
          console.error('Error checking initial session profile:', error);
          // Keep default values on error
        }
      } else {
        // Not authenticated
        setUser(null);
        setIsAuthenticated(false);
        setIsApproved(false);
        setUserCredentials('agent');
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate, toast]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { 
    isLoading, 
    isAuthenticated, 
    isApproved, 
    userCredentials,
    user,
    logout
  };
};
