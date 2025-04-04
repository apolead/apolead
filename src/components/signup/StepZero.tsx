
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StepZero = ({ userData, updateUserData, nextStep }) => {
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleContinue = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate email
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    // Check domain whitelist - including @apolead.com
    const isValidDomain = [
      '@gmail.com', 
      '@outlook.com', 
      '@hotmail.com', 
      '@yahoo.com',
      '@apolead.com' // Added support for company email
    ].some(domain => email.endsWith(domain));
    
    if (!isValidDomain) {
      setErrorMessage('Please use a supported email domain (Gmail, Outlook, Hotmail, Yahoo, or ApoLead)');
      return;
    }
    
    // Validate password
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    
    // Validate password confirmation
    if (password !== passwordConfirm) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const { data: existingUser, error: userCheckError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (existingUser?.user) {
        setErrorMessage('This email is already registered. Please login instead.');
        setIsLoading(false);
        return;
      }
      
      // Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setErrorMessage('This email is already registered. Please login instead.');
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }
      
      // Update the userData context
      updateUserData({ email, password });
      
      // Show success message
      toast({
        title: "Account created!",
        description: "Please continue with your application.",
      });
      
      // Move to next step
      nextStep();
    } catch (error) {
      console.error('Error during signup:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between">
        {/* Geometric shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <a 
            href="/"
            className="inline-flex items-center text-white hover:text-white/80 mb-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </a>

          <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
          <p className="text-white/80 mb-6">Create your account to start the application process and join our growing network of remote professionals.</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="bg-indigo-600/20 p-1 rounded mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Flexible Hours</h4>
                <p className="text-sm text-white/70">Work on your own schedule with our flexible time arrangements</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-indigo-600/20 p-1 rounded mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Competitive Pay</h4>
                <p className="text-sm text-white/70">Earn above-market rates based on your skills and performance</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-indigo-600/20 p-1 rounded mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Global Community</h4>
                <p className="text-sm text-white/70">Join professionals from over 30 countries in our diverse network</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>By continuing, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.</p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "10%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Create Your Account</h2>
        <p className="text-gray-600 mb-6">Enter your details below to begin your application process.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>
          
          <div>
            <Label htmlFor="passwordConfirm">Confirm Password</Label>
            <Input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm your password"
              className="mt-1"
              required
            />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Gmail, Outlook, Hotmail, Yahoo, and ApoLead email accounts are supported</p>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepZero;
