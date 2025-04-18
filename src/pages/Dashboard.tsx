
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import TrainingModal from '@/components/training/TrainingModal';
import AdditionalTrainingModal from '@/components/training/AdditionalTrainingModal';
import PolicyAcknowledgmentDialog from '@/components/dashboard/PolicyAcknowledgmentDialog';
import { CheckCircle, ChevronDown, Lock, Search, Settings, Bell, AlertTriangle, XCircle, GraduationCap, CreditCard, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const {
    user,
    userProfile,
    loading,
    refreshUserProfile,
    acknowledgePolicies
  } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isProbationTrainingOpen, setIsProbationTrainingOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(20);
  const [onboardingStatus, setOnboardingStatus] = useState('not_started');
  const [trainingStatus, setTrainingStatus] = useState('not_started');
  const [additionalTrainingStatus, setAdditionalTrainingStatus] = useState('not_started');
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showBankingDialog, setShowBankingDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const processedProfileRef = useRef(false);
  const initialLoadRef = useRef(true);

  const processUserProfile = useCallback(() => {
    if (userProfile && !processedProfileRef.current) {
      console.log("Dashboard: User profile loaded", {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        birth_day: userProfile.birth_day,
        gov_id_number: userProfile.gov_id_number,
        gov_id_image: userProfile.gov_id_image,
        onboarding_completed: userProfile.onboarding_completed,
        eligible_for_training: userProfile.eligible_for_training,
        has_headset: userProfile.has_headset,
        has_quiet_place: userProfile.has_quiet_place,
        meet_obligation: userProfile.meet_obligation,
        login_discord: userProfile.login_discord,
        check_emails: userProfile.check_emails,
        solve_problems: userProfile.solve_problems,
        complete_training: userProfile.complete_training,
        quiz_passed: userProfile.quiz_passed,
        training_video_watched: userProfile.training_video_watched,
        agent_standing: userProfile.agent_standing,
        probation_training_passed: userProfile.probation_training_passed,
        probation_training_completed: userProfile.probation_training_completed,
        telemarketing_policy_acknowledged: userProfile.telemarketing_policy_acknowledged,
        do_not_call_policy_acknowledged: userProfile.do_not_call_policy_acknowledged
      });
      const isOnboardingCompletedFlag = userProfile.onboarding_completed === true;
      const isEligible = userProfile.eligible_for_training === true;
      const hasRequiredFields = userProfile.first_name && userProfile.last_name && userProfile.birth_day && userProfile.gov_id_number && userProfile.gov_id_image && userProfile.has_headset === true && userProfile.has_quiet_place === true && userProfile.meet_obligation === true && userProfile.login_discord === true && userProfile.check_emails === true && userProfile.solve_problems === true && userProfile.complete_training === true;
      if (userProfile.quiz_passed === true) {
        setTrainingStatus('completed');
        setShowInterviewScheduler(true);
      } else if (userProfile.quiz_passed === false) {
        setTrainingStatus('failed');
      } else {
        setTrainingStatus('not_started');
      }
      if (userProfile.probation_training_completed === true) {
        if (userProfile.probation_training_passed === true) {
          setAdditionalTrainingStatus('completed');
        } else {
          setAdditionalTrainingStatus('failed');
        }
      } else {
        setAdditionalTrainingStatus('not_started');
      }
      console.log("Dashboard: Eligibility check", {
        isOnboardingCompletedFlag,
        isEligible,
        hasRequiredFields,
        eligible_for_training_type: typeof userProfile.eligible_for_training,
        onboarding_completed_type: typeof userProfile.onboarding_completed,
        trainingStatus,
        additionalTrainingStatus,
        quiz_passed: userProfile.quiz_passed,
        quiz_passed_type: typeof userProfile.quiz_passed,
        probation_training_passed: userProfile.probation_training_passed,
        probation_training_completed: userProfile.probation_training_completed,
        telemarketing_policy_acknowledged: userProfile.telemarketing_policy_acknowledged,
        do_not_call_policy_acknowledged: userProfile.do_not_call_policy_acknowledged
      });
      if (isOnboardingCompletedFlag) {
        if (isEligible) {
          setOnboardingStatus('completed');
        } else {
          setOnboardingStatus('ineligible');
        }
        setOnboardingCompleted(true);
      } else if (userProfile.first_name || userProfile.last_name) {
        setOnboardingStatus('incomplete');
        setOnboardingCompleted(false);
      } else {
        setOnboardingStatus('not_started');
        setOnboardingCompleted(false);
      }
      if (onboardingStatus === 'completed' || onboardingStatus === 'ineligible') {
        setOnboardingProgress(100);
      } else if (onboardingStatus === 'incomplete') {
        const hasBasicInfo = userProfile.first_name && userProfile.last_name && userProfile.birth_day && userProfile.gov_id_number && userProfile.gov_id_image;
        setOnboardingProgress(hasBasicInfo ? 60 : 40);
      } else {
        setOnboardingProgress(20);
      }
      console.log("Dashboard: Onboarding status set to", onboardingStatus, "Progress:", onboardingProgress);
      processedProfileRef.current = true;
    }
  }, [userProfile, onboardingStatus, onboardingProgress]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (userProfile && !processedProfileRef.current) {
      processUserProfile();
    }
    if (!userProfile) {
      processedProfileRef.current = false;
    }
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
    }
  }, [user, loading, userProfile, navigate, processUserProfile]);

  const openOnboardingModal = () => {
    if (onboardingCompleted) {
      toast({
        title: userProfile?.eligible_for_training ? "Onboarding Completed" : "Not Eligible for Training",
        description: userProfile?.eligible_for_training ? "You have successfully completed onboarding." : "You are not eligible for training based on your answers.",
        variant: userProfile?.eligible_for_training ? "default" : "destructive"
      });
      return;
    }
    setIsModalOpen(true);
  };

  const closeOnboardingModal = async () => {
    setIsModalOpen(false);
    if (user) {
      try {
        await refreshUserProfile();
        processedProfileRef.current = false;
      } catch (err) {
        console.error("Error refreshing user profile:", err);
      }
    }
  };

  const openTrainingModal = () => {
    setIsTrainingModalOpen(true);
  };

  const closeTrainingModal = (passed = false) => {
    setIsTrainingModalOpen(false);
    if (passed) {
      setShowInterviewScheduler(true);
      setTrainingStatus('completed');
    }
    refreshUserProfile();
  };

  const openAdditionalTrainingModal = () => {
    setIsProbationTrainingOpen(true);
  };

  const closeAdditionalTrainingModal = () => {
    setIsProbationTrainingOpen(false);
    refreshUserProfile().then(() => {
      processedProfileRef.current = false;
    });
  };

  const handleScheduleInterview = () => {
    console.log("Dashboard: Opening schedule interview dialog");
    setShowScheduleDialog(true);
  };

  const handleGetStarted = () => {
    console.log("Dashboard: Opening policy acknowledgment dialog");
    // Check if policies are already acknowledged
    if (userProfile?.telemarketing_policy_acknowledged && userProfile?.do_not_call_policy_acknowledged) {
      setShowBankingDialog(true);
    } else {
      setShowPolicyDialog(true);
    }
  };

  const handlePolicyAcknowledge = async (name: string) => {
    try {
      await acknowledgePolicies(name);
      toast({
        title: "Policies Acknowledged",
        description: "Thank you for acknowledging our policies.",
        variant: "default"
      });
      setShowPolicyDialog(false);
      // Immediately show banking dialog after acknowledging policies
      setShowBankingDialog(true);
    } catch (error) {
      console.error("Error acknowledging policies:", error);
      toast({
        title: "Error",
        description: "There was an error acknowledging the policies. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigateToBilling = () => {
    setShowBankingDialog(false);
    navigate('/billing');
  };

  const getOnboardingButtonText = () => {
    switch (onboardingStatus) {
      case 'not_started':
        return 'Start Onboarding';
      case 'incomplete':
        return 'Continue Onboarding';
      case 'ineligible':
        return 'Not Eligible';
      case 'completed':
        return 'Completed';
      default:
        return 'Start Onboarding';
    }
  };

  const getOnboardingButtonStyle = () => {
    switch (onboardingStatus) {
      case 'not_started':
      case 'incomplete':
        return 'card-button button-incomplete p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(245,158,11,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(245,158,11,0.3)]';
      case 'ineligible':
        return 'card-button button-ineligible p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(239,68,68,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(239,68,68,0.3)]';
      case 'completed':
        return 'card-button button-completed p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]';
      default:
        return 'card-button button-incomplete p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(245,158,11,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(245,158,11,0.3)]';
    }
  };

  const getOnboardingIcon = () => {
    switch (onboardingStatus) {
      case 'ineligible':
        return <XCircle className="mr-[8px] text-[16px]" />;
      case 'incomplete':
        return <AlertTriangle className="mr-[8px] text-[16px]" />;
      case 'completed':
        return <CheckCircle className="mr-[8px] text-[16px]" />;
      default:
        return null;
    }
  };

  const getTrainingButtonStyle = () => {
    switch (trainingStatus) {
      case 'completed':
        return 'button-completed p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]';
      case 'failed':
        return 'button-ineligible p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(239,68,68,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(239,68,68,0.3)]';
      default:
        return 'button-completed p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]';
    }
  };

  const getTrainingButtonText = () => {
    switch (trainingStatus) {
      case 'completed':
        return 'Training Completed';
      case 'failed':
        return 'Training Failed';
      default:
        return 'Start Training';
    }
  };

  const getTrainingIcon = () => {
    switch (trainingStatus) {
      case 'completed':
        return <CheckCircle className="mr-[8px] text-[16px]" />;
      case 'failed':
        return <XCircle className="mr-[8px] text-[16px]" />;
      default:
        return <CheckCircle className="mr-[8px] text-[16px]" />;
    }
  };

  const getAdditionalTrainingButtonStyle = () => {
    switch (additionalTrainingStatus) {
      case 'completed':
        return 'card-button p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]';
      case 'failed':
        return 'card-button p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(239,68,68,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(239,68,68,0.3)]';
      default:
        return 'card-button p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(59,130,246,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(59,130,246,0.3)]';
    }
  };

  const getAdditionalTrainingButtonText = () => {
    switch (additionalTrainingStatus) {
      case 'completed':
        return 'Training Completed';
      case 'failed':
        return 'Waitlisted';
      default:
        return 'Start Training';
    }
  };

  const getAdditionalTrainingIcon = () => {
    switch (additionalTrainingStatus) {
      case 'completed':
        return <CheckCircle className="mr-[8px] text-[16px]" />;
      case 'failed':
        return <AlertTriangle className="mr-[8px] text-[16px]" />;
      default:
        return <GraduationCap className="mr-[8px] text-[16px]" />;
    }
  };

  useEffect(() => {
    if (showScheduleDialog) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showScheduleDialog]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const isProbationAgent = userProfile?.agent_standing === 'probation' || userProfile?.agent_standing === 'Probation';
  const hasPassedAdditionalTraining = userProfile?.probation_training_passed === true;

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeItem="dashboard" />
      
      <div className="flex-1 p-[20px_30px]">
        <div className="flex justify-between items-center mb-[25px]">
          <div className="welcome text-[26px] font-[600] text-[#1e293b]">
            Thanks for signing up, <span className="text-[#4f46e5] relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[2px]">
              {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}
            </span>!
          </div>
          
          <div className="user-info flex items-center">
            <div className="action-buttons flex gap-[15px] mr-[20px]">
              <div className="action-button w-[42px] h-[42px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer text-[#64748b] transition-all hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] hover:text-[#4f46e5]">
                <Search size={18} />
              </div>
              <div className="action-button notification w-[42px] h-[42px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer text-[#64748b] transition-all hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] hover:text-[#4f46e5] relative after:content-[''] after:absolute after:top-[10px] after:right-[10px] after:w-[8px] after:h-[8px] after:rounded-full after:bg-[#f56565] after:border-2 after:border-white">
                <Bell size={18} />
              </div>
              <div className="action-button w-[42px] h-[42px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer text-[#64748b] transition-all hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] hover:text-[#4f46e5]">
                <Settings size={18} />
              </div>
            </div>
            
            <div className="user-profile flex items-center bg-white rounded-[50px] p-[8px_15px_8px_8px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer transition-all hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] hover:transform hover:-translate-y-[3px]">
              <div className="user-avatar w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white flex items-center justify-center font-[600] text-[16px] mr-[10px]">
                {userProfile?.first_name ? userProfile.first_name[0] : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <span className="user-name font-[500] text-[#1e293b]">
                {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="ml-[8px] text-[#64748b]" size={16} />
            </div>
          </div>
        </div>
        
        <div className="page-title flex items-center mb-[20px]">
          <h2 className="text-[24px] font-[600] text-[#1e293b] flex items-center">
            <div className="page-title-icon mr-[12px] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[16px]">
              <i className="fas fa-clipboard-list"></i>
            </div>
            Onboarding Process
          </h2>
          <div className="page-subtitle text-[#64748b] ml-[15px] text-[14px] pl-[15px] border-l-2 border-[#e2e8f0]">
            Complete all steps to start earning
          </div>
        </div>
        
        <div className="stats grid grid-cols-4 gap-[25px] mb-[25px]">
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden hover:transform hover:-translate-y-[8px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:from-[rgba(79,70,229,0.1)] before:to-[rgba(79,70,229,0)] before:rounded-[0_0_0_70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-[600]">20%</h3>
              <p className="text-[#64748b] text-[14px] flex items-center">
                <i className="fas fa-arrow-up text-[#4f46e5] mr-[5px] text-[12px]"></i> 
                Onboarding Progress
              </p>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden hover:transform hover:-translate-y-[8px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:from-[rgba(79,70,229,0.1)] before:to-[rgba(79,70,229,0)] before:rounded-[0_0_0_70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-[600]">1/5</h3>
              <p className="text-[#64748b] text-[14px] flex items-center">
                <i className="fas fa-check-circle text-[#4f46e5] mr-[5px] text-[12px]"></i> 
                Steps Completed
              </p>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden hover:transform hover:-translate-y-[8px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:from-[rgba(79,70,229,0.1)] before:to-[rgba(79,70,229,0)] before:rounded-[0_0_0_70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-[600]">7 days</h3>
              <p className="text-[#64748b] text-[14px] flex items-center">
                <i className="fas fa-hourglass-half text-[#4f46e5] mr-[5px] text-[12px]"></i> 
                Until Deadline
              </p>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden hover:transform hover:-translate-y-[8px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:from-[rgba(79,70,229,0.1)] before:to-[rgba(79,70,229,0)] before:rounded-[0_0_0_70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-[600]">-</h3>
              <p className="text-[#64748b] text-[14px] flex items-center">
                <i className="fas fa-trophy text-[#4f46e5] mr-[5px] text-[12px]"></i> 
                Assessment Score
              </p>
            </div>
          </div>
        </div>
        
        <div className="action-cards-container bg-white rounded-[20px] p-[25px] mb-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:right-0 before:w-[200px] before:h-[200px] before:bg-radial-gradient before:from-[rgba(79,70,229,0.05)] before:to-[rgba(79,70,229,0)] before:rounded-0">
          <div className="action-cards-header flex justify-between items-center mb-[20px]">
            <h2 className="text-[20px] text-[#1e293b] flex items-center font-[600]">
              <div className="header-icon mr-[10px] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-[14px]">
                <i className="fas fa-tasks"></i>
              </div>
              Complete These Steps
            </h2>
            <div className="progress-indicator flex items-center bg-[rgba(226,232,240,0.5)] p-[8px_15px] rounded-[50px]">
              <div className="progress-bar w-[150px] h-[8px] bg-[rgba(148,163,184,0.2)] rounded-[4px] mr-[15px] overflow-hidden relative">
                <div className="progress-fill h-full w-[25%] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] rounded-[4px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[4px] after:opacity-20" style={{
                width: `${onboardingProgress}%`
              }}></div>
              </div>
              <div className="progress-text text-[14px] text-[#64748b] font-[500] flex items-center">
                <i className="fas fa-check-circle text-[#10B981] mr-[5px]"></i> {onboardingStatus === 'completed' ? '5' : onboardingStatus === 'incomplete' ? '2' : '1'} of 5 completed
              </div>
            </div>
          </div>
          
          <div className="action-cards grid grid-cols-5 gap-[25px] py-[20px] relative">
            <div className={`action-card bg-white rounded-[16px] p-[30px_25px] flex flex-col items-center text-center border ${onboardingStatus === 'completed' || onboardingStatus === 'ineligible' ? 'border-[#e2e8f0]' : 'border-[#f59e0b]'} shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all h-full hover:transform hover:-translate-y-[8px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]`}>
              <div className={`step-number absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full ${onboardingStatus === 'completed' ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_10px_rgba(16,185,129,0.3)]' : onboardingStatus === 'ineligible' ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] shadow-[0_4px_10px_rgba(239,68,68,0.3)]' : 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] shadow-[0_4px_10px_rgba(245,158,11,0.3)]'} text-white flex items-center justify-center font-[600] text-[16px] z-[3] border-[3px] border-white`}>
                1
              </div>
              <div className={`action-icon w-[80px] h-[80px] rounded-full ${onboardingStatus === 'completed' ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.2)]' : onboardingStatus === 'ineligible' ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] shadow-[0_8px_20px_rgba(239,68,68,0.2)]' : 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] shadow-[0_8px_20px_rgba(245,158,11,0.2)]'} text-white flex items-center justify-center text-[30px] relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]`}>
                <i className="fas fa-user-plus"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Initial Onboarding</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Complete your profile setup and account verification to get started with ApoLead.</p>
              <button className={`${getOnboardingButtonStyle()} ${onboardingCompleted ? 'cursor-default' : 'cursor-pointer'}`} onClick={openOnboardingModal} aria-disabled={onboardingCompleted}>
                {getOnboardingIcon()} {getOnboardingButtonText()}
              </button>
            </div>
            
            <div className={`action-card ${userProfile?.eligible_for_training !== true ? 'locked bg-[rgba(241,245,249,0.5)] border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50' : trainingStatus === 'failed' ? 'bg-white border border-[#ef4444]' : 'bg-white border border-[#10B981]'} rounded-[16px] p-[30px_25px] flex flex-col items-center text-center relative z-[2] h-full ${userProfile?.eligible_for_training === true ? 'hover:transform hover:-translate-y-[8px] hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)]' : ''}`}>
              <div className={`step-number locked absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full ${trainingStatus === 'completed' ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_10px_rgba(16,185,129,0.3)]' : trainingStatus === 'failed' ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] shadow-[0_4px_10px_rgba(239,68,68,0.3)]' : userProfile?.eligible_for_training === true ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-[#94A3B8] to-[#64748B]'} text-white flex items-center justify-center font-[600] text-[16px] ${userProfile?.eligible_for_training !== true ? 'shadow-none' : ''} z-[3] border-[3px] border-white`}>
                2
              </div>
              {userProfile?.eligible_for_training !== true && <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                  <Lock size={14} />
                </div>}
              <div className={`action-icon ${trainingStatus === 'completed' ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.2)]' : trainingStatus === 'failed' ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] shadow-[0_8px_20px_rgba(239,68,68,0.2)]' : userProfile?.eligible_for_training === true ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.2)]' : 'locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] shadow-none'} text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]`}>
                <i className="fas fa-book-reader"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Initial Training</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">
                {trainingStatus === 'failed' ? "You did not pass the training quiz. You cannot move forward in the application process." : "Complete the initial training module to unlock the next step. This will teach you the fundamentals."}
              </p>
              <button className={`card-button ${userProfile?.eligible_for_training === true ? getTrainingButtonStyle() : 'button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70'}`} onClick={userProfile?.eligible_for_training === true && trainingStatus !== 'failed' ? openTrainingModal : undefined} disabled={trainingStatus === 'failed'}>
                {userProfile?.eligible_for_training === true ? <>
                    {getTrainingIcon()} {getTrainingButtonText()}
                  </> : <><i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked</>}
              </button>
            </div>
            
            <div className={`action-card ${trainingStatus === 'completed' ? 'bg-white border border-[#10B981]' : 'locked bg-[rgba(241,245,249,0.5)] border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50'} rounded-[16px] p-[30px_25px] flex flex-col items-center text-center relative z-[2] h-full ${trainingStatus === 'completed' ? 'hover:transform hover:-translate-y-[8px] hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)]' : ''}`}>
              <div className={`step-number absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_10px_rgba(16,185,129,0.3)] text-white flex items-center justify-center font-[600] text-[16px] z-[3] border-[3px] border-white`}>
                3
              </div>
              {trainingStatus !== 'completed' && <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                  <Lock size={14} />
                </div>}
              <div className={`action-icon ${trainingStatus === 'completed' ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.2)]' : 'locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B]'} text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]`}>
                <i className="fas fa-user-friends"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Schedule Interview</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              {trainingStatus === 'completed' ? <button onClick={handleScheduleInterview} className="card-button button-completed p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]">
                  <CheckCircle className="mr-[8px] text-[16px]" /> Schedule Now
                </button> : <button className="card-button button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70">
                  <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
                </button>}
            </div>
            
            <div className={`action-card ${isProbationAgent ? 'bg-white border border-[#3b82f6]' : 'locked bg-[rgba(241,245,249,0.5)] border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50'} rounded-[16px] p-[30px_25px] flex flex-col items-center text-center relative z-[2] h-full ${isProbationAgent ? 'hover:transform hover:-translate-y-[8px] hover:shadow-[0_15px_30px_rgba(59,130,246,0.1)]' : ''}`}>
              <div className={`step-number absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full ${isProbationAgent ? 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] shadow-[0_4px_10px_rgba(59,130,246,0.3)]' : 'bg-gradient-to-r from-[#94A3B8] to-[#64748B]'} text-white flex items-center justify-center font-[600] text-[16px] shadow-none z-[3] border-[3px] border-white`}>
                4
              </div>
              {!isProbationAgent && <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                  <Lock size={14} />
                </div>}
              <div className={`action-icon ${additionalTrainingStatus === 'completed' ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.2)]' : additionalTrainingStatus === 'failed' ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] shadow-[0_8px_20px_rgba(239,68,68,0.2)]' : isProbationAgent ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] shadow-[0_8px_20px_rgba(59,130,246,0.2)]' : 'locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] shadow-none'} text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]`}>
                <GraduationCap size={30} />
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Additional Training</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Complete required additional training modules to advance in your role.</p>
              {isProbationAgent ? <button id="additional-training-btn" onClick={additionalTrainingStatus !== 'failed' ? openAdditionalTrainingModal : undefined} className={getAdditionalTrainingButtonStyle()} disabled={additionalTrainingStatus === 'failed'}>
                  {getAdditionalTrainingIcon()} {getAdditionalTrainingButtonText()}
                </button> : <button className="card-button button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70">
                  <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
                </button>}
            </div>
            
            <div className={`action-card ${hasPassedAdditionalTraining ? 'bg-white border border-[#10B981] hover:transform hover:-translate-y-[8px] hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)]' : 'locked bg-[rgba(241,245,249,0.5)] border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50'} rounded-[16px] p-[30px_25px] flex flex-col items-center text-center relative z-[2] h-full ${hasPassedAdditionalTraining ? 'hover:transform hover:-translate-y-[8px] hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)]' : ''}`}>
              <div className={`step-number locked absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full ${hasPassedAdditionalTraining ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-[#94A3B8] to-[#64748B]'} text-white flex items-center justify-center font-[600] text-[16px] shadow-none z-[3] border-[3px] border-white`}>
                5
              </div>
              {!hasPassedAdditionalTraining && <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                  <Lock size={14} />
                </div>}
              <div className={`action-icon ${hasPassedAdditionalTraining ? 'w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.2)]' : 'locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B]'} text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]`}>
                <i className="fas fa-rocket"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Kickoff & Setup</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              <button className={`card-button ${hasPassedAdditionalTraining ? 'p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]' : 'button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70'}`} onClick={hasPassedAdditionalTraining ? handleGetStarted : undefined} disabled={!hasPassedAdditionalTraining}>
                {hasPassedAdditionalTraining ? <><CheckCircle className="mr-[8px] text-[16px]" /> Get Started</> : <><i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {user && userProfile && (
        <OnboardingModal 
          isOpen={isModalOpen} 
          onClose={closeOnboardingModal} 
          user={user} 
          initialUserData={userProfile} 
        />
      )}

      <TrainingModal 
        isOpen={isTrainingModalOpen} 
        onClose={closeTrainingModal} 
        onComplete={(passed) => closeTrainingModal(passed)} 
      />
      
      {isProbationAgent && (
        <AdditionalTrainingModal 
          isOpen={isProbationTrainingOpen} 
          onClose={closeAdditionalTrainingModal} 
        />
      )}
      
      <PolicyAcknowledgmentDialog
        isOpen={showPolicyDialog}
        onClose={() => setShowPolicyDialog(false)}
        onAcknowledge={handlePolicyAcknowledge}
      />
      
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Your Interview</DialogTitle>
            <DialogDescription>
              Please select a date and time that works for you.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full h-[700px] border rounded-lg mt-4">
            <iframe src="https://calendly.com/apolead-support/apolead-agent-interview" width="100%" height="100%" frameBorder="0" title="Schedule Interview" className="rounded-lg"></iframe>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showBankingDialog} onOpenChange={setShowBankingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold bg-gradient-to-br from-[#4f46e5] to-[#00c2cb] text-transparent bg-clip-text">Complete Your Setup</DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              Before you can start working, you need to:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-amber-50 border-amber-200 transition-all hover:shadow-md">
              <CreditCard className="w-6 h-6 mt-0.5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900 text-lg">Add your banking information</h3>
                <p className="mt-2 text-amber-700 font-medium">
                  Please provide your banking details so we can process your payments.
                </p>
                <Button 
                  variant="secondary"
                  onClick={navigateToBilling}
                  className="mt-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white hover:shadow-lg transition-all border-0 font-medium px-6 py-2 text-[15px]"
                >
                  <CreditCard className="mr-2" /> Go to Banking Setup
                </Button>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-indigo-50 border-indigo-200 transition-all hover:shadow-md">
              <ExternalLink className="w-6 h-6 mt-0.5 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-indigo-900 text-lg">Join our Discord server</h3>
                <p className="mt-2 text-indigo-700 font-medium">
                  Connect with other agents, get updates, and access support resources.
                </p>
                <a 
                  href="https://discord.gg/zFB38k7rnJ" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center mt-4 bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white py-3 px-6 rounded-md text-[15px] font-medium shadow-md hover:shadow-lg transition-all w-full md:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M8.5 12a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"/><path d="M15.5 12a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"/><path d="M19.27 5.33 17.06 5c-.15.45-.48 1.09-.93 1.42A8.35 8.35 0 0 0 12 5a8.35 8.35 0 0 0-4.13 1.42c-.45-.33-.78-.97-.93-1.42L4.73 5.33A19.05 19.05 0 0 0 3 18.67l1.8.67c.48-.76 1.34-1.42 1.8-1.81a.5.5 0 0 1 .77.46 11.95 11.95 0 0 0 2.01 5.34c1.07-.47 2.37-1.2 3.17-1.95a.5.5 0 0 0 .09-.54c-.22-.47-.42-1.27-.55-2.17a.5.5 0 0 1 .46-.55c.4-.05.82-.05 1.23 0a.5.5 0 0 1 .46.55c-.13.9-.33 1.7-.55 2.17a.5.5 0 0 0 .09.54c.8.75 2.1 1.48 3.17 1.95a11.95 11.95 0 0 0 2.01-5.34.5.5 0 0 1 .77-.46c.46.39 1.32 1.05 1.8 1.81l1.8-.67A19.05 19.05 0 0 0 19.27 5.33Z"/></svg>
                  Join Discord Server
                </a>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowBankingDialog(false)} className="font-medium">
              I'll do this later
            </Button>
            <Button 
              onClick={navigateToBilling} 
              className="bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white border-0 font-medium transition-all hover:shadow-lg"
            >
              <CreditCard className="mr-2" /> Add Banking Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
