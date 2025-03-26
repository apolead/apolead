
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const StepOne = ({ userData, updateUserData, nextStep, prevStep }) => {
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleContinue = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.birthDay) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    // Email validation
    if (userData.email !== userData.confirmEmail) {
      setErrorMessage('Email addresses do not match');
      return;
    }
    
    // Continue to next step
    nextStep();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateUserData({ govIdImage: file });
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/3 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10 mt-16">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>

          <h2 className="text-2xl font-bold mb-6">Step 1 of 4: Personal Details</h2>
          <p className="text-white/80 mb-6">We need your basic personal information to get started with your application.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Why we need this information</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To verify your identity</li>
              <li>To comply with work regulations</li>
              <li>To ensure you receive appropriate compensation</li>
              <li>To communicate with you about your application</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>All information is securely stored and protected in accordance with data protection regulations.</p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full md:w-2/3 bg-white p-8 md:p-16 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-black">Apo</span><span className="text-[#7450fc]">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-[#7450fc] h-2 rounded-full" style={{ width: "33.3%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
        <p className="text-gray-600 mb-6">Please provide your personal details to continue with the application process.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleContinue} className="space-y-5">
          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="step1-firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <Input
                type="text"
                id="step1-firstName" 
                value={userData.firstName}
                onChange={(e) => updateUserData({ firstName: e.target.value })}
                className="w-full"
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label htmlFor="step1-lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <Input
                type="text"
                id="step1-lastName" 
                value={userData.lastName}
                onChange={(e) => updateUserData({ lastName: e.target.value })}
                className="w-full"
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          {/* Email and Confirm Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="step1-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input
                type="email"
                id="step1-email" 
                value={userData.email}
                onChange={(e) => updateUserData({ email: e.target.value })}
                className="w-full"
                placeholder="Your email address"
                readOnly
              />
            </div>
            
            <div>
              <label htmlFor="step1-confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">Confirm Email</label>
              <Input
                type="email"
                id="step1-confirmEmail" 
                value={userData.confirmEmail || ''}
                onChange={(e) => updateUserData({ confirmEmail: e.target.value })}
                className="w-full"
                placeholder="Confirm your email address"
              />
            </div>
          </div>
          
          {/* Birth Day */}
          <div>
            <label htmlFor="step1-birthDay" className="block text-sm font-medium text-gray-700 mb-1">Birth Day</label>
            <Input
              type="date"
              id="step1-birthDay" 
              value={userData.birthDay}
              onChange={(e) => updateUserData({ birthDay: e.target.value })}
              className="w-full"
            />
          </div>
          
          {/* Government ID Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Picture of Government ID</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <input
                type="file"
                id="govIdImage"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="govIdImage" className="cursor-pointer">
                <svg className="w-10 h-10 text-gray-400 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <p className="text-sm text-gray-500 mb-1">
                  {userData.govIdImage ? 
                    `Selected: ${userData.govIdImage.name}` : 
                    'Drag and drop your ID here, or click to browse'
                  }
                </p>
                <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
              </label>
            </div>
          </div>
          
          {/* Government ID Number */}
          <div>
            <label htmlFor="step1-govIdNumber" className="block text-sm font-medium text-gray-700 mb-1">Government ID Number</label>
            <Input
              type="text"
              id="step1-govIdNumber" 
              value={userData.govIdNumber}
              onChange={(e) => updateUserData({ govIdNumber: e.target.value })}
              className="w-full"
              placeholder="Enter your ID number"
            />
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              Back
            </Button>
            
            <Button
              type="submit"
              className="bg-[#7450fc] hover:bg-[#5e3cd9] text-white"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepOne;
