
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import { 
  CheckCircle,
  ChevronDown,
  Lock,
  Search,
  Settings,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(20); // Default to 20% (signup completed)
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    
    // Check if onboarding is completed
    if (userProfile) {
      // If user has filled out personal details, set onboarding as completed
      if (userProfile.first_name && userProfile.last_name && userProfile.birth_day && 
          userProfile.gov_id_number && userProfile.gov_id_image) {
        setOnboardingCompleted(true);
        setOnboardingProgress(100);
      }
    }
  }, [user, loading, userProfile, navigate]);
  
  const openOnboardingModal = () => {
    setIsModalOpen(true);
  };
  
  const closeOnboardingModal = () => {
    setIsModalOpen(false);
    
    // Refresh user profile to check if onboarding was completed
    if (user) {
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            if (data.first_name && data.last_name && data.birth_day && 
                data.gov_id_number && data.gov_id_image) {
              setOnboardingCompleted(true);
              setOnboardingProgress(100);
              toast({
                title: "Onboarding completed",
                description: "You can now proceed to the training."
              });
            }
          }
        });
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeItem="dashboard" />
      
      <div className="flex-1 p-[20px_30px]">
        {/* Header */}
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
        
        {/* Page Title */}
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
        
        {/* Stats Section */}
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
        
        {/* Action Cards Container */}
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
                <div className="progress-fill h-full w-[25%] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] rounded-[4px] relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-[8px] after:h-full after:bg-white after:opacity-30 after:animate-pulse"></div>
              </div>
              <div className="progress-text text-[14px] text-[#64748b] font-[500] flex items-center">
                <i className="fas fa-check-circle text-[#10B981] mr-[5px]"></i> 1 of 5 completed
              </div>
            </div>
          </div>
          
          {/* Action Cards */}
          <div className="action-cards grid grid-cols-5 gap-[25px] py-[20px] relative">
            {/* Step 1: Initial Onboarding */}
            <div className="action-card bg-white rounded-[16px] p-[30px_25px] flex flex-col items-center text-center border border-[#e2e8f0] shadow-[0_4px_15px_rgba(0,0,0,0.05)] relative z-[2] transition-all h-full hover:transform hover:-translate-y-[8px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
              <div className="step-number completed absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white flex items-center justify-center font-[600] text-[16px] shadow-[0_4px_10px_rgba(16,185,129,0.3)] z-[3] border-[3px] border-white">
                1
              </div>
              <div className="action-icon completed w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white flex items-center justify-center text-[30px] shadow-[0_8px_20px_rgba(16,185,129,0.2)] relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Initial Onboarding</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Complete your profile setup and account verification to get started with ApoLead.</p>
              <button 
                className="card-button button-completed p-[12px_24px] rounded-[12px] bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 cursor-pointer font-[500] transition-all w-full flex items-center justify-center text-[14px] shadow-[0_4px_10px_rgba(16,185,129,0.2)] hover:transform hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(16,185,129,0.3)]"
                onClick={openOnboardingModal}
              >
                <i className="fas fa-check-circle mr-[8px] text-[16px]"></i> Completed
              </button>
            </div>
            
            {/* Step 2: Initial Training - Locked/Greyed out */}
            <div className="action-card locked bg-[rgba(241,245,249,0.5)] rounded-[16px] p-[30px_25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50 relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-[600] text-[16px] shadow-none z-[3] border-[3px] border-white">
                2
              </div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <Lock size={14} />
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]">
                <i className="fas fa-book-reader"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Initial Training</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
              <button className="card-button button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
            
            {/* Step 3: Interview - Locked */}
            <div className="action-card locked bg-[rgba(241,245,249,0.5)] rounded-[16px] p-[30px_25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50 relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-[600] text-[16px] shadow-none z-[3] border-[3px] border-white">
                3
              </div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <Lock size={14} />
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]">
                <i className="fas fa-user-friends"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Schedule Interview</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              <button className="card-button button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
            
            {/* Step 4: Additional Training - Locked */}
            <div className="action-card locked bg-[rgba(241,245,249,0.5)] rounded-[16px] p-[30px_25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50 relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-[600] text-[16px] shadow-none z-[3] border-[3px] border-white">
                4
              </div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <Lock size={14} />
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Additional Training</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">After your interview, complete additional training modules to refine your skills.</p>
              <button className="card-button button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
            
            {/* Step 5: Kickoff & Setup */}
            <div className="action-card locked bg-[rgba(241,245,249,0.5)] rounded-[16px] p-[30px_25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] shadow-none filter grayscale opacity-50 relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-1/2 transform -translate-x-1/2 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-[600] text-[16px] shadow-none z-[3] border-[3px] border-white">
                5
              </div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <Lock size={14} />
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center text-[30px] shadow-none relative overflow-hidden mb-[15px] before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient before:from-[rgba(255,255,255,0.3)] before:to-[rgba(255,255,255,0)]">
                <i className="fas fa-rocket"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-[600]">Kickoff & Setup</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              <button className="card-button button-locked p-[12px_24px] rounded-[12px] bg-[#94A3B8] text-white border-0 cursor-not-allowed font-[500] transition-all w-full flex items-center justify-center text-[14px] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={isModalOpen} 
        onClose={closeOnboardingModal} 
        user={user}
        initialUserData={userProfile}
      />
    </div>
  );
};

export default Dashboard;
