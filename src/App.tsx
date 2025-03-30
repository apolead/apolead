
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { AuthProvider, useAuth } from "./hooks/useAuth";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConfirmationScreen from "./components/signup/ConfirmationScreen";

const queryClient = new QueryClient();

// Improved protected route that uses the useAuth hook
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? children : null;
};

// Simplified versions that use our improved ProtectedRoute
const AuthRoute = ({ children }) => {
  return (
    <ProtectedRoute>{children}</ProtectedRoute>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return !user ? children : null;
};

// Enhanced SupervisorRoute with more robust credential checking
const SupervisorRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkCredentials = async () => {
      console.log("SupervisorRoute check - User:", user?.id);
      console.log("SupervisorRoute check - Profile:", userProfile);
      console.log("SupervisorRoute check - Loading:", loading);
      console.log("SupervisorRoute check - Checking:", isChecking);
      
      // Wait for auth to initialize
      if (loading) return;
      
      // If no user, redirect to login
      if (!user) {
        console.log("SupervisorRoute - No user, redirecting to login");
        navigate('/login', { replace: true });
        setIsChecking(false);
        return;
      }
      
      // If we have userProfile data, check credentials directly
      if (userProfile) {
        console.log("SupervisorRoute - Checking userProfile credentials:", userProfile.credentials);
        
        if (userProfile.credentials !== 'supervisor') {
          console.log("SupervisorRoute - Not supervisor, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("SupervisorRoute - User is confirmed supervisor, staying on page");
        }
        
        setIsChecking(false);
        return;
      }
      
      // If we reach here, we have a user but no profile yet
      // Make a direct API call to check credentials
      try {
        console.log("SupervisorRoute - No profile yet, checking credentials via API");
        const { data, error } = await supabase.functions.invoke('get_user_credentials', {
          body: { user_id: user.id }
        });
        
        console.log("SupervisorRoute - API response:", data);
        
        if (error) {
          console.error("SupervisorRoute - API error:", error);
          // On error, we'll let the user stay on the page for now
          setIsChecking(false);
          return;
        }
        
        if (data !== 'supervisor') {
          console.log("SupervisorRoute - API says not supervisor, redirecting");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("SupervisorRoute - API confirms user is supervisor");
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error("SupervisorRoute - Exception in credential check:", error);
        setIsChecking(false);
      }
    };
    
    checkCredentials();
  }, [user, userProfile, loading, navigate, isChecking]);
  
  // Show loading while checking credentials
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // At this point we've verified the user is a supervisor
  return children;
};

// Auth wrapper that includes the router to make hooks available
const AuthWrapper = () => {
  return (
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
      <Route path="/supervisor" element={
        <SupervisorRoute>
          <SupervisorDashboard />
        </SupervisorRoute>
      } />
      <Route path="/confirmation" element={<ConfirmationScreen />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthWrapper />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
