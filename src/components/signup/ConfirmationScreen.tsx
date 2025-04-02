
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ConfirmationScreen = () => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        setIsLoading(true);
        
        // First check URL parameters for status
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        
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
          // If no session or status param, redirect to homepage after a delay
          setTimeout(() => navigate('/'), 5000);
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
        
        {isApproved ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to join our team. Your information has been received and will be reviewed by our team.
            </p>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-md text-left">
                <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                <p className="text-sm text-blue-700">
                  1. Check your Gmail inbox for a confirmation email<br />
                  2. Complete any verification steps in the email<br />
                  3. Our team will review your application<br />
                  4. You'll receive instructions for onboarding if approved
                </p>
              </div>
            </div>
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
          <Button 
            asChild
            className={isApproved ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700"}
          >
            <Link to="/">Return to Homepage</Link>
          </Button>
          
          {isApproved && (
            <Button 
              asChild
              variant="outline"
            >
              <Link to="/login">Go to Login</Link>
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
