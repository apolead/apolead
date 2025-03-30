
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

// Improved protected route that uses the useAuth hook - must be used within AuthContext
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

// Route wrapper components that use ProtectedRoute - must be used within AuthContext
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
  return <AuthRoute>{children}</AuthRoute>;
};

// Auth wrapper that includes the router to make hooks available
// IMPORTANT: This component is now defined inside App to ensure it's within AuthProvider
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Using BrowserRouter with basename set to prevent refresh issues */}
        <BrowserRouter basename="/">
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
