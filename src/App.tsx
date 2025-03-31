
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/toaster'

// Pages
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import BillingInformation from './pages/BillingInformation'
import SupervisorDashboard from './pages/SupervisorDashboard'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
})

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('sb-didvmdhyxltjjnxlbmxy-auth-token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

// Supervisor route wrapper
function SupervisorRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('sb-didvmdhyxltjjnxlbmxy-auth-token');
  const credentials = localStorage.getItem('userCredentials');
  
  return token && credentials === 'supervisor' ? 
    <>{children}</> : 
    <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/billing-information" element={<ProtectedRoute><BillingInformation /></ProtectedRoute>} />
            <Route path="/supervisor" element={<SupervisorRoute><SupervisorDashboard /></SupervisorRoute>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
