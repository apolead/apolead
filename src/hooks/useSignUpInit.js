
import { useEffect } from 'react';
import { useSignUp } from '@/contexts/SignUpContext';
import { supabase } from '@/integrations/supabase/client';

export const useSignUpInit = () => {
  const { updateUserData } = useSignUp();
  
  useEffect(() => {
    const initSignUp = async () => {
      try {
        // Get the user's email from the URL
        const url = new URL(window.location.href);
        const email = url.searchParams.get('email');
        
        if (email) {
          // Check if this is a valid domain for sign up
          // Updated to explicitly include @apolead.com in the valid domains list
          const isValidEmail = email.includes('@') && (
            email.endsWith('@gmail.com') || 
            email.endsWith('@outlook.com') || 
            email.endsWith('@hotmail.com') || 
            email.endsWith('@yahoo.com') ||
            email.endsWith('@apolead.com') // Support for company email domain
          );
          
          if (isValidEmail) {
            updateUserData({ email });
          }
        }
      } catch (error) {
        console.error('Error initializing sign up:', error);
      }
    };
    
    initSignUp();
  }, [updateUserData]);
  
  return null;
};
