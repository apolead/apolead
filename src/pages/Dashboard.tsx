
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import TrainingModal from '@/components/training/TrainingModal';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, userProfile, loading, updateProfile, checkEligibility } = useAuth();
  const navigate = useNavigate();
  
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  
  // Used to force a re-render when modals complete actions
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Determine the status of each section based on userProfile data
  const onboardingStatus = userProfile?.onboarding_completed === true ? 'completed' : 'pending';
  const isEligible = userProfile?.eligible_for_training === true;
  
  const trainingStatus = () => {
    if (!isEligible) return 'locked';
    if (userProfile?.quiz_passed === true) return 'completed';
    if (userProfile?.training_video_watched === true) return 'in-progress';
    return 'pending';
  };
  
  const interviewStatus = () => {
    if (!isEligible) return 'locked';
    if (trainingStatus() !== 'completed') return 'locked';
    // Add logic for completed interviews when implemented
    return 'pending';
  };
  
  const billingStatus = () => {
    if (!isEligible) return 'locked';
    if (trainingStatus() !== 'completed') return 'locked';
    if (userProfile?.account_number && userProfile?.routing_number) return 'completed';
    return 'pending';
  };
  
  // Handle click on onboarding section
  const handleOnboardingClick = () => {
    setShowOnboardingModal(true);
  };
  
  // Handle click on training section
  const handleTrainingClick = () => {
    if (trainingStatus() === 'locked') {
      toast.error("You must complete onboarding and be eligible for training first");
      return;
    }
    setShowTrainingModal(true);
  };
  
  // Handle click on interview scheduling section
  const handleInterviewClick = () => {
    if (interviewStatus() === 'locked') {
      toast.error("You must complete the training and quiz first");
      return;
    }
    // Open scheduling modal or redirect to scheduling page
    toast.info("Interview scheduling will be implemented soon");
  };
  
  // Handle click on billing information section
  const handleBillingClick = () => {
    if (billingStatus() === 'locked') {
      toast.error("You must complete the training and quiz first");
      return;
    }
    navigate('/billing');
  };
  
  // Handle training completion
  const handleTrainingComplete = (passed: boolean) => {
    console.log("Training completed with result:", passed ? "Passed" : "Failed");
    setRefreshCounter(prev => prev + 1);
  };
  
  // Status indicator component
  const StatusIndicator = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      case 'locked':
        return <XCircle className="h-6 w-6 text-gray-400" />;
      default:
        return null;
    }
  };
  
  // Force eligibility check when userProfile updates
  useEffect(() => {
    if (userProfile && !userProfile.eligible_for_training) {
      checkEligibility();
    }
  }, [userProfile, refreshCounter]);
  
  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Application Process</h2>
        
        {userProfile?.application_status === 'rejected' && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Application Rejected</AlertTitle>
            <AlertDescription>
              We're sorry, but your application has been rejected. 
              Please contact support for more information.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Onboarding Section */}
          <div className={`border rounded-lg overflow-hidden ${!isEligible && onboardingStatus === 'completed' ? 'border-red-300' : 'border-gray-200'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${!isEligible && onboardingStatus === 'completed' ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <StatusIndicator status={onboardingStatus} />
                <h3 className="text-lg font-medium">Initial Onboarding</h3>
              </div>
              <Button
                onClick={handleOnboardingClick}
                variant={onboardingStatus === 'completed' ? 'outline' : 'default'}
              >
                {onboardingStatus === 'completed' ? 'View Details' : 'Complete Now'}
              </Button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Complete your profile information and system requirements check.
              </p>
              {!isEligible && onboardingStatus === 'completed' && (
                <Alert variant="destructive">
                  <AlertTitle>Not Eligible</AlertTitle>
                  <AlertDescription>
                    Based on your answers, you're not eligible to continue with the application process.
                    Please review your responses or contact support.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          {/* Training Section */}
          <div className={`border rounded-lg overflow-hidden ${trainingStatus() === 'locked' ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${trainingStatus() === 'locked' ? 'bg-gray-100' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <StatusIndicator status={trainingStatus()} />
                <h3 className="text-lg font-medium">Training & Quiz</h3>
              </div>
              <Button
                onClick={handleTrainingClick}
                variant={trainingStatus() === 'completed' ? 'outline' : 'default'}
                disabled={trainingStatus() === 'locked'}
              >
                {trainingStatus() === 'completed' 
                  ? 'View Results' 
                  : trainingStatus() === 'in-progress' 
                    ? 'Continue' 
                    : 'Start Training'}
              </Button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Watch the training video and complete the knowledge quiz.
              </p>
              {trainingStatus() === 'locked' && (
                <p className="text-sm text-gray-500 mt-2">
                  Complete onboarding and meet eligibility requirements to unlock.
                </p>
              )}
            </div>
          </div>
          
          {/* Interview Scheduling Section */}
          <div className={`border rounded-lg overflow-hidden ${interviewStatus() === 'locked' ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${interviewStatus() === 'locked' ? 'bg-gray-100' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <StatusIndicator status={interviewStatus()} />
                <h3 className="text-lg font-medium">Interview Scheduling</h3>
              </div>
              <Button
                onClick={handleInterviewClick}
                variant={interviewStatus() === 'completed' ? 'outline' : 'default'}
                disabled={interviewStatus() === 'locked'}
              >
                {interviewStatus() === 'completed' ? 'View Schedule' : 'Schedule Interview'}
              </Button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Schedule your interview with our hiring team.
              </p>
              {interviewStatus() === 'locked' && (
                <p className="text-sm text-gray-500 mt-2">
                  Complete the training and quiz to unlock.
                </p>
              )}
            </div>
          </div>
          
          {/* Billing Information Section */}
          <div className={`border rounded-lg overflow-hidden ${billingStatus() === 'locked' ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${billingStatus() === 'locked' ? 'bg-gray-100' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <StatusIndicator status={billingStatus()} />
                <h3 className="text-lg font-medium">Billing Information</h3>
              </div>
              <Button
                onClick={handleBillingClick}
                variant={billingStatus() === 'completed' ? 'outline' : 'default'}
                disabled={billingStatus() === 'locked'}
              >
                {billingStatus() === 'completed' ? 'View Details' : 'Add Information'}
              </Button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Provide your payment details for compensation.
              </p>
              {billingStatus() === 'locked' && (
                <p className="text-sm text-gray-500 mt-2">
                  Complete the training and quiz to unlock.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showOnboardingModal && (
        <OnboardingModal 
          isOpen={showOnboardingModal} 
          onClose={() => {
            setShowOnboardingModal(false);
            setRefreshCounter(prev => prev + 1);
          }} 
          user={user}
          initialUserData={userProfile}
        />
      )}
      
      {showTrainingModal && (
        <TrainingModal 
          isOpen={showTrainingModal} 
          onClose={() => {
            setShowTrainingModal(false);
            setRefreshCounter(prev => prev + 1);
          }}
          onComplete={handleTrainingComplete}
        />
      )}
    </DashboardShell>
  );
};

export default Dashboard;
