
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const StepOne = ({ userData, updateUserData, nextStep, prevStep }) => {
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleContinue = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.birthDay) {
      setErrorMessage('Please fill in all required fields');
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
    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-auto overflow-hidden flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-3/5 p-8">
        <div className="mb-6">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <h2 className="text-2xl font-bold inline">
              <span className="text-black">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "33.3%" }}></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
        <p className="text-gray-600 mb-6">Please provide your personal details to continue with the application process.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleContinue} className="space-y-5">
          {/* First row: Name fields */}
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
          
          {/* Second row: Email and Birth Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="step1-email" className="block text-sm font-medium text-gray-700 mb-1">Confirm Email Address</label>
              <Input
                type="email"
                id="step1-email" 
                value={userData.email}
                onChange={(e) => updateUserData({ email: e.target.value })}
                className="w-full"
                placeholder="Confirm your email address"
              />
            </div>
            
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
          </div>
          
          {/* Third row: Government ID Upload */}
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
          
          {/* Fourth row: Government ID Number */}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
      
      {/* Right side - Visual */}
      <div className="hidden md:block w-2/5 bg-gradient-to-br from-indigo-600 to-purple-500 p-8 text-white">
        <div className="h-full flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-4">Step 1 of 4: Personal Details</h3>
          <p className="opacity-90 mb-6">We need your basic personal information to get started with your application.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h4 className="font-semibold mb-2">Why we need this information</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To verify your identity</li>
              <li>To comply with work regulations</li>
              <li>To ensure you receive appropriate compensation</li>
              <li>To communicate with you about your application</li>
            </ul>
          </div>
          
          <div className="mt-auto pt-8">
            <p className="text-xs opacity-75">All information is securely stored and protected in accordance with data protection regulations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
