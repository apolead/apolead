
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setErrorMessage('Invalid or missing token or email');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the token is valid
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
          email: email,
        });

        if (error) {
          console.error('Token verification error:', error);
          setErrorMessage('This link is invalid or has expired');
          setIsVerifying(false);
          return;
        }

        setIsVerified(true);
        setIsVerifying(false);
      } catch (error) {
        console.error('Token verification error:', error);
        setErrorMessage('Failed to verify this link');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Complete the signup with the password
      const { error: signupError } = await supabase.auth.updateUser({
        password: password,
      });

      if (signupError) {
        throw signupError;
      }

      toast({
        title: "Password Set Successfully",
        description: "Your password has been set. You can now log in.",
      });

      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Error setting password:', error);
      setErrorMessage(error.message || 'Failed to set password. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Verifying your link...</h2>
          <p className="text-gray-600">Please wait while we verify your confirmation link.</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">{errorMessage || 'This confirmation link is invalid or has expired.'}</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-center">Set Your Password</h2>
        <p className="text-gray-600 mb-6 text-center">
          Your application has been approved! Create a password to complete your account setup.
        </p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10"
                placeholder="Enter password"
                minLength={6}
                required
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pr-10"
                placeholder="Confirm password"
                minLength={6}
                required
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Passwords must match</p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Password...
              </>
            ) : 'Set Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
