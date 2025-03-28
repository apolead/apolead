import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { idToString, profileExists, safelyAccessProfile } from '@/utils/supabaseHelpers';

const ConfirmationScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    
    if (statusParam) {
      setStatus(statusParam);
      setIsLoading(false);
    } else {
      checkApplicationStatus();
    }
  }, [location]);
  
  const checkApplicationStatus = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('user_id', idToString(session.user.id))
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profileExists(profile)) {
          setStatus(safelyAccessProfile(profile, 'application_status') || 'pending');
        }
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <h2 className="text-xl font-medium">Checking application status...</h2>
        </div>
      );
    }
    
    switch (status) {
      case 'approved':
        return (
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Application Approved!</h2>
            <p className="text-gray-600 mb-6">
              Congratulations! Your application has been approved. You can now log in to your dashboard to start working with us.
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        );
      case 'rejected':
        return (
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <X className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Application Not Approved</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but your application didn't meet our qualifications at this time. You may apply again after 30 days.
            </p>
            <Link to="/">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                Return to Home
              </Button>
            </Link>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Application Under Review</h2>
            <p className="text-gray-600 mb-6">
              Your application is being reviewed by our team. This process typically takes 1-2 business days. We'll notify you by email once a decision has been made.
            </p>
            <Link to="/">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                Return to Home
              </Button>
            </Link>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
