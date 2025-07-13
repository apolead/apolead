import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { setRecoveryMode } = useAuth();

  useEffect(() => {
    console.log('🔐 RESET PASSWORD: Component mounted, checking for recovery data');
    setRecoveryMode(true);
    window.__RECOVERY_MODE_ACTIVE = true;
    
    const establishRecoverySession = async () => {
      try {
        console.log('=== ENHANCED RECOVERY SESSION ESTABLISHMENT ===');
        
        // PRIORITY 1: Use stored parameters from interceptor
        const storedParams = sessionStorage.getItem('passwordResetParams');
        const recoveryMode = sessionStorage.getItem('recoveryMode');
        
        console.log('Checking stored recovery data:', {
          hasStoredParams: !!storedParams,
          recoveryMode
        });
        
        let recoveryData = null;
        
        if (storedParams && recoveryMode === 'true') {
          try {
            recoveryData = JSON.parse(storedParams);
            const age = Date.now() - recoveryData.timestamp;
            const isValid = age < 30 * 60 * 1000; // 30 minutes
            
            console.log('Stored recovery data analysis:', {
              age: Math.round(age / 1000) + 's',
              isValid,
              hasCode: !!recoveryData.code,
              intercepted: recoveryData.intercepted,
              fallback: recoveryData.fallback,
              processed: recoveryData.processed
            });
            
            if (!isValid) {
              console.log('Stored recovery data expired, clearing');
              sessionStorage.removeItem('passwordResetParams');
              sessionStorage.removeItem('recoveryMode');
              sessionStorage.removeItem('recoveryTimestamp');
              recoveryData = null;
            }
          } catch (parseError) {
            console.error('Error parsing stored recovery data:', parseError);
            sessionStorage.removeItem('passwordResetParams');
            sessionStorage.removeItem('recoveryMode');
          }
        }
        
        // PRIORITY 2: Check URL parameters as absolute fallback
        if (!recoveryData) {
          console.log('No stored data found, checking URL parameters');
          const code = searchParams.get('code');
          const type = searchParams.get('type');
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          const error = searchParams.get('error');
          
          if (code || accessToken || error) {
            recoveryData = {
              code,
              type,
              accessToken,
              refreshToken,
              error,
              timestamp: Date.now(),
              processed: false,
              fromUrl: true
            };
            console.log('Recovery data extracted from URL:', {
              hasCode: !!code,
              type,
              error
            });
          }
        }
        
        // Check for errors
        if (recoveryData?.error) {
          console.error('Recovery URL contains error:', recoveryData.error);
          setIsValidSession(false);
          return;
        }
        
        // Try to establish session
        let sessionEstablished = false;
        
        // Method 1: Authorization code exchange
        if (recoveryData?.code && !recoveryData.processed) {
          console.log('🔄 Attempting authorization code exchange...');
          try {
            const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(recoveryData.code);
            
            if (codeError) {
              console.warn('Code exchange failed:', codeError.message);
              // Mark as processed to prevent retry loops
              if (storedParams) {
                const updatedData = { ...recoveryData, processed: true };
                sessionStorage.setItem('passwordResetParams', JSON.stringify(updatedData));
              }
            } else if (data.session) {
              console.log('✅ Code exchange successful - recovery session established');
              sessionEstablished = true;
              setIsValidSession(true);
              
              // Mark as processed
              if (storedParams) {
                const updatedData = { ...recoveryData, processed: true };
                sessionStorage.setItem('passwordResetParams', JSON.stringify(updatedData));
              }
            }
          } catch (exchangeError) {
            console.error('Exception during code exchange:', exchangeError);
          }
        }
        
        // Method 2: Direct token session
        if (!sessionEstablished && recoveryData?.accessToken && recoveryData?.refreshToken) {
          console.log('🔄 Attempting direct token session...');
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: recoveryData.accessToken,
              refresh_token: recoveryData.refreshToken
            });
            
            if (sessionError) {
              console.warn('Token session failed:', sessionError.message);
            } else if (data.session) {
              console.log('✅ Token session successful');
              sessionEstablished = true;
              setIsValidSession(true);
            }
          } catch (setError) {
            console.error('Exception setting token session:', setError);
          }
        }
        
        // Method 3: Check existing session
        if (!sessionEstablished) {
          console.log('🔄 Checking for existing session...');
          try {
            const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
            
            if (getSessionError) {
              console.warn('Session check failed:', getSessionError.message);
            } else if (session) {
              console.log('✅ Found existing valid session');
              sessionEstablished = true;
              setIsValidSession(true);
            }
          } catch (sessionCheckError) {
            console.error('Exception checking session:', sessionCheckError);
          }
        }
        
        // Final result
        if (!sessionEstablished) {
          console.log('❌ No valid session could be established');
          setIsValidSession(false);
        }
        
      } catch (error) {
        console.error('Overall recovery session establishment error:', error);
        setIsValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    establishRecoverySession();

    // Cleanup function
    return () => {
      console.log('ResetPassword component unmounting');
    };
  }, [searchParams, setRecoveryMode]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Invalid password",
        description: passwordError,
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Updating user password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      console.log('✅ Password updated successfully');
      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password"
      });
      
      // Clean up ALL recovery data
      sessionStorage.removeItem('passwordResetUrl');
      sessionStorage.removeItem('passwordResetParams');
      sessionStorage.removeItem('recoveryMode');
      sessionStorage.removeItem('recoveryTimestamp');
      localStorage.removeItem('tempRecoveryData');
      
      // Clear global recovery flag
      window.__RECOVERY_MODE_ACTIVE = false;
      
      // Reset recovery mode and sign out the user
      setRecoveryMode(false);
      await supabase.auth.signOut();
      
      console.log('🏁 Password reset flow completed, redirecting to login');
      navigate('/login', { replace: true });
      
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Password update failed",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg font-medium">Establishing recovery session...</div>
          <div className="text-sm text-gray-500">Please wait while we validate your reset link</div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex flex-col md:flex-row w-full h-screen">
        <div className="hidden md:block w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>

            <h2 className="text-3xl font-bold mb-6 text-white">Password Reset</h2>
            <p className="text-white/80">Secure password reset for your account.</p>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
          <div className="block md:hidden mb-8">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>
        
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold inline">
                <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
              </h2>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Reset Link Issue</h1>
              <p className="text-gray-600 mb-4">There was an issue with your password reset link.</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>What happened:</strong>
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• The reset link may have been used or expired</li>
                  <li>• There might be a browser or network issue</li>
                  <li>• The link may have been corrupted</li>
                </ul>
              </div>
              <p className="text-gray-600 mb-6">Please try requesting a new password reset link.</p>
              <Link to="/login" className="text-indigo-600 hover:underline">
                Back to login and request new reset link
              </Link>
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="hidden md:block w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>

          <h2 className="text-3xl font-bold mb-6 text-white">Reset Password</h2>
          <p className="text-white/80">Create a new secure password for your account.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="block md:hidden mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold inline">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Create New Password</h1>
          <p className="text-gray-600 mb-8 text-center">Enter your new password below</p>
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full py-6 text-neutral-50">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating password...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:underline">
              Back to sign in
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Password must be at least 6 characters long</p>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
