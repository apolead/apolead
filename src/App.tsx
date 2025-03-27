
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ConfirmationScreen from "./components/signup/ConfirmationScreen";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Auth wrapper component to handle authenticated routes
const AuthRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    let mounted = true;
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in AuthRoute:", event, session?.user?.email);
      
      if (!mounted) return;
      
      // Redirect to home page on sign out
      if (event === 'SIGNED_OUT') {
        navigate('/');
        return;
      }
      
      if (session) {
        // Check application status in profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        console.log("User profile check:", profile, error);
        
        if (profile && profile.application_status === 'approved') {
          setIsAuthenticated(true);
          setIsApproved(true);
        } else if (profile) {
          // User exists but not approved
          setIsAuthenticated(true);
          setIsApproved(false);
        } else {
          // New user, should complete signup
          setIsAuthenticated(true);
          setIsApproved(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsApproved(false);
      }
      
      setIsLoading(false);
    });
    
    // Then check if there's an existing session
    const checkAuth = async () => {
      if (!mounted) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Checking session in AuthRoute:", !!session);
      
      if (session) {
        // Check application status in profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        console.log("Initial profile check:", profile, error);
        
        if (profile && profile.application_status === 'approved') {
          setIsAuthenticated(true);
          setIsApproved(true);
        } else if (profile) {
          // User exists but not approved
          setIsAuthenticated(true);
          setIsApproved(false);
        } else {
          // New user, should complete signup
          setIsAuthenticated(true);
          setIsApproved(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsApproved(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isApproved) {
    return <Navigate to="/signup" replace />;
  }
  
  return children;
};

// Public route component - redirects to dashboard if user is authenticated and approved
const PublicRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      if (!mounted) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check application status in profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (profile && profile.application_status === 'approved') {
          setIsAuthenticated(true);
          setIsApproved(true);
        } else {
          setIsAuthenticated(true);
          setIsApproved(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsApproved(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (isAuthenticated && isApproved) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isAuthenticated && !isApproved) {
    return <Navigate to="/signup" replace />;
  }
  
  return children;
};

const App = () => {
  // Handle URL fragment for auth
  useEffect(() => {
    // This helps ensure the supabase client processes any auth tokens in the URL
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in App:", event, session?.user?.email);
      
      // Redirect to home page on sign out
      if (event === 'SIGNED_OUT') {
        window.location.href = '/';
      }
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            } />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            } />
            <Route path="/confirmation" element={<ConfirmationScreen />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
