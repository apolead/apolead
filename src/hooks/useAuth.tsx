
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Avoid Supabase deadlocks with setTimeout
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('application_status')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              if (error) throw error;
              
              if (profile) {
                if (profile.application_status === 'approved') {
                  setIsApproved(true);
                  
                  // Redirect to dashboard if currently on login or signup
                  const currentPath = window.location.pathname;
                  if (currentPath === '/login' || currentPath === '/signup') {
                    toast({
                      title: "Welcome back!",
                      description: "You've been logged in successfully.",
                    });
                    navigate('/dashboard');
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
            .select('application_status')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (error) throw error;
          
          if (profile) {
            if (profile.application_status === 'approved') {
              setIsApproved(true);
              
              // Redirect to dashboard if currently on login or signup
              const currentPath = window.location.pathname;
              if (currentPath === '/login' || currentPath === '/signup') {
                navigate('/dashboard');
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
  }, [navigate]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
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
    user,
    logout
  };
};
