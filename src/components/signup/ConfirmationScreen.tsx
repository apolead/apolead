
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, X, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSignUp } from '@/contexts/SignUpContext';

const ConfirmationScreen = () => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [processingPassword, setProcessingPassword] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(15); // Extended countdown time
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { confirmationSent } = useSignUp();

  // Check for token in URL query parameters
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        setIsLoading(true);
        
        // Parse URL parameters
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');
        const type = url.searchParams.get('type');
        
        // If we have tokens, this is from a confirmation email link
        if (accessToken && refreshToken && type === 'signup') {
          console.log('Confirmation email tokens found, setting session');
          // Store the tokens in supabase session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setIsApproved(false);
          } else {
            setIsApproved(true);
            setShowPasswordForm(true);
          }
          setIsLoading(false);
          return;
        }
        
        // Regular status check as before
        if (status === 'rejected') {
          setIsApproved(false);
          setIsLoading(false);
          return;
        } else if (status === 'approved') {
          setIsApproved(true);
          setIsLoading(false);
          return;
        }
        
        // If no status in URL, check session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check application status in user_profiles
          const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('application_status')
            .eq('user_id', session.user.id)
            .single();
          
          if (error) throw error;
          
          if (profiles && profiles.application_status === 'rejected') {
            setIsApproved(false);
          } else {
            setIsApproved(true);
          }
        } else {
          // If no session found, default to approved (should not happen)
          console.warn("No session found and no status in URL, defaulting to approved");
          setIsApproved(true);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
        // Default to approved on error
        setIsApproved(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApplicationStatus();
  }, [navigate]);

  // Countdown timer for redirection
  useEffect(() => {
    let timer: number;
    
    // Start countdown for redirection if approved and not showing password form
    if (isApproved && !showPasswordForm && !isLoading) {
      timer = window.setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isApproved, showPasswordForm, isLoading, navigate]);

  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingPassword(true);
    
    try {
      // Update user password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      // Update application status to confirmed in user_profiles
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update the user profile to mark as confirmed
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ application_status: 'confirmed' })
          .eq('user_id', user.id);
          
        if (updateError) {
          console.error('Error updating profile status:', updateError);
          // Continue anyway as the password has been set
        }
      }
      
      toast({
        title: "Password Set Successfully",
        description: "Your password has been set. You can now log in.",
      });
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error setting password:', error);
      toast({
        title: "Error Setting Password",
        description: error.message || "An error occurred setting your password.",
        variant: "destructive",
      });
    } finally {
      setProcessingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading your application status...</h2>
          <p className="text-gray-600">Please wait while we check your application status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className={`max-w-md w-full ${isApproved ? 'bg-white' : 'bg-red-50'} rounded-lg shadow-md p-8 text-center`}>
        <div className={`h-16 w-16 rounded-full ${isApproved ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mx-auto mb-6`}>
          {isApproved ? (
            <Check className={`h-8 w-8 text-green-600`} />
          ) : (
            <X className={`h-8 w-8 text-red-600`} />
          )}
        </div>
        
        {isApproved && showPasswordForm ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Set Your Password</h2>
            <p className="text-gray-600 mb-6">
              Your application has been approved! Please set a password to complete your registration.
            </p>
            <form onSubmit={handlePasswordSetup} className="space-y-4 text-left">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={processingPassword}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  disabled={processingPassword}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={processingPassword}
              >
                {processingPassword ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting password...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Key className="mr-2 h-4 w-4" />
                    Set Password and Complete Registration
                  </div>
                )}
              </Button>
            </form>
          </>
        ) : isApproved ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to join our team. Your information has been received and will be reviewed by our team.
            </p>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-md text-left">
                <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                <p className="text-sm text-blue-700">
                  {confirmationSent ? (
                    <>
                      1. Check your email for a confirmation link<br />
                      2. Click the link to set your password<br />
                      3. Once your password is set, you can log in to your account<br />
                      4. You'll receive further instructions for onboarding
                    </>
                  ) : (
                    <>
                      1. Our team will review your application<br />
                      2. You'll receive an email with the result of your application<br />
                      3. If approved, you'll be provided next steps for onboarding<br />
                      4. If rejected, you'll be notified of the reasons
                    </>
                  )}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Redirecting to homepage in {redirectCountdown} seconds...
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-800">Unable to Proceed with Your Application</h2>
            <p className="text-gray-700 mb-6">
              We appreciate your interest in joining our team. However, based on the information you've provided, we're unable to move forward with your application at this time.
            </p>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-red-100 rounded-md text-left">
                <h3 className="font-semibold text-red-800 mb-2">Common reasons for this outcome:</h3>
                <p className="text-sm text-red-700">
                  • Unable to meet the minimum time commitment<br />
                  • Missing necessary equipment or workspace requirements<br />
                  • Unable to fulfill all job requirements<br />
                  • Geographic restrictions based on your location
                </p>
              </div>
            </div>
          </>
        )}
        
        <div className="space-x-4">
          {!showPasswordForm && (
            <Button 
              asChild
              className={isApproved ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700"}
            >
              <Link to="/">Return to Homepage</Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 ApoLead. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
