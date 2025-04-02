import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const StepOne = ({ userData, updateUserData, nextStep, prevStep, isCheckingGovId = false }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const handleBackToHome = async (e) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleContinue = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate form - comprehensive checks
    if (!userData.firstName || !userData.firstName.trim()) {
      setErrorMessage('Please enter your first name');
      return;
    }
    
    if (!userData.lastName || !userData.lastName.trim()) {
      setErrorMessage('Please enter your last name');
      return;
    }
    
    if (!userData.email || !userData.email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!userData.birthDay) {
      setErrorMessage('Please enter your birth date');
      return;
    }
    
    if (!userData.govIdImage) {
      setErrorMessage('Please upload a picture of your government ID');
      return;
    }
    
    if (!userData.govIdNumber || !userData.govIdNumber.trim()) {
      setErrorMessage('Please enter your government ID number');
      return;
    }
    
    // Verify government ID number against user_profiles table ONLY
    try {
      console.log('Checking government ID:', userData.govIdNumber);
      
      // Check ONLY if the government ID has been used before in user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('gov_id_number')
        .eq('gov_id_number', userData.govIdNumber)
        .maybeSingle();
        
      console.log('Profile check result:', { profileData, profileError });
        
      if (profileError) {
        console.error('Error checking government ID in profiles:', profileError);
        // Continue anyway - don't block the user for database errors
        nextStep();
        return;
      }
      
      // If we found a matching gov ID in profiles, show error
      if (profileData && profileData.gov_id_number === userData.govIdNumber) {
        setErrorMessage('This government ID has already been registered in our system.');
        return;
      }
      
      // No matching gov ID was found, continue to next step
      console.log('Government ID verified successfully, proceeding to next step');
      nextStep();
    } catch (error) {
      console.error('Error checking government ID:', error);
      // Continue anyway - don't block the user for errors
      nextStep();
      return;
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Government ID file selected:', file.name);
      updateUserData({ govIdImage: file });
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <a 
            href="#" 
            onClick={handleBackToHome}
            className="inline-flex items-center text-white hover:text-white/80 mb-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </a>

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
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "33.3%" }}></div>
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
          
          {/* Email and Birth Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="step1-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input
                type="email"
                id="step1-email" 
                value={userData.email}
                readOnly
                className="w-full bg-gray-100 cursor-not-allowed"
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
            <label htmlFor="step1-govIdNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Government ID Number
              {isCheckingGovId && (
                <span className="ml-2 inline-flex items-center text-amber-500">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Validating...
                </span>
              )}
            </label>
            <Input
              type="text"
              id="step1-govIdNumber" 
              value={userData.govIdNumber}
              onChange={(e) => updateUserData({ govIdNumber: e.target.value })}
              className={`w-full ${isCheckingGovId ? 'bg-gray-50' : ''}`}
              placeholder="Enter your ID number"
              disabled={isCheckingGovId}
            />
            <p className="mt-1 text-xs text-gray-500">This will be verified for uniqueness</p>
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
              disabled={isCheckingGovId}
            >
              {isCheckingGovId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepOne;
