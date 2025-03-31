
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
      
      if (session) {
        updateUserData({
          email: session.user.email || '',
        });
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (profile) {
          if (profile.application_status === 'approved') {
            toast({
              title: "Already approved",
              description: "Your application has already been approved",
            });
            navigate('/dashboard');
            return;
          } else if (profile.application_status === 'rejected') {
            toast({
              title: "Application rejected",
              description: "Your application has been rejected",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            navigate('/login');
            return;
          }
        }
        
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
