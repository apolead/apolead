
import React from 'react';
import { SignUpProvider } from '@/contexts/SignUpContext';
import SignUpRenderer from '@/components/signup/SignUpRenderer';
import { useSignUpInit } from '@/hooks/useSignUpInit';
import WaitlistBanner from '@/components/WaitlistBanner';

const SignUp: React.FC = () => {
  return (
    <SignUpProvider>
      <WaitlistBanner />
      <SignUpContent />
    </SignUpProvider>
  );
};

// This component is wrapped with the context and can use the hooks
const SignUpContent: React.FC = () => {
  useSignUpInit();
  
  return <SignUpRenderer />;
};

export default SignUp;
