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
  const [checkedCredentials, setCheckedCredentials] = useState(false);
  
  useEffect(() => {
    console.log("SupervisorRoute check - User:", user?.id);
    console.log("SupervisorRoute check - Profile:", userProfile);
    console.log("SupervisorRoute check - Loading:", loading);
    console.log("SupervisorRoute check - Already checked:", checkedCredentials);
    
    if (!loading && userProfile && !checkedCredentials) {
      setCheckedCredentials(true);
      
      if (!user) {
        console.log("SupervisorRoute - No user, redirecting to login");
        navigate('/login', { replace: true });
      } 
      else if (userProfile.credentials !== 'supervisor') {
        console.log("SupervisorRoute - Not supervisor, redirecting to dashboard. Credentials:", userProfile.credentials);
        navigate('/dashboard', { replace: true });
      } else {
        console.log("SupervisorRoute - User is supervisor, staying on page");
      }
    }
  }, [user, userProfile, loading, navigate, checkedCredentials]);
  
  useEffect(() => {
    if (loading && user && !userProfile && !checkedCredentials) {
      console.log("SupervisorRoute - Attempting direct credentials check");
      
      const directCredentialCheck = async () => {
        try {
          const { data } = await supabase.functions.invoke('get_user_credentials', {
            body: { user_id: user.id }
          });
          
          console.log("Direct credential check result:", data);
          
          if (data !== 'supervisor') {
            console.log("SupervisorRoute - Direct check - Not supervisor, redirecting");
            navigate('/dashboard', { replace: true });
            setCheckedCredentials(true);
          } else {
            console.log("SupervisorRoute - Direct check - User is supervisor");
          }
        } catch (error) {
          console.error("Error in direct credential check:", error);
        }
      };
      
      const timeoutId = setTimeout(directCredentialCheck, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, user, userProfile, navigate, checkedCredentials]);
  
  if (loading || !userProfile) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (user && userProfile && userProfile.credentials === 'supervisor') ? children : null;
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
