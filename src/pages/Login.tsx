
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "Could not send password reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-xl rounded-lg overflow-hidden">
        {/* Left Side - Visual */}
        <div className="hidden md:block w-1/2 bg-indigo-600 p-16 text-white relative">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-xl font-semibold mb-3">Let's Keep Your Career Running</p>
            <p className="opacity-80 text-white">Manage your call center work seamlessly - online, remote, and everywhere in between.</p>
          </div>
          
          {/* Testimonial */}
          <div className="bg-indigo-700 rounded-lg p-5 mt-12">
            <p className="text-sm italic mb-3">"I'm impressed with how quickly I've seen sales since starting to use this platform. I began receiving clients and projects in the first week."</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold mr-2">
                S
              </div>
              <div>
                <p className="text-xs font-semibold">Sarah Johnson</p>
                <p className="text-xs opacity-75">Remote Agent</p>
              </div>
            </div>
          </div>
          
          {/* Bottom quote */}
          <div className="absolute bottom-16 left-16 right-16">
            <div className="border-t border-indigo-500 pt-4 text-sm italic">
              <p>"If you can build a great experience, customers will come back after their first call. Word of mouth is very powerful!"</p>
              <p className="mt-2 font-semibold">— Jeff Barnes</p>
            </div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col relative">
          {/* Back to Home Link */}
          <div className="absolute top-4 left-4">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <h2 className="text-3xl font-bold inline">
                <span className="text-black">Apo</span><span className="text-indigo-600">Lead</span>
              </h2>
            </div>

            <h1 className="text-2xl font-bold mb-2">Login to your account</h1>
            <p className="text-gray-600 mb-8">Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link></p>
            
            {/* Google Login */}
            <button 
              className="w-full mb-4 border border-gray-300 rounded-md py-3 flex items-center justify-center hover:bg-gray-50 transition"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>
              
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Forgot password?
                </button>
              </div>
              
              <Button 
                type="button" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2"
              >
                Login
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">We only support Gmail accounts at this time</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
