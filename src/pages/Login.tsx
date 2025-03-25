
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Create supabase client with proper error handling for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Only create the client if we have the required values
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Success - redirect to dashboard or home
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check if Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-lg overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 bg-white flex flex-col">
          <div className="mb-8">
            {/* Logo */}
            <div className="mb-8">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" fill="#4F46E5" />
                <rect x="22" width="20" height="20" fill="#4F46E5" />
                <rect y="22" width="20" height="20" fill="#4F46E5" />
                <rect x="22" y="22" width="20" height="20" fill="#4F46E5" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Sign in to your ApoLead account</p>
            
            {/* Social Login */}
            <div className="flex justify-center mb-8">
              <button 
                className="flex items-center justify-center border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition w-full max-w-xs"
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
            
            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-600">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            {/* Form Fields */}
            <form onSubmit={handleSignIn} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <p className="text-center text-gray-600">
              Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
            </p>
          </div>
          
          <div className="mt-auto">
            <p className="text-center text-gray-500 text-sm">© 2025 Apolead, All rights Reserved</p>
          </div>
        </div>
        
        {/* Right Side - Visual */}
        <div className="hidden md:block w-1/2 bg-indigo-600 p-16 text-white relative">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Start Your Call Center Career Today</h2>
            <p className="opacity-80">Earn competitive commissions on credit sales</p>
          </div>
          
          {/* Dashboard Mockup */}
          <div className="bg-white rounded-lg shadow-xl p-4 text-black">
            <div className="mb-4">
              <h3 className="font-bold text-gray-700">Dashboard</h3>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Dec 17, 2024 - Jan 10, 2025</div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xs text-indigo-600">+3</span>
                  </div>
                  <button className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Add member</button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">Average Sales / Day</div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold">$1,450</div>
                  <div className="h-12 w-20 relative">
                    {/* Simple chart representation */}
                    <div className="absolute bottom-0 left-0 w-full flex items-end">
                      <div className="bg-indigo-200 w-3 h-5 mx-0.5 rounded-t"></div>
                      <div className="bg-indigo-300 w-3 h-7 mx-0.5 rounded-t"></div>
                      <div className="bg-indigo-400 w-3 h-9 mx-0.5 rounded-t"></div>
                      <div className="bg-indigo-500 w-3 h-6 mx-0.5 rounded-t"></div>
                      <div className="bg-indigo-600 w-3 h-10 mx-0.5 rounded-t"></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-600 mt-1">+24% commission rate</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">Monthly Commission</div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold">$3,250</div>
                  <div className="h-12 w-20 relative">
                    {/* Simple chart representation */}
                    <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                      <svg viewBox="0 0 80 48" className="w-full h-full">
                        <path d="M0,40 C20,35 40,15 80,20" stroke="#818CF8" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-600 mt-1">+15% from last month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
