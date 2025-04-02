
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, X, Loader2, Key, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSignUp } from '@/contexts/SignUpContext';

const ConfirmationScreen = () => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingSendEmail, setProcessingSendEmail] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(15);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userData, confirmationSent, updateUserData } = useSignUp();

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
            // User is confirmed - redirect to dashboard instead of showing password form
            toast({
              title: "Account Confirmed",
              description: "Your account has been confirmed. Redirecting to dashboard.",
              duration: 3000,
            });
            
            // Wait a moment before redirecting
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
            return;
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
  }, [navigate, toast]);

  // Countdown timer for redirection
  useEffect(() => {
    let timer: number;
    
    // Start countdown for redirection if approved and not sending email
    if (isApproved && !processingSendEmail && !isLoading) {
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
  }, [isApproved, processingSendEmail, isLoading, navigate]);

  const handleSendConfirmation = async () => {
    setProcessingSendEmail(true);
    
    try {
      // Call our edge function to send the confirmation email
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          email: userData.email,
          redirectUrl: `${window.location.origin}/confirmation?status=approved`
        })
      });
      
      if (!response.ok) {
        console.error('Error calling send-confirmation function:', await response.text());
        toast({
          title: "Email Notification Error",
          description: "There was an issue sending your confirmation email. Please contact support.",
          variant: "destructive",
          duration: 8000,
        });
        setProcessingSendEmail(false);
        return;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error sending confirmation email:', result.error);
        toast({
          title: "Email Notification Error",
          description: "There was an issue sending your confirmation email. Please contact support.",
          variant: "destructive",
          duration: 8000,
        });
        setProcessingSendEmail(false);
        return;
      }
      
      console.log('Confirmation email sent successfully');
      // Store the temporary password if returned
      if (result.tempPassword) {
        setTempPassword(result.tempPassword);
      }
      
      // Update user data to show confirmation sent
      updateUserData({ confirmationSent: true });
      
      toast({
        title: "Confirmation Email Sent",
        description: "A confirmation email has been sent to your inbox with instructions to complete your registration.",
        duration: 8000,
      });
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast({
        title: "Email Notification Error",
        description: "There was an issue sending your confirmation email. Please contact support.",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setProcessingSendEmail(false);
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
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center">
            <span className="text-3xl font-bold">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </span>
          </div>
        </div>
        
        <div className={`h-16 w-16 rounded-full ${isApproved ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mx-auto mb-6`}>
          {isApproved ? (
            <Check className={`h-8 w-8 text-green-600`} />
          ) : (
            <X className={`h-8 w-8 text-red-600`} />
          )}
        </div>
        
        {isApproved ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to join our team. Your information has been received and will be reviewed by our team.
            </p>
            
            {tempPassword && (
              <div className="p-4 mb-6 bg-yellow-50 border border-yellow-100 rounded-md">
                <h3 className="font-semibold text-yellow-800 mb-2">Your Temporary Password</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Please save this password for logging in. You'll be asked to reset it on your first login.
                </p>
                <div className="bg-white p-3 rounded border border-yellow-200 font-mono text-center">
                  {tempPassword}
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-md text-left border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                <p className="text-sm text-blue-700">
                  {confirmationSent ? (
                    <>
                      <div className="flex items-start my-2">
                        <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <span>Please check your email for a confirmation link with the subject <strong>"Confirm Your Signup"</strong></span>
                      </div>
                      <div className="pl-7 space-y-2 mt-2">
                        <div className="flex items-center">
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">1</div>
                          <span>Click the <strong>"Confirm your mail"</strong> button in the email</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">2</div>
                          <span>You will be automatically redirected to the dashboard</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">3</div>
                          <span>Complete the onboarding process to access training</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      1. Our team will review your application<br />
                      2. If approved, click the "Join Today" button below to receive your confirmation email<br />
                      3. Follow the instructions in the email to complete your registration
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {!confirmationSent && (
              <Button 
                onClick={handleSendConfirmation} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 mb-6"
                disabled={processingSendEmail}
              >
                {processingSendEmail ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending confirmation...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Join Today
                  </div>
                )}
              </Button>
            )}
            
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
        
        <div className="space-x-4 mt-6">
          <Button 
            asChild
            className={isApproved ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700"}
          >
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 ApoLead. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
