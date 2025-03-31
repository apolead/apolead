
import React from 'react';
import { SignUpProvider } from '@/contexts/SignUpContext';
import SignUpRenderer from '@/components/signup/SignUpRenderer';
import { useSignUpInit } from '@/hooks/useSignUpInit';

const SignUp: React.FC = () => {
  return (
    <SignUpProvider>
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
