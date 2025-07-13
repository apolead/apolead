
// Recovery interceptor that runs before any React components mount
export const interceptRecoveryFlow = () => {
  console.log('🔍 RECOVERY INTERCEPTOR: Checking for recovery flow');
  
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const type = urlParams.get('type');
  const error = urlParams.get('error');
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');
  
  console.log('URL parameters found:', {
    hasCode: !!code,
    type,
    error,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    url: currentUrl
  });
  
  // Detect recovery flow with multiple conditions
  const isPasswordReset = (
    type === 'recovery' || 
    (code && type === 'recovery') ||
    (accessToken && refreshToken && type === 'recovery') ||
    error === 'access_denied' ||
    (code && currentUrl.includes('recovery')) ||
    document.referrer.includes('supabase.co')
  );
  
  if (isPasswordReset) {
    console.log('🚨 RECOVERY INTERCEPTOR: Recovery flow detected - storing parameters immediately');
    
    // Store recovery data immediately with extended expiration
    const recoveryData = {
      code,
      type,
      error,
      accessToken,
      refreshToken,
      timestamp: Date.now(),
      originalPath: window.location.pathname,
      fullUrl: currentUrl,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      processed: false,
      intercepted: true // Flag to show this was intercepted early
    };
    
    // Store in multiple locations for redundancy
    sessionStorage.setItem('passwordResetParams', JSON.stringify(recoveryData));
    sessionStorage.setItem('passwordResetUrl', currentUrl);
    sessionStorage.setItem('recoveryMode', 'true');
    sessionStorage.setItem('recoveryTimestamp', Date.now().toString());
    
    // Store in localStorage as backup
    localStorage.setItem('tempRecoveryData', JSON.stringify({
      ...recoveryData,
      expireAt: Date.now() + (30 * 60 * 1000) // 30 minutes
    }));
    
    // Set global flag immediately
    window.__RECOVERY_MODE_ACTIVE = true;
    
    console.log('🔒 RECOVERY INTERCEPTOR: Recovery data stored, redirecting to reset page');
    
    // Immediately redirect to reset password page to prevent URL processing
    if (window.location.pathname !== '/reset-password') {
      window.history.replaceState({}, '', '/reset-password');
    }
    
    return true;
  }
  
  return false;
};
