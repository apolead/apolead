
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
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    console.log('Password reset detection:', { 
      pathname: location.pathname,
      code: !!code, 
      type, 
      error,
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      currentUrl: window.location.href 
    });

    // Check if this is a password reset flow - expanded detection
    const isPasswordReset = (
      // PKCE flow with code and recovery type
      (code && type === 'recovery') ||
      // Direct token flow (legacy) with recovery type
      (accessToken && refreshToken && type === 'recovery') ||
      // Error from password reset attempt
      error === 'access_denied' ||
      // Additional check for any recovery-related parameters
      type === 'recovery'
    );

    console.log('Is password reset flow detected:', isPasswordReset);

    // If we detect a password reset flow and we're not already on the reset page
    if (isPasswordReset && location.pathname !== '/reset-password') {
      console.log('Detected password reset flow, redirecting to /reset-password');
      
      // IMMEDIATELY store the original URL to preserve the authorization code
      const fullUrl = window.location.href;
      sessionStorage.setItem('passwordResetUrl', fullUrl);
      console.log('Stored password reset URL:', fullUrl);
      
      // Also store individual parameters as backup
      sessionStorage.setItem('passwordResetParams', JSON.stringify({
        code,
        type,
        error,
        accessToken,
        refreshToken,
        timestamp: Date.now()
      }));
      
      // Navigate to reset page with clean URL to prevent duplicate processing
      navigate('/reset-password', { replace: true });
      
      return; // Exit early to prevent other auth logic from running
    }

    // If we're on the reset password page, ensure the URL is preserved
    if (location.pathname === '/reset-password') {
      const storedUrl = sessionStorage.getItem('passwordResetUrl');
      if (!storedUrl && (code || accessToken)) {
        // Store current URL if not already stored
        sessionStorage.setItem('passwordResetUrl', window.location.href);
        sessionStorage.setItem('passwordResetParams', JSON.stringify({
          code,
          type,
          error,
          accessToken,
          refreshToken,
          timestamp: Date.now()
        }));
      }
    }
  }, [location.search, location.hash, location.pathname, navigate]);
};
