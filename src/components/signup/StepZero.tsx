
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const StepZero = ({ userData, updateUserData, nextStep, handleBackToHome }) => {
  const navigate = useNavigate();
  
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/signup`,
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error.message);
      }
    } catch (error) {
      console.error('Error in Google sign in:', error.message);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-8">
        <button 
          onClick={handleBackToHome}
          className="self-start mb-8 text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-center mb-2">Agent Application</h1>
        <p className="text-gray-600 text-center max-w-2xl mb-8">
          Welcome to ApoLead! To apply as a remote call center agent, please complete this application form. The process should take about 10-15 minutes.
        </p>
      </div>
      
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-6">Get Started</h2>
        
        <div className="space-y-6">
          <div>
            <p className="mb-4">
              First, please sign in with your Google account. This will allow us to save your application progress.
            </p>
            
            <Button
              onClick={signInWithGoogle}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 transition py-6"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </div>
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Already completed an application? If you've already submitted an application, please log in to check your status.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Login to see application status
            </Button>
          </div>
        </div>
        
        {userData.email && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-green-600 mb-4">
              <span className="font-semibold">Signed in as:</span> {userData.email}
            </p>
            <Button 
              onClick={nextStep}
              className="w-full"
            >
              Continue Application
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepZero;
