import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import TermsDialog from './TermsDialog';

const StepThree = ({ userData, updateUserData, handleSubmit, prevStep, isSubmitting, handleBackToHome }) => {
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(userData.acceptedTerms || false);
  const [localUserData, setLocalUserData] = useState({ ...userData });
  
  const handleCheckboxChange = (field) => (checked) => {
    setLocalUserData(prev => ({ ...prev, [field]: checked }));
    updateUserData({ [field]: checked });
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setLocalUserData(prev => ({ ...prev, [name]: val }));
    updateUserData({ [name]: val });
  };
  
  const toggleTerms = () => {
    setTermsOpen(!termsOpen);
  };
  
  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setLocalUserData(prev => ({ ...prev, acceptedTerms: true }));
    updateUserData({ acceptedTerms: true });
    setTermsOpen(false);
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
        
        <h1 className="text-3xl font-bold text-center mb-2">Step 3: Final Details & Agreement</h1>
        <p className="text-gray-600 text-center max-w-2xl mb-8">
          Please provide a brief personal statement and confirm your agreement to our terms and conditions.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="personalStatement" className="block text-sm font-medium text-gray-700 mb-2">
              Personal Statement
            </Label>
            <Textarea
              id="personalStatement"
              name="personalStatement"
              value={localUserData.personalStatement || ''}
              onChange={handleInputChange}
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <p className="mt-2 text-sm text-gray-500">
              Briefly describe why you are a good fit for this role. (Max 200 words)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="meetObligation"
              checked={localUserData.meetObligation || false}
              onCheckedChange={handleCheckboxChange('meetObligation')}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <Label htmlFor="meetObligation" className="text-sm font-medium text-gray-700">
              I can meet the obligations of a remote call center agent.
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="loginDiscord"
              checked={localUserData.loginDiscord || false}
              onCheckedChange={handleCheckboxChange('loginDiscord')}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <Label htmlFor="loginDiscord" className="text-sm font-medium text-gray-700">
              I am willing to login to Discord daily.
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="checkEmails"
              checked={localUserData.checkEmails || false}
              onCheckedChange={handleCheckboxChange('checkEmails')}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <Label htmlFor="checkEmails" className="text-sm font-medium text-gray-700">
              I am willing to check emails daily.
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="solveProblems"
              checked={localUserData.solveProblems || false}
              onCheckedChange={handleCheckboxChange('solveProblems')}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <Label htmlFor="solveProblems" className="text-sm font-medium text-gray-700">
              I am willing to solve problems.
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="completeTraining"
              checked={localUserData.completeTraining || false}
              onCheckedChange={handleCheckboxChange('completeTraining')}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <Label htmlFor="completeTraining" className="text-sm font-medium text-gray-700">
              I am willing to complete training.
            </Label>
          </div>

          <div className="flex items-start">
            <Checkbox
              id="acceptedTerms"
              checked={acceptedTerms}
              onCheckedChange={() => toggleTerms()}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded mt-1"
            />
            <div className="ml-3 text-sm">
              <Label htmlFor="acceptedTerms" className="font-medium text-gray-700">
                I agree to the <button onClick={toggleTerms} className="text-indigo-600 hover:text-indigo-800 underline">Terms and Conditions</button>.
              </Label>
              <p className="text-gray-500">
                You must agree to the terms and conditions to proceed.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={prevStep}>
              Previous
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSubmit}
              disabled={isSubmitting || !acceptedTerms}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} onAccept={handleAcceptTerms} />
    </div>
  );
};

export default StepThree;
