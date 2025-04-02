
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import { 
  ChevronDown, 
  Check, 
  Search, 
  Bell, 
  Settings, 
  User, 
  Clipboard, 
  GraduationCap, 
  Calendar, 
  Star, 
  Award,
  ChevronUp,
  Lock,
  UserPlus,
  BookOpen,
  Users,
  School,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex w-full min-h-screen bg-gray-50">
      <DashboardSidebar />
      
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <div className="welcome text-2xl font-bold text-gray-800">
            Thanks for signing up, <span className="text-indigo-600 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-indigo-600 after:to-[#00c2cb] after:rounded-[2px]">{userProfile?.first_name || user?.email?.split('@')[0] || 'User'}</span>!
          </div>
          
          <div className="user-info flex items-center">
            <div className="action-buttons flex gap-4 mr-5">
              <button className="action-button w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:transform hover:-translate-y-1 hover:shadow-md">
                <Search size={18} />
              </button>
              <button className="action-button notification w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:transform hover:-translate-y-1 hover:shadow-md relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="action-button w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:transform hover:-translate-y-1 hover:shadow-md">
                <Settings size={18} />
              </button>
            </div>
            
            <div className="user-profile flex items-center bg-white rounded-full p-1 pl-1 pr-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:transform hover:-translate-y-1">
              <div className="user-avatar w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center font-semibold text-sm mr-2">
                {userProfile?.first_name ? userProfile.first_name[0] : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <span className="user-name font-medium text-gray-800">{userProfile?.first_name || user?.email?.split('@')[0] || 'User'}</span>
              <ChevronDown size={16} className="dropdown-icon ml-1 text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="page-title flex items-center mb-6">
          <div className="page-title-icon w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center mr-3">
            <Clipboard size={16} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Onboarding Process</h2>
          <div className="page-subtitle ml-4 pl-4 border-l-2 border-gray-200 text-gray-500 text-sm">Complete all steps to start earning</div>
        </div>
        
        {/* Stats Section */}
        <div className="stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm flex items-center relative overflow-hidden hover:transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-md">
            <div className="stat-icon w-14 h-14 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-5 relative after:content-[''] after:absolute after:w-full after:h-full after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20 after:rounded-lg">
              <GraduationCap size={24} />
            </div>
            <div className="stat-info">
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">{onboardingProgress}%</h3>
              <p className="text-gray-500 text-sm flex items-center">
                <ChevronUp className="h-3 w-3 mr-1 text-indigo-600" />
                Onboarding Progress
              </p>
            </div>
          </div>
          
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm flex items-center relative overflow-hidden hover:transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-md">
            <div className="stat-icon w-14 h-14 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-5 relative after:content-[''] after:absolute after:w-full after:h-full after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20 after:rounded-lg">
              <Check size={24} />
            </div>
            <div className="stat-info">
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">{onboardingCompleted ? '1/5' : '0/5'}</h3>
              <p className="text-gray-500 text-sm flex items-center">
                <Check className="h-3 w-3 mr-1 text-indigo-600" />
                Steps Completed
              </p>
            </div>
          </div>
          
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm flex items-center relative overflow-hidden hover:transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-md">
            <div className="stat-icon w-14 h-14 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-5 relative after:content-[''] after:absolute after:w-full after:h-full after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20 after:rounded-lg">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">7 days</h3>
              <p className="text-gray-500 text-sm flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-indigo-600" />
                Until Deadline
              </p>
            </div>
          </div>
          
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm flex items-center relative overflow-hidden hover:transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-md">
            <div className="stat-icon w-14 h-14 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-5 relative after:content-[''] after:absolute after:w-full after:h-full after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20 after:rounded-lg">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">-</h3>
              <p className="text-gray-500 text-sm flex items-center">
                <Star className="h-3 w-3 mr-1 text-indigo-600" />
                Assessment Score
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Cards */}
        <div className="action-cards-container bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="action-cards-header flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="header-icon w-7 h-7 rounded-lg bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center mr-2">
                <Check size={14} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Complete These Steps</h2>
            </div>
            
            <div className="progress-indicator flex items-center bg-gray-100 rounded-full px-4 py-2">
              <div className="progress-bar w-36 h-2 bg-gray-200 rounded-full mr-3 overflow-hidden">
                <div 
                  className="progress-fill h-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] rounded-full" 
                  style={{ width: `${onboardingProgress/5}%` }}
                ></div>
              </div>
              <div className="progress-text text-sm text-gray-600 flex items-center">
                <Check className="h-3 w-3 mr-1 text-green-500" />
                {onboardingCompleted ? '1' : '0'} of 5 completed
              </div>
            </div>
          </div>
          
          <div className="action-cards grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Step 1: Initial Onboarding */}
            <div className="action-card relative bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm transition-all hover:transform hover:-translate-y-2 hover:shadow-md">
              <div className={`step-number absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full ${onboardingCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-indigo-600 to-[#00c2cb]'} text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-md z-10`}>
                1
              </div>
              
              <div className={`action-icon w-20 h-20 rounded-full ${onboardingCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-indigo-600 to-[#00c2cb]'} text-white flex items-center justify-center text-3xl mb-5 shadow-lg relative overflow-hidden`}>
                <UserPlus size={30} />
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-30 blur-lg"></div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Initial Onboarding</h3>
              <p className="text-gray-500 text-sm mb-5 flex-grow">Complete your profile setup and account verification to get started with ApoLead.</p>
              
              <Button 
                className={`w-full ${onboardingCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                onClick={openOnboardingModal}
              >
                {onboardingCompleted ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Completed
                  </>
                ) : 'Complete Profile'}
              </Button>
            </div>
            
            {/* Step 2: Initial Training - Locked/Greyed out */}
            <div className="action-card locked relative bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
              <div className="step-number locked absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                2
              </div>
              
              <div className="lock-icon absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="action-icon locked w-20 h-20 rounded-full bg-gray-400 text-white flex items-center justify-center text-3xl mb-5 shadow-sm relative overflow-hidden">
                <BookOpen size={30} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Initial Training</h3>
              <p className="text-gray-500 text-sm mb-5 flex-grow">Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </div>
            
            {/* Steps 3-5: Also locked */}
            {/* Step 3: Interview */}
            <div className="action-card locked relative bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
              <div className="step-number locked absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                3
              </div>
              
              <div className="lock-icon absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="action-icon locked w-20 h-20 rounded-full bg-gray-400 text-white flex items-center justify-center text-3xl mb-5 shadow-sm">
                <Users size={30} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Schedule Interview</h3>
              <p className="text-gray-500 text-sm mb-5 flex-grow">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </div>
            
            {/* Step 4: Additional Training */}
            <div className="action-card locked relative bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
              <div className="step-number locked absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                4
              </div>
              
              <div className="lock-icon absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="action-icon locked w-20 h-20 rounded-full bg-gray-400 text-white flex items-center justify-center text-3xl mb-5 shadow-sm">
                <School size={30} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Training</h3>
              <p className="text-gray-500 text-sm mb-5 flex-grow">After your interview, complete additional training modules to refine your skills.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </div>
            
            {/* Step 5: Kickoff and Setup */}
            <div className="action-card locked relative bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
              <div className="step-number locked absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                5
              </div>
              
              <div className="lock-icon absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="action-icon locked w-20 h-20 rounded-full bg-gray-400 text-white flex items-center justify-center text-3xl mb-5 shadow-sm">
                <Rocket size={30} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Kickoff & Setup</h3>
              <p className="text-gray-500 text-sm mb-5 flex-grow">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
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
