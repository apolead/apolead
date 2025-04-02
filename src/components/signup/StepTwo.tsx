
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const StepTwo = ({ userData, updateUserData, nextStep, prevStep }) => {
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
  
  const handleContinue = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate form - comprehensive checks
    if (!userData.cpuType || !userData.cpuType.trim()) {
      setErrorMessage('Please enter your CPU type');
      return;
    }
    
    if (!userData.ramAmount || !userData.ramAmount.trim()) {
      setErrorMessage('Please enter your RAM amount');
      return;
    }
    
    if (userData.hasHeadset === null) {
      setErrorMessage('Please indicate whether you have a headset');
      return;
    }
    
    if (userData.hasQuietPlace === null) {
      setErrorMessage('Please indicate whether you have a quiet place to work');
      return;
    }
    
    if (!userData.speedTest) {
      setErrorMessage('Please upload a screenshot of your speed test results');
      return;
    }
    
    if (!userData.systemSettings) {
      setErrorMessage('Please upload a screenshot of your system settings');
      return;
    }
    
    // Continue to next step
    nextStep();
  };
  
  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`Uploading ${fieldName} file:`, file.name);
      updateUserData({ [fieldName]: file });
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

          <h2 className="text-2xl font-bold mb-6">Step 2 of 4: System Requirements</h2>
          <p className="text-white/80 mb-6">To ensure you can work effectively, please confirm your technical setup and experience.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Why we need this information</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To verify your system meets our requirements</li>
              <li>To ensure you have the necessary equipment</li>
              <li>To match you with appropriate client calls</li>
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
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "66.6%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">System Requirements & Experience</h2>
        <p className="text-gray-600 mb-6">To ensure you can work effectively, please confirm your technical setup and experience.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleContinue} className="space-y-6 overflow-y-auto">
          <div className="border rounded-lg p-4 bg-gray-50 mb-6">
            <h3 className="text-lg font-medium mb-4">System Requirements</h3>
            
            <div className="space-y-5">
              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">25 MBPS Internet</label>
                <p className="text-xs text-gray-500 mb-2">Upload a selfie of speed test results from:</p>
                <a 
                  href="https://speed.cloudflare.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-sm hover:underline"
                >
                  https://speed.cloudflare.com/
                </a>
                
                <div className="mt-3 border-2 border-dashed border-gray-300 rounded-md p-4 bg-white">
                  <div className="flex items-center justify-center">
                    <input
                      id="speed-test-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange('speedTest', e)}
                    />
                    <label htmlFor="speed-test-upload" className="cursor-pointer text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        {userData.speedTest ? 
                          `Selected: ${userData.speedTest.name}` : 
                          'Upload a file or drag and drop'
                        }
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Windows 10+</label>
                <p className="text-xs text-gray-500 mb-2">Post a screenshot of system settings</p>
                
                <div className="mt-3 border-2 border-dashed border-gray-300 rounded-md p-4 bg-white">
                  <div className="flex items-center justify-center">
                    <input
                      id="system-settings-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange('systemSettings', e)}
                    />
                    <label htmlFor="system-settings-upload" className="cursor-pointer text-center">
                      <svg className="mx-auto h-10 h-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        {userData.systemSettings ? 
                          `Selected: ${userData.systemSettings.name}` : 
                          'Upload a file or drag and drop'
                        }
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="step2-cpuType" className="block text-sm font-medium text-gray-700 mb-1">CPU Type and Speed</label>
                <Input
                  type="text"
                  id="step2-cpuType"
                  value={userData.cpuType}
                  onChange={(e) => updateUserData({ cpuType: e.target.value })}
                  className="w-full"
                  placeholder="e.g., Intel Core i5-10400 2.9GHz"
                />
              </div>
              
              <div>
                <label htmlFor="step2-ramAmount" className="block text-sm font-medium text-gray-700 mb-1">RAM / Memory (How much?)</label>
                <Input
                  type="text"
                  id="step2-ramAmount"
                  value={userData.ramAmount}
                  onChange={(e) => updateUserData({ ramAmount: e.target.value })}
                  className="w-full"
                  placeholder="e.g., 16GB DDR4"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I have a headset</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="headset" 
                        value="yes" 
                        checked={userData.hasHeadset === true}
                        onChange={() => updateUserData({ hasHeadset: true })}
                        className="w-4 h-4 cursor-pointer text-indigo-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="headset" 
                        value="no" 
                        checked={userData.hasHeadset === false}
                        onChange={() => updateUserData({ hasHeadset: false })}
                        className="w-4 h-4 cursor-pointer text-indigo-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I have a quiet place to work</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="quietPlace" 
                        value="yes" 
                        checked={userData.hasQuietPlace === true}
                        onChange={() => updateUserData({ hasQuietPlace: true })}
                        className="w-4 h-4 cursor-pointer text-indigo-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="quietPlace" 
                        value="no" 
                        checked={userData.hasQuietPlace === false}
                        onChange={() => updateUserData({ hasQuietPlace: false })}
                        className="w-4 h-4 cursor-pointer text-indigo-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default StepTwo;
