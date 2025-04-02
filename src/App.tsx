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
import BillingInformation from "./pages/BillingInformation";

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

// Completely revised SupervisorRoute with improved credential checking and error handling
const SupervisorRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  useEffect(() => {
    // First, make sure we have user information before checking credentials
    if (loading) {
      console.log("SupervisorRoute - Still loading auth state");
      return;
    }
    
    if (!user) {
      console.log("SupervisorRoute - No user, redirecting to login");
      navigate('/login', { replace: true });
      setIsChecking(false);
      return;
    }
    
    // Multiple retry attempts for better reliability
    if (checkAttempts > 3) {
      console.log("SupervisorRoute - Max check attempts reached, defaulting to agent");
      navigate('/dashboard', { replace: true });
      setIsChecking(false);
      return;
    }
    
    console.log("SupervisorRoute - User authenticated:", user.id);
    
    const checkCredentials = async () => {
      // 1. First check cached credentials in localStorage (fastest)
      const cachedData = localStorage.getItem('tempCredentials');
      if (cachedData) {
        try {
          const { userId, credentials, timestamp } = JSON.parse(cachedData);
          // Check if cache is valid (30 minutes validity)
          const isValid = Date.now() - timestamp < 30 * 60 * 1000;
          
          if (isValid && userId === user.id) {
            console.log('SupervisorRoute - Using cached credentials:', credentials);
            if (credentials === 'supervisor') {
              setIsSupervisor(true);
              setIsChecking(false);
              return;
            }
            // If cached credentials indicate not a supervisor, redirect now
            if (credentials === 'agent') {
              console.log("SupervisorRoute - Cached credentials show not supervisor, redirecting");
              navigate('/dashboard', { replace: true });
              setIsChecking(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing cached credentials:', e);
          localStorage.removeItem('tempCredentials');
        }
      }
      
      // 2. Try the is_supervisor function (now that it's fixed)
      try {
        console.log('Checking supervisor status for user ID:', user.id);
        const { data: isSupervisor, error: supervisorError } = await supabase.rpc('is_supervisor', {
          check_user_id: user.id
        });
        
        if (supervisorError) {
          console.error('Supervisor check error:', supervisorError);
          // Fall back to next method if error
          setCheckAttempts(prev => prev + 1);
          return;
        } 
        
        console.log('SupervisorRoute - Is supervisor check result:', isSupervisor);
        
        // Cache this result
        localStorage.setItem('tempCredentials', JSON.stringify({
          userId: user.id,
          credentials: isSupervisor ? 'supervisor' : 'agent',
          timestamp: Date.now()
        }));
        
        if (isSupervisor) {
          console.log("SupervisorRoute - Confirmed supervisor role");
          setIsSupervisor(true);
          setIsChecking(false);
          return;
        } else {
          console.log("SupervisorRoute - Not a supervisor, redirecting");
          navigate('/dashboard', { replace: true });
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.error('Error checking supervisor status:', error);
        // Continue to the next approach if this fails
      }
      
      // 3. Next, check userProfile if available
      if (userProfile && userProfile.credentials) {
        console.log("SupervisorRoute - User profile available, credentials:", userProfile.credentials);
        
        if (userProfile.credentials === 'supervisor') {
          console.log("SupervisorRoute - Confirmed supervisor via profile");
          setIsSupervisor(true);
          
          // Cache this result
          localStorage.setItem('tempCredentials', JSON.stringify({
            userId: user.id,
            credentials: 'supervisor',
            timestamp: Date.now()
          }));
          
          setIsChecking(false);
          return;
        } else {
          // If profile exists with non-supervisor credentials, redirect now
          console.log("SupervisorRoute - Not a supervisor (via profile), redirecting");
          navigate('/dashboard', { replace: true });
          setIsChecking(false);
          return;
        }
      }
      
      // 4. As a last resort, call the edge function
      try {
        console.log("SupervisorRoute - Trying get_user_credentials RPC");
        const { data, error } = await (supabase.rpc as any)('get_user_credentials', {
          user_id: user.id
        });
        
        if (error) {
          console.error("SupervisorRoute - get_user_credentials error:", error);
          setCheckAttempts(prev => prev + 1);
          return;
        }
        
        console.log("SupervisorRoute - get_user_credentials returned:", data);
        
        // Cache the credentials result
        localStorage.setItem('tempCredentials', JSON.stringify({
          userId: user.id,
          credentials: data,
          timestamp: Date.now()
        }));
        
        if (data === 'supervisor') {
          console.log("SupervisorRoute - Confirmed supervisor via get_user_credentials");
          setIsSupervisor(true);
          setIsChecking(false);
        } else {
          console.log("SupervisorRoute - Not supervisor via get_user_credentials, redirecting");
          navigate('/dashboard', { replace: true });
          setIsChecking(false);
        }
      } catch (error) {
        console.error("SupervisorRoute - Exception checking credentials:", error);
        // Increment attempt counter but don't redirect yet, let it try again
        setCheckAttempts(prev => prev + 1);
      }
    };
    
    checkCredentials();
  }, [user, userProfile, loading, navigate, checkAttempts]);
  
  // Show loading while checking credentials
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-medium">Verifying credentials...</div>
        <div className="text-sm text-gray-500">Please wait</div>
      </div>
    </div>;
  }
  
  // Show children only if confirmed as supervisor
  return isSupervisor ? children : null;
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
      <Route path="/billing" element={
        <AuthRoute>
          <BillingInformation />
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
