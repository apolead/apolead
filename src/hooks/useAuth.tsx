
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
              // Simplified query - we don't need to use RLS here as we're only querying our own profile
              const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('application_status, credentials')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              if (error) throw error;
              
              if (profile) {
                if (profile.application_status === 'approved') {
                  setIsApproved(true);
                  setUserCredentials(profile.credentials || 'agent');
                  
                  // Redirect to dashboard if currently on login or signup
                  const currentPath = window.location.pathname;
                  if (currentPath === '/login' || currentPath === '/signup') {
                    toast({
                      title: "Welcome back!",
                      description: "You've been logged in successfully.",
                    });
                    
                    // Route based on credentials
                    if (profile.credentials === 'supervisor') {
                      navigate('/supervisor');
                    } else {
                      navigate('/dashboard');
                    }
                  }
                } else if (profile.application_status === 'rejected') {
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
                if (currentPath === '/login' || currentPath === '/') {
                  navigate('/signup');
                }
              }
            } catch (error) {
              console.error('Error checking profile:', error);
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
          
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('application_status, credentials')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (error) throw error;
          
          if (profile) {
            if (profile.application_status === 'approved') {
              setIsApproved(true);
              setUserCredentials(profile.credentials || 'agent');
              
              // Redirect to dashboard if currently on login or signup
              const currentPath = window.location.pathname;
              if (currentPath === '/login' || currentPath === '/signup') {
                // Route based on credentials
                if (profile.credentials === 'supervisor') {
                  navigate('/supervisor');
                } else {
                  navigate('/dashboard');
                }
              }
            } else if (profile.application_status === 'rejected') {
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
        if (mounted) setIsLoading(false);
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
