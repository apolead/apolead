
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSignUp } from '@/contexts/SignUpContext';

export const useSignUpInit = () => {
  const { currentStep, nextStep, updateUserData } = useSignUp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is already logged in, we can update the email in userData
      if (session) {
        updateUserData({
          email: session.user.email || '',
        });
        
        // If we're on step 0 (email/password entry), move to next step
        if (currentStep === 0) {
          setTimeout(() => {
            nextStep();
          }, 500);
        }
      }
    };
    
    checkAuth();
  }, [navigate, currentStep, toast, nextStep, updateUserData]);
};
