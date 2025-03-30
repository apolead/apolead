
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

// Fixed SupervisorRoute to properly handle credential checking
const SupervisorRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkCredentials = async () => {
      // Don't do anything until auth is initialized and we have user data
      if (loading) {
        console.log("SupervisorRoute - Still loading auth state");
        return;
      }
      
      // If no user, redirect to login
      if (!user) {
        console.log("SupervisorRoute - No user, redirecting to login");
        navigate('/login', { replace: true });
        setIsChecking(false);
        return;
      }
      
      console.log("SupervisorRoute - User authenticated:", user.id);
      
      // Check userProfile if available
      if (userProfile) {
        console.log("SupervisorRoute - User profile available:", userProfile);
        console.log("SupervisorRoute - User credentials:", userProfile.credentials);
        
        if (userProfile.credentials !== 'supervisor') {
          console.log("SupervisorRoute - Not a supervisor, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("SupervisorRoute - Confirmed supervisor via profile");
        }
        
        setIsChecking(false);
        return;
      }
      
      console.log("SupervisorRoute - No user profile loaded yet, checking via API");
      
      // Call the edge function directly as a fallback
      try {
        const { data, error } = await supabase.functions.invoke('get_user_credentials', {
          body: { user_id: user.id }
        });
        
        if (error) {
          console.error("SupervisorRoute - API error:", error);
          // Default to dashboard on error
          navigate('/dashboard', { replace: true });
          setIsChecking(false);
          return;
        }
        
        console.log("SupervisorRoute - API returned credentials:", data);
        
        if (data !== 'supervisor') {
          console.log("SupervisorRoute - API says not supervisor, redirecting");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("SupervisorRoute - API confirmed supervisor role");
          // Cache this result locally to avoid repeated API calls
          localStorage.setItem('tempCredentials', JSON.stringify({
            userId: user.id,
            credentials: 'supervisor',
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error("SupervisorRoute - Exception checking credentials:", error);
        navigate('/dashboard', { replace: true });
      }
      
      setIsChecking(false);
    };
    
    checkCredentials();
  }, [user, userProfile, loading, navigate]);
  
  // Show loading while checking credentials
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-medium">Verifying credentials...</div>
        <div className="text-sm text-gray-500">Please wait</div>
      </div>
    </div>;
  }
  
  // At this point we've verified the user can access this route
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
