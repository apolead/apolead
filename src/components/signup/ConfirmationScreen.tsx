
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ConfirmationScreen = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl mx-auto text-center">
      <div className="mb-8 pt-6">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
          <circle cx="32" cy="32" r="32" fill="#4F46E5" opacity="0.1"/>
          <path d="M44 24L28 40L20 32" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Thank You for Your Application!</h2>
      <p className="text-gray-600 mb-6">
        We appreciate your interest in joining our call center team at Apolead. 
        Your application has been successfully submitted and is now being reviewed by our team.
      </p>
      
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 text-left mb-6">
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
            <span>If you qualify, you'll receive instructions for the next steps in the process, including training and onboarding.</span>
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
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
        >
          Return to Home
        </Button>
      </Link>
    </div>
  );
};

export default ConfirmationScreen;
