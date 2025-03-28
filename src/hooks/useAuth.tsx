
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
              
              if (credentialsResponse.error) {
                console.error('Error getting credentials:', credentialsResponse.error);
                throw new Error('Error checking user credentials');
              }
              
              if (statusResponse.error) {
                console.error('Error getting status:', statusResponse.error);
                throw new Error('Error checking application status');
              }
              
              const credentials = credentialsResponse.data;
              const appStatus = statusResponse.data;
              
              console.log('Parsed credentials:', credentials);
              console.log('Parsed application status:', appStatus);
              
              if (appStatus) {
                if (appStatus === 'approved') {
                  setIsApproved(true);
                  setUserCredentials(credentials || 'agent');
                  
                  // Redirect to dashboard if currently on login or signup
                  const currentPath = window.location.pathname;
                  if (currentPath === '/login' || currentPath === '/signup') {
                    toast({
                      title: "Welcome back!",
                      description: "You've been logged in successfully.",
                    });
                    
                    // Route based on credentials
                    if (credentials === 'supervisor') {
                      navigate('/supervisor');
                    } else {
                      navigate('/dashboard');
                    }
                  }
                } else if (appStatus === 'rejected') {
                  toast({
                    title: "Application Rejected",
                    description: "Unfortunately, your application didn't meet our qualifications.",
                    variant: "destructive",
                  });
                  await supabase.auth.signOut();
                  setIsAuthenticated(false);
                  setIsApproved(false);
                  setUserCredentials('agent');
                  // Stay on current page after showing rejection message
                } else {
                  // User exists but not approved, redirect to signup
                  setIsApproved(false);
                  const currentPath = window.location.pathname;
                  if (currentPath === '/login') {
                    navigate('/signup');
                  }
                }
              } else {
                // No profile found, but authenticated - redirect to signup
                setIsApproved(false);
                const currentPath = window.location.pathname;
                if (currentPath === '/login') {
                  navigate('/signup');
                }
              }
            } catch (error) {
              console.error('Error checking profile:', error);
              // Default to not approved on error
              setIsApproved(false);
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
          
          // Use edge functions to get user data
          try {
            const credentialsResponse = await supabase.functions.invoke('get_user_credentials', {
              body: { user_id: session.user.id }
            });
            
            const statusResponse = await supabase.functions.invoke('get_application_status', {
              body: { user_id: session.user.id }
            });
            
            console.log('Initial credentials response:', credentialsResponse);
            console.log('Initial status response:', statusResponse);
            
            if (credentialsResponse.error) {
              console.error('Error getting initial credentials:', credentialsResponse.error);
              throw new Error('Error checking user credentials');
            }
            
            if (statusResponse.error) {
              console.error('Error getting initial status:', statusResponse.error);
              throw new Error('Error checking application status');
            }
            
            const credentials = credentialsResponse.data;
            const appStatus = statusResponse.data;
            
            console.log('Initial parsed credentials:', credentials);
            console.log('Initial parsed application status:', appStatus);
            
            if (appStatus) {
              if (appStatus === 'approved') {
                setIsApproved(true);
                setUserCredentials(credentials || 'agent');
                
                // Redirect to dashboard if currently on login or signup
                const currentPath = window.location.pathname;
                if (currentPath === '/login' || currentPath === '/signup') {
                  // Route based on credentials
                  if (credentials === 'supervisor') {
                    navigate('/supervisor');
                  } else {
                    navigate('/dashboard');
                  }
                }
              } else if (appStatus === 'rejected') {
                toast({
                  title: "Application Rejected",
                  description: "Unfortunately, your application didn't meet our qualifications.",
                  variant: "destructive",
                });
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setIsApproved(false);
                setUserCredentials('agent');
              } else {
                // User exists but not approved, redirect to signup
                setIsApproved(false);
                const currentPath = window.location.pathname;
                if (currentPath === '/login') {
                  navigate('/signup');
                }
              }
            } else {
              // No profile found, but authenticated - redirect to signup
              setIsApproved(false);
              const currentPath = window.location.pathname;
              if (currentPath === '/login') {
                navigate('/signup');
              }
            }
          } catch (error) {
            console.error('Error checking initial session profile:', error);
            // Default to not approved on error
            setIsApproved(false);
          } finally {
            if (mounted) setIsLoading(false);
          }
        } else {
          // Not authenticated
          setUser(null);
          setIsAuthenticated(false);
          setIsApproved(false);
          setUserCredentials('agent');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
