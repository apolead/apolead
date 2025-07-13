
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePasswordResetDetection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    console.log('=== PASSWORD RESET DETECTION START ===');
    
    // Check if recovery was already intercepted
    const recoveryMode = sessionStorage.getItem('recoveryMode');
    const storedParams = sessionStorage.getItem('passwordResetParams');
    
    if (recoveryMode === 'true' && storedParams) {
      try {
        const recoveryData = JSON.parse(storedParams);
        console.log('Recovery data found from interceptor:', {
          intercepted: recoveryData.intercepted,
          hasCode: !!recoveryData.code,
          timestamp: new Date(recoveryData.timestamp).toISOString()
        });
        
        // Ensure we're on the reset password page
        if (location.pathname !== '/reset-password') {
          console.log('Redirecting to reset password page');
          navigate('/reset-password', { replace: true });
        }
        
        // Set global recovery mode
        window.__RECOVERY_MODE_ACTIVE = true;
        
        return;
      } catch (error) {
        console.error('Error parsing stored recovery data:', error);
      }
    }
    
    // Fallback: Check URL parameters if no stored data found
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const type = urlParams.get('type');
    
    if (type === 'recovery' || (code && type === 'recovery')) {
      console.log('Recovery flow detected in URL, storing now');
      
      const recoveryData = {
        code,
        type,
        timestamp: Date.now(),
        originalPath: location.pathname,
        fullUrl: window.location.href,
        processed: false,
        fallback: true
      };
      
      sessionStorage.setItem('passwordResetParams', JSON.stringify(recoveryData));
      sessionStorage.setItem('recoveryMode', 'true');
      window.__RECOVERY_MODE_ACTIVE = true;
      
      if (location.pathname !== '/reset-password') {
        navigate('/reset-password', { replace: true });
      }
    }
    
    console.log('=== PASSWORD RESET DETECTION END ===');
  }, [location.search, location.pathname, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (location.pathname !== '/reset-password') {
        hasProcessed.current = false;
        window.__RECOVERY_MODE_ACTIVE = false;
      }
    };
  }, [location.pathname]);
};
