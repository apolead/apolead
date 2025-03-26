
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ConfirmationScreen = () => {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/3 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        {/* Geometric shapes */}
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

          <h2 className="text-2xl font-bold mb-6">Application Complete</h2>
          <p className="text-white/80 mb-6">Thank you for applying to join our call center team at ApoLead.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">What's Next?</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>You will receive a confirmation email within 24 hours</li>
              <li>Our team will review your qualifications</li>
              <li>If you qualify, you'll receive next step instructions</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>All information is securely stored and protected in accordance with data protection regulations.</p>
        </div>
      </div>
      
      {/* Right Side - Success content */}
      <div className="w-full md:w-2/3 bg-white p-8 md:p-16 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold inline">
            <span className="text-black">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
      
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Thank You for Your Application!</h2>
          <p className="text-gray-600 mb-6">
            We appreciate your interest in joining our call center team at Apolead. 
            Your application has been successfully submitted and is now being reviewed by our team.
          </p>
          
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 text-left mb-6 w-full">
            <h3 className="text-lg font-medium text-indigo-800 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>You will receive a confirmation email within the next 24 hours.</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Our team will review your qualifications and system requirements.</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>If you qualify, you'll receive instructions for the next steps in the process.</span>
              </li>
            </ul>
          </div>
          
          <p className="text-gray-600 mb-8">
            If you have any questions, please contact our support team at{' '}
            <a href="mailto:support@apolead.com" className="text-indigo-600 font-medium">
              support@apolead.com
            </a>
          </p>
          
          <Link to="/">
            <Button 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
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
