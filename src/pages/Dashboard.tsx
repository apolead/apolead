
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import { 
  GraduationCap, 
  Calendar, 
  Star, 
  ClipboardList,
  ChevronUp,
  CheckCircle,
  UserPlus,
  BookOpen,
  Users,
  School,
  Rocket,
  Lock,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
      <DashboardSidebar activeItem="dashboard" />
      
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <div className="welcome text-2xl font-bold text-gray-800">
            Thanks for signing up, <span className="text-indigo-600 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-indigo-600 after:to-[#00c2cb] after:rounded-[2px]">{userProfile?.first_name || user?.email?.split('@')[0] || 'User'}</span>!
          </div>
          
          <div className="user-info flex items-center">
            <div className="action-buttons hidden md:flex gap-4 mr-5">
              <button className="action-button w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:transform hover:-translate-y-1 hover:shadow-md">
                <ClipboardList size={18} />
              </button>
              <button className="action-button notification w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:transform hover:-translate-y-1 hover:shadow-md relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                <Calendar size={18} />
              </button>
            </div>
            
            <div className="user-profile flex items-center bg-white rounded-full p-1 pl-1 pr-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:transform hover:-translate-y-1">
              <div className="user-avatar w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center font-semibold text-sm mr-2">
                {userProfile?.first_name ? userProfile.first_name[0] : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <span className="user-name font-medium text-gray-800 hidden md:block">{userProfile?.first_name || user?.email?.split('@')[0] || 'User'}</span>
            </div>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="page-title flex items-center mb-8">
          <div className="rounded-lg bg-blue-500 text-white w-10 h-10 flex items-center justify-center mr-3">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Onboarding Process</h2>
            <div className="text-gray-500 text-sm">Complete all steps to start earning</div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-none shadow-md overflow-hidden">
            <CardContent className="p-5 flex items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mr-4">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="text-2xl font-semibold">20%</div>
                <div className="text-gray-500 text-sm flex items-center">
                  <ChevronUp className="h-4 w-4 mr-1 text-blue-500" />
                  Onboarding Progress
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md overflow-hidden">
            <CardContent className="p-5 flex items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mr-4">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-2xl font-semibold">1/5</div>
                <div className="text-gray-500 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1 text-blue-500" />
                  Steps Completed
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md overflow-hidden">
            <CardContent className="p-5 flex items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mr-4">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-2xl font-semibold">7 days</div>
                <div className="text-gray-500 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                  Until Deadline
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md overflow-hidden">
            <CardContent className="p-5 flex items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mr-4">
                <Star size={24} />
              </div>
              <div>
                <div className="text-2xl font-semibold">-</div>
                <div className="text-gray-500 text-sm flex items-center">
                  <Star className="h-4 w-4 mr-1 text-blue-500" />
                  Assessment Score
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Cards Container */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center mr-2">
                <ClipboardList size={16} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Complete These Steps</h2>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <div className="w-36 h-2 bg-gray-200 rounded-full mr-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" 
                  style={{ width: `${onboardingProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                1 of 5 completed
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Step 1: Initial Onboarding */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-md z-10">
                1
              </div>
              
              <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-4">
                <UserPlus size={24} />
              </div>
              
              <h3 className="text-base font-semibold text-gray-800 mb-2">Initial Onboarding</h3>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Complete your profile setup and account verification to get started with ApoLead.</p>
              
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
                onClick={openOnboardingModal}
              >
                <Check size={16} className="mr-2" />
                Completed
              </Button>
            </div>
            
            {/* Step 2: Initial Training - Locked/Greyed out */}
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                2
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              
              <h3 className="text-base font-semibold text-gray-800 mb-2">Initial Training</h3>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed flex items-center justify-center">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </div>
            
            {/* Step 3: Interview */}
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                3
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              
              <h3 className="text-base font-semibold text-gray-800 mb-2">Schedule Interview</h3>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed flex items-center justify-center">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </div>
            
            {/* Step 4: Additional Training */}
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                4
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <School size={24} />
              </div>
              
              <h3 className="text-base font-semibold text-gray-800 mb-2">Additional Training</h3>
              <p className="text-gray-500 text-sm mb-4 flex-grow">After your interview, complete additional training modules to refine your skills.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed flex items-center justify-center">
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </div>
            
            {/* Step 5: Kickoff and Setup */}
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-2 border-white shadow-sm z-10">
                5
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm z-20">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <Rocket size={24} />
              </div>
              
              <h3 className="text-base font-semibold text-gray-800 mb-2">Kickoff & Setup</h3>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              
              <Button disabled className="w-full bg-gray-400 cursor-not-allowed flex items-center justify-center">
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
