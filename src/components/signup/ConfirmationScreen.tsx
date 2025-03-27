
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ConfirmationScreen = () => {
  const [isApproved, setIsApproved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check the session to determine if application was approved
    const checkApplicationStatus = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('application_status')
            .eq('user_id', session.user.id)
            .single();
          
          if (userData && userData.application_status === 'rejected') {
            setIsApproved(false);
          } else {
            setIsApproved(true);
          }
        } else {
          // If no session found, redirect to homepage
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking application status:', error);
        // Default to approved view if there's an error
        setIsApproved(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApplicationStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span>
            <span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading your application status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className={`w-full md:w-1/3 ${isApproved ? 'bg-[#1A1F2C]' : 'bg-[#2C1A1A]'} text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden`}>
        {/* Geometric shapes with conditional colors */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${isApproved ? 'bg-[#00c2cb] opacity-10' : 'bg-[#cb0000] opacity-10'} rounded-full -translate-y-1/3 translate-x-1/3`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 ${isApproved ? 'bg-indigo-600 opacity-10' : 'bg-red-600 opacity-10'} rounded-full translate-y-1/3 -translate-x-1/3`}></div>
        <div className={`absolute top-1/2 left-1/3 w-40 h-40 ${isApproved ? 'bg-[#00c2cb] opacity-5' : 'bg-[#cb0000] opacity-5'} rotate-45`}></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>

          <h2 className="text-2xl font-bold mb-6">
            {isApproved ? 'Application Complete' : 'Application Status'}
          </h2>
          <p className="text-white/80 mb-6">
            {isApproved 
              ? "Thank you for applying to join our call center team at ApoLead." 
              : "Thank you for your interest in joining our team at ApoLead."}
          </p>
          
          <div className={`${isApproved ? 'bg-white/10' : 'bg-red-900/20'} rounded-lg p-4 backdrop-blur-sm mb-6`}>
            <h4 className="font-semibold mb-2">
              {isApproved ? "What's Next?" : "Application Status"}
            </h4>
            {isApproved ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>You will receive a confirmation email within 24 hours</li>
                <li>Our team will review your qualifications</li>
                <li>If you qualify, you'll receive next step instructions</li>
              </ul>
            ) : (
              <p className="text-sm">
                Based on the information provided, we're unable to move forward with your application at this time.
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>All information is securely stored and protected in accordance with data protection regulations.</p>
        </div>
      </div>
      
      {/* Right Side - Success or Rejection content */}
      <div className="w-full md:w-2/3 bg-white p-8 md:p-16 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span>
            <span className={isApproved ? "text-indigo-600" : "text-red-600"}>Lead</span>
          </h2>
        </div>
      
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
          <div className="mb-8">
            {isApproved ? (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <X className="h-10 w-10 text-red-600" />
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            {isApproved 
              ? "Thank You for Your Application!" 
              : "We're Unable to Proceed with Your Application"}
          </h2>
          
          <p className={`${isApproved ? "text-gray-600" : "text-red-600"} mb-6`}>
            {isApproved 
              ? "We appreciate your interest in joining our call center team at Apolead. Your application has been successfully submitted and is now being reviewed by our team."
              : "Unfortunately, based on the information provided, we're unable to move forward with your application at this time."}
          </p>
          
          {isApproved ? (
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 text-left mb-6 w-full">
              <h3 className="text-lg font-medium text-indigo-800 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span>You will receive a confirmation email within the next 24 hours.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span>Our team will review your qualifications and system requirements.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span>If you qualify, you'll receive instructions for the next steps in the process.</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-left mb-6 w-full">
              <h3 className="text-lg font-medium text-red-800 mb-3">Application Unsuccessful</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span>Your application doesn't meet our current requirements.</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span>This email address cannot be used for future applications.</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span>Please note that we do not send confirmation emails for unsuccessful applications.</span>
                </div>
              </div>
            </div>
          )}
          
          {isApproved ? (
            <p className="text-gray-600 mb-8">
              If you have any questions, please contact our support team at{' '}
              <a href="mailto:support@apolead.com" className="text-indigo-600 font-medium">
                support@apolead.com
              </a>
            </p>
          ) : (
            <p className="text-gray-600 mb-8">
              Thank you for your understanding. For any questions about our decision, please contact{' '}
              <a href="mailto:support@apolead.com" className="text-red-600 font-medium">
                support@apolead.com
              </a>
            </p>
          )}
          
          <Link to="/">
            <Button 
              className={`px-6 py-3 ${isApproved 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : "bg-red-600 hover:bg-red-700"} text-white`}
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
