
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(true); // Default to true
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
            setIsApproved(true); // Always approve to ensure dashboard access
            
            // Check if on login/signup page and redirect if needed
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/signup') {
              // Redirect them to dashboard
              if (userCredentials === 'supervisor') {
                navigate('/supervisor');
              } else {
                navigate('/dashboard');
              }
            }
            
            setIsLoading(false);
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
        setIsApproved(true); // Always approve to ensure dashboard access
        
        // Check if on login/signup page and redirect if needed
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/signup') {
          navigate('/dashboard');
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
  }, [navigate, userCredentials]);

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
