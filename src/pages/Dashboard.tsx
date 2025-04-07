
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import TrainingModal from '@/components/training/TrainingModal';
import ProbationTrainingModal from '@/components/training/ProbationTrainingModal';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showProbationTraining, setShowProbationTraining] = useState(false);
  const [isOnProbation, setIsOnProbation] = useState(false);
  
  useEffect(() => {
    const checkProbationStatus = async () => {
      if (!user?.id) return;
      
      try {
        // Use the is_user_on_probation RPC function
        const { data, error } = await supabase.rpc(
          'is_user_on_probation', 
          { input_user_id: user.id }
        ) as { data: boolean | null; error: Error | null };
        
        if (error) {
          console.error("Error checking probation status:", error);
          return;
        }
        
        setIsOnProbation(!!data);
      } catch (error) {
        console.error("Exception checking probation status:", error);
      }
    };
    
    checkProbationStatus();
  }, [user?.id, userProfile?.agent_standing]);
  
  useEffect(() => {
    // If the user is not eligible for training (answered "No" to any key questions)
    // then onboarding modal should not be shown even if they try to click the button
    if (userProfile && !userProfile.eligible_for_training && userProfile.onboarding_completed === false) {
      const hasAnsweredNo = (
        userProfile.meet_obligation === false || 
        userProfile.login_discord === false || 
        userProfile.check_emails === false || 
        userProfile.solve_problems === false || 
        userProfile.complete_training === false || 
        userProfile.has_headset === false || 
        userProfile.has_quiet_place === false
      );
      
      // If they've answered "No" to any questions and tried to open onboarding
      if (hasAnsweredNo && showOnboarding) {
        setShowOnboarding(false);
        toast({
          title: "Not Eligible",
          description: "You've answered 'No' to one or more required questions and are not eligible to continue."
        });
      }
    }
  }, [showOnboarding, userProfile]);
  
  const handleTrainingComplete = (passed: boolean) => {
    if (passed) {
      toast({
        title: "Training Completed",
        description: "You have successfully completed the initial training."
      });
    } else {
      toast({
        title: "Training Not Completed",
        description: "Please try the training quiz again later."
      });
    }
  };
  
  const getOnboardingButtonText = () => {
    if (!userProfile) return "Loading...";
    
    if (userProfile.onboarding_completed) {
      return "Onboarding Completed ✓";
    }
    
    if (!userProfile.eligible_for_training) {
      const hasAnsweredNo = (
        userProfile.meet_obligation === false || 
        userProfile.login_discord === false || 
        userProfile.check_emails === false || 
        userProfile.solve_problems === false || 
        userProfile.complete_training === false || 
        userProfile.has_headset === false || 
        userProfile.has_quiet_place === false
      );
      
      if (hasAnsweredNo) {
        return "Not Eligible";
      }
    }
    
    return "Continue Onboarding";
  };
  
  const getOnboardingButtonStyle = () => {
    if (!userProfile) return {};
    
    if (userProfile.onboarding_completed) {
      return {
        backgroundColor: "#10B981",
        cursor: "default"
      };
    }
    
    if (!userProfile.eligible_for_training) {
      const hasAnsweredNo = (
        userProfile.meet_obligation === false || 
        userProfile.login_discord === false || 
        userProfile.check_emails === false || 
        userProfile.solve_problems === false || 
        userProfile.complete_training === false || 
        userProfile.has_headset === false || 
        userProfile.has_quiet_place === false
      );
      
      if (hasAnsweredNo) {
        return {
          backgroundColor: "#EF4444",
          cursor: "default"
        };
      }
    }
    
    return {};
  };
  
  const handleOnboardingButtonClick = () => {
    if (!userProfile) return;
    
    if (userProfile.onboarding_completed) {
      toast({
        title: "Onboarding Completed",
        description: "You have already completed the onboarding process."
      });
      return;
    }
    
    if (!userProfile.eligible_for_training) {
      const hasAnsweredNo = (
        userProfile.meet_obligation === false || 
        userProfile.login_discord === false || 
        userProfile.check_emails === false || 
        userProfile.solve_problems === false || 
        userProfile.complete_training === false || 
        userProfile.has_headset === false || 
        userProfile.has_quiet_place === false
      );
      
      if (hasAnsweredNo) {
        toast({
          title: "Not Eligible",
          description: "You've answered 'No' to one or more required questions and are not eligible to continue."
        });
        return;
      }
    }
    
    setShowOnboarding(true);
  };
  
  // Show the probation training button if the user's agent_standing is "Probation"
  const showProbationTrainingButton = isOnProbation;
  
  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
        <div className="md:col-span-1 bg-gray-900">
          <DashboardSidebar />
        </div>
        
        <div className="md:col-span-4 p-0 bg-gray-50">
          <div className="bg-white shadow-sm">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Initial Onboarding */}
              <div className="col-span-1 bg-white shadow rounded-lg p-6">
                <div className="space-y-4">
                  <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    STEP 1
                  </span>
                  <h2 className="text-lg font-semibold text-gray-800">Initial Onboarding</h2>
                  <p className="text-sm text-gray-600">
                    Complete your profile and required documentation to begin your agent journey.
                  </p>
                  <Button 
                    onClick={handleOnboardingButtonClick}
                    disabled={userProfile?.onboarding_completed || (userProfile && !userProfile.eligible_for_training && (
                      userProfile.meet_obligation === false || 
                      userProfile.login_discord === false || 
                      userProfile.check_emails === false || 
                      userProfile.solve_problems === false || 
                      userProfile.complete_training === false || 
                      userProfile.has_headset === false || 
                      userProfile.has_quiet_place === false
                    ))}
                    style={getOnboardingButtonStyle()}
                    className="w-full"
                  >
                    {getOnboardingButtonText()}
                  </Button>
                </div>
              </div>
              
              {/* Step 2: Initial Training */}
              <div className="col-span-1 bg-white shadow rounded-lg p-6">
                <div className="space-y-4">
                  <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    STEP 2
                  </span>
                  <h2 className="text-lg font-semibold text-gray-800">Initial Training</h2>
                  <p className="text-sm text-gray-600">
                    Watch our training video and complete a quiz to verify your understanding.
                  </p>
                  <Button 
                    onClick={() => setShowTraining(true)}
                    disabled={!userProfile?.onboarding_completed || userProfile?.quiz_passed === true}
                    className="w-full"
                    style={userProfile?.quiz_passed ? { backgroundColor: "#10B981" } : {}}
                  >
                    {userProfile?.quiz_passed 
                      ? "Training Completed ✓" 
                      : "Start Training"}
                  </Button>
                </div>
              </div>
              
              {/* Additional Steps based on user's status */}
              {showProbationTrainingButton && (
                <div className="col-span-1 bg-white shadow rounded-lg p-6">
                  <div className="space-y-4">
                    <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                      REQUIRED
                    </span>
                    <h2 className="text-lg font-semibold text-gray-800">Probation Training</h2>
                    <p className="text-sm text-gray-600">
                      Complete additional training modules required for agents on probation.
                    </p>
                    <Button 
                      onClick={() => setShowProbationTraining(true)}
                      disabled={userProfile?.probation_training_completed}
                      className="w-full"
                      style={userProfile?.probation_training_completed ? { backgroundColor: "#10B981" } : {}}
                    >
                      {userProfile?.probation_training_completed 
                        ? "Training Completed ✓" 
                        : "Start Probation Training"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)}
        />
      )}
      
      {showTraining && userProfile?.onboarding_completed && (
        <TrainingModal 
          isOpen={showTraining}
          onClose={() => setShowTraining(false)}
          onComplete={handleTrainingComplete}
        />
      )}
      
      {showProbationTraining && isOnProbation && (
        <ProbationTrainingModal
          isOpen={showProbationTraining}
          onClose={() => setShowProbationTraining(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
