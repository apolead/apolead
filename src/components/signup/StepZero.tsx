
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const StepZero = ({ userData, updateUserData, nextStep }) => {
  const [email, setEmail] = useState(userData.email || '');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage('Only Gmail accounts are allowed');
      setIsSubmitting(false);
      return;
    }

    if (email !== confirmEmail) {
      setErrorMessage('Email addresses do not match');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      // Update user data in context
      updateUserData({ email });

      toast({
        title: "Sign up successful!",
        description: "Please check your email for a confirmation link",
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error('Error during signup:', error);
      setErrorMessage(error.message || 'An error occurred during sign up');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
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

          <h2 className="text-3xl font-bold mb-6">Join ApoLead</h2>
          <p className="text-white/80 mb-6">Create your account to get started with ApoLead. We'll guide you through the application process step by step.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">What to expect</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Create your account with email and password</li>
              <li>Verify your email address</li>
              <li>Complete the onboarding process</li>
              <li>Access training and resources</li>
              <li>Schedule an interview</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>All information is securely stored and protected in accordance with data protection regulations.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "25%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Create Your Account</h2>
        <p className="text-gray-600 mb-6">Enter your details to sign up. You'll need to verify your email before proceeding.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address (Gmail only)</label>
            <Input
              type="email"
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder="youremail@gmail.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">Confirm Email Address</label>
            <Input
              type="email"
              id="confirmEmail" 
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full"
              placeholder="youremail@gmail.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="Create a secure password"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <Input
              type="password"
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <div className="mt-2">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </div>
              ) : "Create Account"}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepZero;
