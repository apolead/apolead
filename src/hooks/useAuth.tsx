
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [userCredentials, setUserCredentials] = useState('agent');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // DEFAULT TO APPROVED STATUS - even before checking
          setIsApproved(true);
          
          // Avoid Supabase deadlocks with setTimeout
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              // Use the edge functions to get user data
              const credentialsResponse = await supabase.functions.invoke('get_user_credentials', {
                body: { user_id: session.user.id }
              });
              
              const statusResponse = await supabase.functions.invoke('get_application_status', {
                body: { user_id: session.user.id }
              });
              
              console.log('Credentials response:', credentialsResponse);
              console.log('Status response:', statusResponse);
              
              // If there's a credentials error, we default to agent and approved
              if (credentialsResponse.error) {
                console.error('Error getting credentials:', credentialsResponse.error);
                setUserCredentials('agent');
                setIsLoading(false);
                return;
              }
              
              // If there's a status error, we default to approved
              if (statusResponse.error) {
                console.error('Error getting status:', statusResponse.error);
                setUserCredentials(credentialsResponse.data || 'agent');
                setIsLoading(false);
                return;
              }
              
              const credentials = credentialsResponse.data;
              const appStatus = statusResponse.data;
              
              console.log('Parsed credentials:', credentials);
              console.log('Parsed application status:', appStatus);
              
              // Set user credentials
              setUserCredentials(credentials || 'agent');
              
              // Only handle the rejected status specifically
              if (appStatus === 'rejected') {
                toast({
                  title: "Application Rejected",
                  description: "Unfortunately, your application didn't meet our qualifications.",
                  variant: "destructive",
                });
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setIsApproved(false);
                setUserCredentials('agent');
              }
              
              // For all other statuses (approved, pending, null, etc), allow access to the dashboard
              
            } catch (error) {
              console.error('Error checking profile:', error);
              // Default to approved on error for better UX
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
          if (currentPath === '/dashboard' || currentPath === '/supervisor') {
            navigate('/login');
          }
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // DEFAULT TO APPROVED STATUS - even before checking
          setIsApproved(true);
          
          // The rest is for tracking purposes only
          try {
            const credentialsResponse = await supabase.functions.invoke('get_user_credentials', {
              body: { user_id: session.user.id }
            });
            
            const statusResponse = await supabase.functions.invoke('get_application_status', {
              body: { user_id: session.user.id }
            });
            
            console.log('Initial credentials response:', credentialsResponse);
            console.log('Initial status response:', statusResponse);
            
            // Set credentials if available
            if (!credentialsResponse.error) {
              setUserCredentials(credentialsResponse.data || 'agent');
            }
            
            // Only check for rejected status
            if (!statusResponse.error && statusResponse.data === 'rejected') {
              toast({
                title: "Application Rejected",
                description: "Unfortunately, your application didn't meet our qualifications.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setIsApproved(false);
              setUserCredentials('agent');
            }
            
          } catch (error) {
            console.error('Error checking initial session profile:', error);
            // Just log error, don't change default approved status
          }
        } else {
          // Not authenticated
          setUser(null);
          setIsAuthenticated(false);
          setIsApproved(false);
          setUserCredentials('agent');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
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
