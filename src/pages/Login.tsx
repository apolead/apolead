
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
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

          <h2 className="text-3xl font-bold mb-6 text-white">Welcome Back!</h2>
          <p className="text-xl font-semibold mb-3 text-white">Let's Keep Your Career Running</p>
          <p className="text-white">Manage your call center work seamlessly - online, remote, and everywhere in between.</p>
        </div>
        
        <div className="mt-auto relative z-10">
          <div className="bg-indigo-800 bg-opacity-70 rounded-lg p-5 mb-8">
            <p className="text-sm italic mb-3 text-white">"I'm impressed with how quickly I've seen sales since starting to use this platform. I began receiving clients and projects in the first week."</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold mr-2">
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sarah Johnson</p>
                <p className="text-xs opacity-75 text-white">Remote Agent</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-indigo-500 pt-4 text-sm italic">
            <p className="text-white">"If you can build a great experience, customers will come back after their first call. Word of mouth is very powerful!"</p>
            <p className="mt-2 font-semibold text-white">— Alex W.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold inline">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>

          <h1 className="text-2xl font-bold mb-2">Login to your account</h1>
          <p className="text-gray-600 mb-8">Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link></p>
          
          <Button 
            className="w-full mb-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 transition py-6"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </div>
            )}
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">We only support Google authentication</p>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
