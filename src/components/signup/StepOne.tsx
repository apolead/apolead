
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
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" fill="#4F46E5" />
          <rect x="22" width="20" height="20" fill="#4F46E5" />
          <rect y="22" width="20" height="20" fill="#4F46E5" />
          <rect x="22" y="22" width="20" height="20" fill="#4F46E5" />
        </svg>
      </div>
      
      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "33.3%" }}></div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <p className="text-gray-600 mb-8">Please provide your personal details to continue with the application process.</p>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleContinue} className="space-y-6">
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
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50">
            <input
              type="file"
              id="govIdImage"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <svg className="w-10 h-10 text-gray-400 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <p className="text-sm text-gray-500 mb-1">
              {userData.govIdImage ? 
                `Selected: ${userData.govIdImage.name}` : 
                'Drag and drop your ID here, or'
              }
            </p>
            <label htmlFor="govIdImage" className="text-indigo-600 font-medium cursor-pointer">
              Browse files
            </label>
            <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
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
  );
};

export default StepOne;
