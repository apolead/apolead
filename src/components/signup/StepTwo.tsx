
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const StepTwo = ({ userData, updateUserData, nextStep, prevStep }) => {
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleContinue = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userData.cpuType || !userData.ramAmount) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    // Continue to next step
    nextStep();
  };
  
  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      updateUserData({ [fieldName]: file });
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
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "66.6%" }}></div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">System Requirements & Experience</h2>
      <p className="text-gray-600 mb-8">To ensure you can work effectively, please confirm your technical setup and experience.</p>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
          {errorMessage}
        </div>
      )}
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
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
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">
                    {userData.speedTest ? 
                      `Selected: ${userData.speedTest.name}` : 
                      <span>
                        <span className="font-medium text-indigo-600 hover:text-indigo-500">
                          Upload a file
                        </span>
                        {" "} or drag and drop
                      </span>
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
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">
                    {userData.systemSettings ? 
                      `Selected: ${userData.systemSettings.name}` : 
                      <span>
                        <span className="font-medium text-indigo-600 hover:text-indigo-500">
                          Upload a file
                        </span>
                        {" "} or drag and drop
                      </span>
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
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="headset" 
                  value="no" 
                  checked={userData.hasHeadset === false}
                  onChange={() => updateUserData({ hasHeadset: false })}
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">No</span>
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
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="quietPlace" 
                  value="no" 
                  checked={userData.hasQuietPlace === false}
                  onChange={() => updateUserData({ hasQuietPlace: false })}
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-medium mb-4">Call Center Experience</h3>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sales Experience</h4>
            <div className="flex space-x-4 mb-3">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="salesExperience" 
                  value="yes" 
                  checked={userData.salesExperience === true}
                  onChange={() => updateUserData({ salesExperience: true })}
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="salesExperience" 
                  value="no" 
                  checked={userData.salesExperience === false}
                  onChange={() => updateUserData({ salesExperience: false })}
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            
            {userData.salesExperience && (
              <div className="pl-6 space-y-3 border-l-2 border-indigo-100">
                <div>
                  <label htmlFor="step2-salesMonths" className="block text-sm font-medium text-gray-700 mb-1">How many months?</label>
                  <Input
                    type="number"
                    id="step2-salesMonths"
                    value={userData.salesMonths || ''}
                    onChange={(e) => updateUserData({ salesMonths: e.target.value })}
                    className="w-full"
                    placeholder="Enter number of months"
                  />
                </div>
                
                <div>
                  <label htmlFor="step2-salesCompany" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <Input
                    type="text"
                    id="step2-salesCompany"
                    value={userData.salesCompany || ''}
                    onChange={(e) => updateUserData({ salesCompany: e.target.value })}
                    className="w-full"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="step2-salesProduct" className="block text-sm font-medium text-gray-700 mb-1">Product sold?</label>
                  <Input
                    type="text"
                    id="step2-salesProduct"
                    value={userData.salesProduct || ''}
                    onChange={(e) => updateUserData({ salesProduct: e.target.value })}
                    className="w-full"
                    placeholder="e.g., Software subscriptions, Insurance, etc."
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Service Experience</h4>
            <div className="flex space-x-4 mb-3">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="serviceExperience" 
                  value="yes" 
                  checked={userData.serviceExperience === true}
                  onChange={() => updateUserData({ serviceExperience: true })}
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="serviceExperience" 
                  value="no" 
                  checked={userData.serviceExperience === false}
                  onChange={() => updateUserData({ serviceExperience: false })}
                  className="w-5 h-5 cursor-pointer text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            
            {userData.serviceExperience && (
              <div className="pl-6 space-y-3 border-l-2 border-indigo-100">
                <div>
                  <label htmlFor="step2-serviceMonths" className="block text-sm font-medium text-gray-700 mb-1">How many months?</label>
                  <Input
                    type="number"
                    id="step2-serviceMonths"
                    value={userData.serviceMonths || ''}
                    onChange={(e) => updateUserData({ serviceMonths: e.target.value })}
                    className="w-full"
                    placeholder="Enter number of months"
                  />
                </div>
                
                <div>
                  <label htmlFor="step2-serviceCompany" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <Input
                    type="text"
                    id="step2-serviceCompany"
                    value={userData.serviceCompany || ''}
                    onChange={(e) => updateUserData({ serviceCompany: e.target.value })}
                    className="w-full"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="step2-serviceProduct" className="block text-sm font-medium text-gray-700 mb-1">Product Supported?</label>
                  <Input
                    type="text"
                    id="step2-serviceProduct"
                    value={userData.serviceProduct || ''}
                    onChange={(e) => updateUserData({ serviceProduct: e.target.value })}
                    className="w-full"
                    placeholder="e.g., Technical support, Customer service, etc."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
        >
          Back
        </Button>
        
        <Button
          type="button"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
