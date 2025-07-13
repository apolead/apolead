
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePasswordResetDetection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const type = urlParams.get('type');
    const error = urlParams.get('error');

    console.log('Password reset detection:', { 
      pathname: location.pathname,
      code: !!code, 
      type, 
      error,
      currentUrl: window.location.href 
    });

    // Check if this is a password reset flow
    const isPasswordReset = (
      // PKCE flow with code
      (code && type === 'recovery') ||
      // Error from password reset
      error === 'access_denied' ||
      // Direct token flow (legacy)
      urlParams.get('access_token') && type === 'recovery'
    );

    // If we detect a password reset flow and we're not already on the reset page
    if (isPasswordReset && location.pathname !== '/reset-password') {
      console.log('Detected password reset flow, redirecting to /reset-password');
      
      // Preserve all URL parameters when redirecting
      const resetUrl = `/reset-password${location.search}${location.hash}`;
      navigate(resetUrl, { replace: true });
    }
  }, [location.search, location.hash, location.pathname, navigate]);
};
