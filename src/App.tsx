
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
    // Only redirect after we've checked auth state
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
    // Only redirect after auth state check is complete
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return !user ? children : null;
};

// Protected route for supervisor access
const SupervisorRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("SupervisorRoute check - Profile:", userProfile);
    
    // Only redirect after we've checked auth state and loaded the user profile
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        console.log("SupervisorRoute - No user, redirecting to login");
        navigate('/login', { replace: true });
      } 
      // If authenticated but not a supervisor, redirect to dashboard
      else if (userProfile && userProfile.credentials !== 'supervisor') {
        console.log("SupervisorRoute - Not supervisor, redirecting to dashboard. Credentials:", userProfile.credentials);
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, userProfile, loading, navigate]);
  
  if (loading || !userProfile) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Only render if user is authenticated and has supervisor credentials
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
      {/* The "catch-all" route - this must be last */}
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
