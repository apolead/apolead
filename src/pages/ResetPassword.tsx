
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if session is valid
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!session) {
          toast({
            title: "Session expired",
            description: "Your password reset session has expired. Please request a new reset link.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        setIsSessionValid(true);
      } catch (error) {
        console.error('Error checking session:', error);
        toast({
          title: "Authentication error",
          description: "There was an error verifying your session. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  // Countdown for redirection after successful reset
  useEffect(() => {
    let timer;
    
    if (isSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSuccess, navigate]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated successfully",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Reset failed",
        description: error.message || "An error occurred while resetting your password",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg font-medium">Verifying your session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="hidden md:block w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>

          <h2 className="text-2xl font-bold mb-6">Reset Your Password</h2>
          <p className="text-white/80 mb-6">
            Create a strong password that you don't use for other websites. A strong password includes a mix of letters, numbers, and symbols.
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Password Tips:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Use at least 8 characters</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Add numbers and special characters</li>
              <li>Don't use personal information</li>
              <li>Avoid common words or patterns</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>© 2025 ApoLead. All rights reserved.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        {isSuccess ? (
          <div className="text-center p-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page in {countdown} seconds...
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Login Now
            </Button>
          </div>
        ) : isSessionValid ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Create New Password</h2>
            <p className="text-gray-600 mb-8">Please enter and confirm your new password</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm new password"
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </div>
                ) : 'Reset Password'}
              </Button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                Remember your password? <Link to="/login" className="text-indigo-600 hover:text-indigo-800">Sign in</Link>
              </p>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResetPassword;
