
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePasswordResetDetection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This hook should run IMMEDIATELY when the app loads to catch recovery flows
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const type = urlParams.get('type');
    const error = urlParams.get('error');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    console.log('Password reset detection - URL check:', { 
      pathname: location.pathname,
      code: !!code, 
      type, 
      error,
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      fullUrl: window.location.href 
    });

    // Detect if this is a password reset flow
    const isPasswordReset = (
      type === 'recovery' || 
      (code && type === 'recovery') ||
      (accessToken && refreshToken && type === 'recovery') ||
      error === 'access_denied'
    );

    console.log('Is password reset flow detected:', isPasswordReset);

    if (isPasswordReset) {
      console.log('RECOVERY FLOW DETECTED - Storing URL and redirecting immediately');
      
      // Store the COMPLETE URL immediately before any other processing
      const fullUrl = window.location.href;
      sessionStorage.setItem('passwordResetUrl', fullUrl);
      sessionStorage.setItem('passwordResetParams', JSON.stringify({
        code,
        type,
        error,
        accessToken,
        refreshToken,
        timestamp: Date.now(),
        originalPath: location.pathname
      }));
      
      console.log('Stored recovery URL:', fullUrl);
      
      // Immediately redirect to reset page if not already there
      if (location.pathname !== '/reset-password') {
        console.log('Redirecting to /reset-password to prevent code consumption');
        navigate('/reset-password', { replace: true });
      }
    }
  }, [location.search, location.pathname, navigate]);
};
