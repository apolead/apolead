import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Analytics } from "@vercel/analytics/react";
import { usePasswordResetDetection } from "./hooks/usePasswordResetDetection";

import Home from "./pages/Home";
import Agents from "./pages/Agents";
import Partners from "./pages/Partners";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConfirmationScreen from "./components/signup/ConfirmationScreen";
import BillingInformation from "./pages/BillingInformation";
import Scripting from "./pages/Scripting";
import AdditionalTraining from "./pages/AdditionalTraining";
import WaitlistConfirmed from "./pages/WaitlistConfirmed";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading, isRecoveryMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // CRITICAL: Don't redirect if we're in recovery mode or on the reset password page
    if (isRecoveryMode || location.pathname === '/reset-password' || window.__RECOVERY_MODE_ACTIVE) {
      console.log('ProtectedRoute: Recovery mode active, allowing access');
      return;
    }
    
    if (!loading && !user) {
      console.log('ProtectedRoute: No user and not loading, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate, isRecoveryMode, location.pathname]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Allow access if in recovery mode or on reset password page
  if (isRecoveryMode || location.pathname === '/reset-password' || window.__RECOVERY_MODE_ACTIVE) {
    return children;
  }
  
  return user ? children : null;
};

const AuthRoute = ({ children }) => {
  return (
    <ProtectedRoute>{children}</ProtectedRoute>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading, isRecoveryMode } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Don't redirect if we're in recovery mode or on reset password page
  if (isRecoveryMode || location.pathname === '/reset-password' || window.__RECOVERY_MODE_ACTIVE) {
    return children;
  }
  
  return children;
};

const SupervisorRoute = ({ children }) => {
  const { user, userProfile, loading, isRecoveryMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  useEffect(() => {
    // Don't check credentials if in recovery mode or on reset password page
    if (isRecoveryMode || location.pathname === '/reset-password') {
      setIsChecking(false);
      return;
    }
    
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
    
    if (checkAttempts > 3) {
      console.log("SupervisorRoute - Max check attempts reached, defaulting to agent");
      navigate('/dashboard', { replace: true });
      setIsChecking(false);
      return;
    }
    
    console.log("SupervisorRoute - User authenticated:", user.id);
    
    const checkCredentials = async () => {
      const cachedData = localStorage.getItem('tempCredentials');
      if (cachedData) {
        try {
          const { userId, credentials, timestamp } = JSON.parse(cachedData);
          const isValid = Date.now() - timestamp < 30 * 60 * 1000;
          
          if (isValid && userId === user.id) {
            console.log('SupervisorRoute - Using cached credentials:', credentials);
            if (credentials === 'supervisor') {
              setIsSupervisor(true);
              setIsChecking(false);
              return;
            }
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
      
      try {
        console.log('Checking supervisor status for user ID:', user.id);
        const { data: isSupervisor, error: supervisorError } = await supabase.rpc('is_supervisor', {
          check_user_id: user.id
        });
        
        if (supervisorError) {
          console.error('Supervisor check error:', supervisorError);
          setCheckAttempts(prev => prev + 1);
          return;
        } 
        
        console.log('SupervisorRoute - Is supervisor check result:', isSupervisor);
        
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
      }
      
      if (userProfile && userProfile.credentials) {
        console.log("SupervisorRoute - User profile available, credentials:", userProfile.credentials);
        
        if (userProfile.credentials === 'supervisor') {
          console.log("SupervisorRoute - Confirmed supervisor via profile");
          setIsSupervisor(true);
          
          localStorage.setItem('tempCredentials', JSON.stringify({
            userId: user.id,
            credentials: 'supervisor',
            timestamp: Date.now()
          }));
          
          setIsChecking(false);
          return;
        } else {
          console.log("SupervisorRoute - Not a supervisor (via profile), redirecting");
          navigate('/dashboard', { replace: true });
          setIsChecking(false);
          return;
        }
      }
      
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
        setCheckAttempts(prev => prev + 1);
      }
    };
    
    checkCredentials();
  }, [user, userProfile, loading, navigate, checkAttempts, isRecoveryMode, location.pathname]);
  
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-medium">Verifying credentials...</div>
        <div className="text-sm text-gray-500">Please wait</div>
      </div>
    </div>;
  }
  
  // Allow access if in recovery mode
  if (isRecoveryMode || location.pathname === '/reset-password' || window.__RECOVERY_MODE_ACTIVE) {
    return children;
  }
  
  return isSupervisor ? children : null;
};

const AuthWrapper = () => {
  // Run password reset detection first, before any other routing logic
  usePasswordResetDetection();

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />
      <Route path="/agents" element={
        <PublicRoute>
          <Agents />
        </PublicRoute>
      } />
      <Route path="/partners" element={
        <PublicRoute>
          <Partners />
        </PublicRoute>
      } />
      <Route path="/contact" element={
        <PublicRoute>
          <Contact />
        </PublicRoute>
      } />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      <Route path="/scripting" element={
        <AuthRoute>
          <Scripting />
        </AuthRoute>
      } />
      <Route path="/additional-training" element={
        <AuthRoute>
          <AdditionalTraining />
        </AuthRoute>
      } />
      <Route path="/waitlist-confirmed" element={<WaitlistConfirmed />} />
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
            <Analytics />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
