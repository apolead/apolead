
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StepZero = ({ userData, updateUserData, nextStep }) => {
  const [email, setEmail] = useState(userData.email || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@gmail\.com$/i;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValid(validateEmail(newEmail));
    setErrorMessage('');
  };
  
  const handleBackToHome = (e) => {
    e.preventDefault();
    navigate('/');
  };
  
  const handleContinue = async (e) => {
    e.preventDefault();
    
    if (!isValid) {
      setErrorMessage('Please enter a valid Gmail address (@gmail.com)');
      return;
    }
    
    setIsChecking(true);
    
    try {
      // Check if email exists in auth system
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If the OTP email was sent successfully, it means the email exists in the auth system
      if (!signInError) {
        setErrorMessage('This email is already registered in our system');
        setIsChecking(false);
        return;
      }
      
      // Double check with user_profiles
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (profileData) {
        setErrorMessage('This email is already registered in our system');
        setIsChecking(false);
        return;
      }
      
      // Check if email exists in user_applications
      const { data: applicationData } = await supabase
        .from('user_applications')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (applicationData) {
        setErrorMessage('An application with this email already exists');
        setIsChecking(false);
        return;
      }
      
      // If we reach here, email is available
      console.log('Email is available for use');
      updateUserData({ email });
      nextStep();
      
      toast({
        title: "Email confirmed",
        description: "Your Gmail address is valid and available for use.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error checking email:', error);
      setErrorMessage('Error validating email. Please try again.');
      setIsChecking(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <a 
            href="#" 
            onClick={handleBackToHome}
            className="inline-flex items-center text-white hover:text-white/80 mb-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </a>

          <h2 className="text-2xl font-bold mb-6">Join our Team!</h2>
          <p className="text-white/80 mb-6">Looking to make extra income? Join the ApoLead team and connect with incredible opportunities. Our simple application process takes just a few minutes.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">What you'll need to apply:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>A valid government ID</li>
              <li>Basic information about your computer setup</li>
              <li>Details about your previous experience (if any)</li>
              <li>A quiet place to work</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>By signing up, you agree to our <Link to="/terms" className="underline hover:text-white">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>.</p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "0%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Start Your Application</h2>
        <p className="text-gray-600 mb-6">Enter your Gmail address to begin the application process. This will be your login for future access.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full pr-10"
                placeholder="Enter your Gmail address"
                disabled={isChecking}
              />
              {email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">We only accept Gmail addresses (@gmail.com)</p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6"
            disabled={!isValid || isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : 'Next'}
          </Button>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default StepZero;
