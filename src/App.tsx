import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConfirmationScreen from "./components/signup/ConfirmationScreen";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const AuthRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in AuthRoute:", event, session?.user?.email);
      
      if (!mounted) return;
      
      if (session) {
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
          setIsAuthenticated(true);
          setIsApproved(false);
        } else {
          setIsAuthenticated(true);
          setIsApproved(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsApproved(false);
      }
      
      setIsLoading(false);
    });
    
    const checkAuth = async () => {
      if (!mounted) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Checking session in AuthRoute:", !!session);
      
      if (session) {
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
          setIsAuthenticated(true);
          setIsApproved(false);
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
      subscription.unsubscribe();
    };
  }, []);
  
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
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in App:", event, session?.user?.email);
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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
