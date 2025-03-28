import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TermsDialog from './TermsDialog';

const StepOne = ({ userData, updateUserData, nextStep, prevStep, isCheckingGovId, handleBackToHome }) => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [govIdError, setGovIdError] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateUserData({ [name]: value });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    updateUserData({ govIdImage: file });
  };
  
  const openTermsDialog = () => {
    setIsTermsDialogOpen(true);
  };
  
  const closeTermsDialog = () => {
    setIsTermsDialogOpen(false);
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
        
        <h1 className="text-3xl font-bold text-center mb-2">Step 1: Personal Information</h1>
        <p className="text-gray-600 text-center max-w-2xl mb-8">
          Please provide your personal information to proceed with your application.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</Label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</Label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <Label htmlFor="birthDay" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</Label>
            <Input
              type="date"
              id="birthDay"
              name="birthDay"
              value={userData.birthDay}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <Label htmlFor="govIdNumber" className="block text-sm font-medium text-gray-700 mb-2">Government ID Number</Label>
            <Input
              type="text"
              id="govIdNumber"
              name="govIdNumber"
              value={userData.govIdNumber}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            {govIdError && <p className="mt-2 text-sm text-red-600">{govIdError}</p>}
          </div>
          <div>
            <Label htmlFor="govIdImage" className="block text-sm font-medium text-gray-700 mb-2">
              Government ID Image
            </Label>
            <Input
              type="file"
              id="govIdImage"
              name="govIdImage"
              accept="image/*"
              onChange={handleImageChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep}>Previous</Button>
          <Button onClick={nextStep} disabled={isCheckingGovId}>
            {isCheckingGovId ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </div>
            ) : 'Next'}
          </Button>
        </div>
      </div>
      
      <TermsDialog isOpen={isTermsDialogOpen} onClose={closeTermsDialog} />
    </div>
  );
};

export default StepOne;
