
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const useOnboardingRedirect = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && userProfile) {
      // If onboarding is not completed, redirect to onboarding page
      if (userProfile.onboarding_completed === false) {
        navigate('/onboarding');
      }
    }
  }, [userProfile, loading, navigate]);
  
  return { isOnboardingCompleted: userProfile?.onboarding_completed === true };
};
