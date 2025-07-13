
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePasswordResetDetection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple processing attempts
    if (hasProcessed.current) {
      console.log('Recovery detection already processed, skipping');
      return;
    }

    console.log('=== AGGRESSIVE RECOVERY DETECTION START ===');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', location.pathname);
    console.log('Search params:', location.search);

    // IMMEDIATE parameter extraction before any other processing
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const type = urlParams.get('type');
    const error = urlParams.get('error');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    console.log('Extracted parameters:', { 
      hasCode: !!code, 
      type, 
      error,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    // Detect recovery flow with multiple conditions
    const isPasswordReset = (
      type === 'recovery' || 
      (code && type === 'recovery') ||
      (accessToken && refreshToken && type === 'recovery') ||
      error === 'access_denied' ||
      // Additional detection for recovery flows
      (code && window.location.href.includes('recovery')) ||
      // Detect if coming from password reset email
      document.referrer.includes('supabase.co')
    );

    console.log('Recovery flow detected:', isPasswordReset);

    if (isPasswordReset) {
      console.log('🚨 RECOVERY FLOW DETECTED - IMMEDIATE ISOLATION 🚨');
      
      // Mark as processed to prevent re-processing
      hasProcessed.current = true;
      
      // Store complete recovery data with extended expiration (30 minutes)
      const recoveryData = {
        code,
        type,
        error,
        accessToken,
        refreshToken,
        timestamp: Date.now(),
        originalPath: location.pathname,
        fullUrl: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        processed: false // Flag to track if code has been used
      };
      
      // Store in multiple locations for redundancy
      sessionStorage.setItem('passwordResetParams', JSON.stringify(recoveryData));
      sessionStorage.setItem('passwordResetUrl', window.location.href);
      sessionStorage.setItem('recoveryMode', 'true');
      sessionStorage.setItem('recoveryTimestamp', Date.now().toString());
      
      // Store in localStorage as backup (shorter expiration)
      localStorage.setItem('tempRecoveryData', JSON.stringify({
        ...recoveryData,
        expireAt: Date.now() + (10 * 60 * 1000) // 10 minutes
      }));
      
      console.log('Recovery data stored:', recoveryData);
      console.log('Storage locations: sessionStorage, localStorage');
      
      // Set global flag to prevent other components from processing
      window.__RECOVERY_MODE_ACTIVE = true;
      
      // Immediate redirect to reset page if not already there
      if (location.pathname !== '/reset-password') {
        console.log('Redirecting to /reset-password to prevent code consumption');
        navigate('/reset-password', { 
          replace: true,
          state: { fromRecovery: true }
        });
      } else {
        console.log('Already on reset-password page');
      }
    } else {
      console.log('No recovery flow detected, normal auth processing can proceed');
    }

    console.log('=== RECOVERY DETECTION END ===');
  }, [location.search, location.pathname, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only clear if we're leaving the reset flow entirely
      if (location.pathname !== '/reset-password') {
        hasProcessed.current = false;
        window.__RECOVERY_MODE_ACTIVE = false;
      }
    };
  }, [location.pathname]);
};
