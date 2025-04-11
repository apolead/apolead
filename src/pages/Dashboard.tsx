
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

  const handlePolicyAcknowledge = async (name: string) => {
    try {
      await acknowledgePolicies(name);
      toast({
        title: "Policies Acknowledged",
        description: "Thank you for acknowledging our policies.",
        variant: "default"
      });
      setShowPolicyDialog(false);
      
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

  const handleGetStarted = () => {
    console.log("Dashboard: Opening policy acknowledgment dialog");
    if (userProfile?.telemarketing_policy_acknowledged && userProfile?.do_not_call_policy_acknowledged) {
      setShowBankingDialog(true);
    } else {
      setShowPolicyDialog(true);
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
        
        <div className="action-cards-container bg-white rounded-[20px] p-[25px] mb-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <h3 className="text-[20px] font-[600] text-[#1e293b] mb-[20px]">Complete Your Setup</h3>
          
          <div className="action-cards grid grid-cols-3 gap-[20px]">
            <div className="action-card p-[30px] border-[1px] border-[#e2e8f0] rounded-[16px] transition-all flex flex-col hover:transform hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
              <div className="card-header flex items-center justify-between mb-[25px]">
                <div className="card-icon w-[48px] h-[48px] rounded-[12px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] flex items-center justify-center text-[20px]">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="card-status text-[#64748b] bg-[#f1f5f9] text-[12px] p-[5px_10px] rounded-[20px]">Step 1</div>
              </div>
              
              <div className="card-content mb-auto">
                <h4 className="card-title text-[18px] font-[600] text-[#1e293b] mb-[15px]">Complete Onboarding</h4>
                <p className="card-description text-[14px] text-[#64748b] mb-[20px]">Fill in your personal information and complete eligibility questions.</p>
              </div>
              
              <button className={getOnboardingButtonStyle()} onClick={openOnboardingModal}>
                {getOnboardingIcon()}
                {getOnboardingButtonText()}
              </button>
            </div>
            
            <div className={`action-card p-[30px] border-[1px] border-[#e2e8f0] rounded-[16px] transition-all flex flex-col hover:transform hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] ${!onboardingCompleted ? 'opacity-70 pointer-events-none' : ''}`}>
              <div className="card-header flex items-center justify-between mb-[25px]">
                <div className="card-icon w-[48px] h-[48px] rounded-[12px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] flex items-center justify-center text-[20px]">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="card-status text-[#64748b] bg-[#f1f5f9] text-[12px] p-[5px_10px] rounded-[20px]">Step 2</div>
              </div>
              
              <div className="card-content mb-auto">
                <h4 className="card-title text-[18px] font-[600] text-[#1e293b] mb-[15px]">Complete Training</h4>
                <p className="card-description text-[14px] text-[#64748b] mb-[20px]">Watch the training video and pass the quiz to advance.</p>
              </div>
              
              <button className={getTrainingButtonStyle()} onClick={openTrainingModal}>
                {getTrainingIcon()}
                {getTrainingButtonText()}
              </button>
            </div>
            
            <div className={`action-card p-[30px] border-[1px] border-[#e2e8f0] rounded-[16px] transition-all flex flex-col hover:transform hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] ${trainingStatus !== 'completed' ? 'opacity-70 pointer-events-none' : ''}`}>
              <div className="card-header flex items-center justify-between mb-[25px]">
                <div className="card-icon w-[48px] h-[48px] rounded-[12px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] flex items-center justify-center text-[20px]">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="card-status text-[#64748b] bg-[#f1f5f9] text-[12px] p-[5px_10px] rounded-[20px]">Step 3</div>
              </div>
              
              <div className="card-content mb-auto">
                <h4 className="card-title text-[18px] font-[600] text-[#1e293b] mb-[15px]">Kick Off & Setup</h4>
                <p className="card-description text-[14px] text-[#64748b] mb-[20px]">Review policies, join Discord, and add your payment information.</p>
              </div>
              
              <button className="card-button p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(79,70,229,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(79,70,229,0.3)]" onClick={handleGetStarted}>
                Get Started
              </button>
            </div>
          </div>
        </div>

        {isProbationAgent && (
          <div className="additional-training-card bg-white rounded-[20px] p-[25px] mb-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <h3 className="text-[20px] font-[600] text-[#1e293b] mb-[20px]">Probation Training</h3>
            
            <div className="grid grid-cols-1 gap-[20px]">
              <div className="additional-training-content p-[30px] border-[1px] border-[#e2e8f0] rounded-[16px] transition-all flex flex-col hover:transform hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
                <div className="card-header flex items-center justify-between mb-[25px]">
                  <div className="card-icon w-[48px] h-[48px] rounded-[12px] bg-gradient-to-r from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] flex items-center justify-center text-[20px]">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="card-status text-[#64748b] bg-[#f1f5f9] text-[12px] p-[5px_10px] rounded-[20px]">Required</div>
                </div>
                
                <div className="card-content mb-auto">
                  <h4 className="card-title text-[18px] font-[600] text-[#1e293b] mb-[15px]">Additional Training Required</h4>
                  <p className="card-description text-[14px] text-[#64748b] mb-[20px]">
                    {hasPassedAdditionalTraining
                      ? "You've successfully completed the probation training and are now a qualified agent!"
                      : additionalTrainingStatus === 'failed'
                      ? "You didn't pass the additional training. Please wait for further instructions from your supervisor."
                      : "As a probation agent, you need to complete additional training to continue. This will help you understand advanced techniques and policies."}
                  </p>
                </div>
                
                <button className={getAdditionalTrainingButtonStyle()} onClick={openAdditionalTrainingModal}>
                  {getAdditionalTrainingIcon()}
                  {getAdditionalTrainingButtonText()}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <OnboardingModal isOpen={isModalOpen} onClose={closeOnboardingModal} />
      
      <TrainingModal isOpen={isTrainingModalOpen} onClose={closeTrainingModal} />
      
      <AdditionalTrainingModal isOpen={isProbationTrainingOpen} onClose={closeAdditionalTrainingModal} />
      
      <PolicyAcknowledgmentDialog 
        isOpen={showPolicyDialog} 
        onClose={() => setShowPolicyDialog(false)}
        onAcknowledge={handlePolicyAcknowledge}
      />
      
      <Dialog open={showBankingDialog} onOpenChange={open => {
        if (!open) setShowBankingDialog(false);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Setup Your Account</DialogTitle>
            <DialogDescription>
              Complete these steps to finish your setup and start earning.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Button className="flex items-center justify-start space-x-2 bg-indigo-600 hover:bg-indigo-700">
              <ExternalLink size={16} />
              <span>Join Discord Server</span>
            </Button>
            
            <Button className="flex items-center justify-start space-x-2" onClick={navigateToBilling}>
              <CreditCard size={16} />
              <span>Add Banking Information</span>
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBankingDialog(false)}>
              I'll do this later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
