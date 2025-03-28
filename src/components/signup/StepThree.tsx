
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import TermsDialog from './TermsDialog';

const StepThree = ({ userData, updateUserData, handleSubmit, prevStep, isSubmitting }) => {
  const [errors, setErrors] = useState({});
  const [dialogType, setDialogType] = useState<'privacy' | 'terms'>('privacy');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const openTermsDialog = (type: 'privacy' | 'terms') => {
    setDialogType(type);
    setDialogOpen(true);
  };
  
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!userData.meetObligation) {
      newErrors['meetObligation'] = 'You must confirm your ability to meet obligations';
      isValid = false;
    }
    
    if (!userData.loginDiscord) {
      newErrors['loginDiscord'] = 'You must confirm your ability to login to Discord';
      isValid = false;
    }
    
    if (!userData.checkEmails) {
      newErrors['checkEmails'] = 'You must confirm your ability to check emails';
      isValid = false;
    }
    
    if (!userData.solveProblems) {
      newErrors['solveProblems'] = 'You must confirm your ability to solve problems';
      isValid = false;
    }
    
    if (!userData.completeTraining) {
      newErrors['completeTraining'] = 'You must confirm your ability to complete training';
      isValid = false;
    }
    
    if (!userData.personalStatement.trim() || userData.personalStatement.length < 50) {
      newErrors['personalStatement'] = 'Personal statement must be at least 50 characters';
      isValid = false;
    }
    
    if (!userData.acceptedTerms) {
      newErrors['acceptedTerms'] = 'You must accept the terms and privacy policy';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      handleSubmit();
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
          <button onClick={prevStep} className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Technical Requirements
          </button>

          <h2 className="text-2xl font-bold mb-6">Step 4 of 4: Final Confirmation</h2>
          <p className="text-white/80 mb-6">
            You're almost there! Please confirm your commitment to our standards and requirements before submitting your application.
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Important Information</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Your application will be reviewed within 48 hours</li>
              <li>You will receive confirmation via email</li>
              <li>Approved applicants will be invited to complete onboarding</li>
              <li>All information is verified for accuracy</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>All information is securely stored and protected in accordance with our privacy policy and terms of service.</p>
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
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "100%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Final Confirmation</h2>
        <p className="text-gray-600 mb-6">Please confirm the following requirements for your application.</p>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Commitment to Responsibilities</h3>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="meetObligation" 
                checked={userData.meetObligation}
                onCheckedChange={(checked) => updateUserData({ meetObligation: !!checked })}
              />
              <label htmlFor="meetObligation" className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I confirm that I can meet my work obligations consistently and reliably.
                {errors['meetObligation'] && <p className="text-red-500 text-xs mt-1">{errors['meetObligation']}</p>}
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="loginDiscord" 
                checked={userData.loginDiscord}
                onCheckedChange={(checked) => updateUserData({ loginDiscord: !!checked })}
              />
              <label htmlFor="loginDiscord" className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I confirm that I can login to Discord daily or as required.
                {errors['loginDiscord'] && <p className="text-red-500 text-xs mt-1">{errors['loginDiscord']}</p>}
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="checkEmails" 
                checked={userData.checkEmails}
                onCheckedChange={(checked) => updateUserData({ checkEmails: !!checked })}
              />
              <label htmlFor="checkEmails" className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I confirm that I can check emails at least once daily.
                {errors['checkEmails'] && <p className="text-red-500 text-xs mt-1">{errors['checkEmails']}</p>}
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="solveProblems" 
                checked={userData.solveProblems}
                onCheckedChange={(checked) => updateUserData({ solveProblems: !!checked })}
              />
              <label htmlFor="solveProblems" className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I confirm that I can solve problems independently when needed.
                {errors['solveProblems'] && <p className="text-red-500 text-xs mt-1">{errors['solveProblems']}</p>}
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="completeTraining" 
                checked={userData.completeTraining}
                onCheckedChange={(checked) => updateUserData({ completeTraining: !!checked })}
              />
              <label htmlFor="completeTraining" className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I confirm that I can complete all required training materials.
                {errors['completeTraining'] && <p className="text-red-500 text-xs mt-1">{errors['completeTraining']}</p>}
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="personalStatement" className="block text-sm font-medium text-gray-700 mb-1">
              Personal Statement
            </label>
            <Textarea
              id="personalStatement"
              value={userData.personalStatement}
              onChange={(e) => updateUserData({ personalStatement: e.target.value })}
              placeholder="Tell us why you would be a great fit for this role..."
              className="w-full min-h-[120px]"
            />
            {errors['personalStatement'] && <p className="text-red-500 text-xs mt-1">{errors['personalStatement']}</p>}
            <p className="mt-1 text-xs text-gray-500">Minimum 50 characters. Explain why you're interested and what makes you a good fit.</p>
          </div>
          
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox 
              id="acceptedTerms" 
              checked={userData.acceptedTerms}
              onCheckedChange={(checked) => updateUserData({ acceptedTerms: !!checked })}
            />
            <label htmlFor="acceptedTerms" className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I have read and agree to the <button type="button" onClick={() => openTermsDialog('terms')} className="text-indigo-600 underline">Terms of Service</button> and <button type="button" onClick={() => openTermsDialog('privacy')} className="text-indigo-600 underline">Privacy Policy</button>.
              {errors['acceptedTerms'] && <p className="text-red-500 text-xs mt-1">{errors['acceptedTerms']}</p>}
            </label>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              Previous
            </Button>
            
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Application'}
            </Button>
          </div>
        </form>
        
        {/* Terms Dialog */}
        <TermsDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          type={dialogType}
        />
      </div>
    </div>
  );
};

export default StepThree;
