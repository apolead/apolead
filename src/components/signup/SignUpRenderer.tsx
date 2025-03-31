
import React from 'react';
import StepZero from '@/components/signup/StepZero';
import StepOne from '@/components/signup/StepOne';
import StepTwo from '@/components/signup/StepTwo';
import StepThree from '@/components/signup/StepThree';
import ConfirmationScreen from '@/components/signup/ConfirmationScreen';
import { useSignUp } from '@/contexts/SignUpContext';

const SignUpRenderer: React.FC = () => {
  const { currentStep, userData, updateUserData, nextStep, prevStep, handleSubmit, isSubmitting, isCheckingGovId } = useSignUp();
  
  const renderStep = () => {
    if (currentStep === 0) {
      return <StepZero userData={userData} updateUserData={updateUserData} nextStep={nextStep} />;
    }
    
    switch (currentStep) {
      case 1:
        return <StepOne 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          prevStep={prevStep}
          isCheckingGovId={isCheckingGovId}
        />;
      case 2:
        return <StepTwo userData={userData} updateUserData={updateUserData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <StepThree userData={userData} updateUserData={updateUserData} handleSubmit={handleSubmit} prevStep={prevStep} isSubmitting={isSubmitting} />;
      case 4:
        return <ConfirmationScreen />;
      default:
        return <StepZero userData={userData} updateUserData={updateUserData} nextStep={nextStep} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
};

export default SignUpRenderer;
