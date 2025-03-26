
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import SupportFAQ from '@/components/SupportFAQ';
import { 
  Play, 
  PieChart, 
  Wrench, // Replacing Tool with Wrench since Tool isn't available
  CreditCard, 
  BarChart2, 
  Trophy, 
  FileText, 
  Settings, 
  LogOut, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  ClipboardList, 
  GraduationCap, 
  CheckSquare, 
  Calendar, 
  Star, 
  BookOpen, 
  Users, 
  PenTool, 
  Rocket, 
  X,
  HelpCircle // Adding HelpCircle to replace Help
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [onboardingProgress, setOnboardingProgress] = useState<any>({
    welcome_completed: false,
    training_completed: false,
    interview_scheduled: false,
    final_quiz_passed: false,
    quiz_score: null
  });
  const [moduleProgress, setModuleProgress] = useState(0);
  
  // Fetch user and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        setUser(user);
        
        // Fetch user profile - Fix the table name from "profiles" to "user_profiles"
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }
        
        setUserProfile(profile);
        
        // Fetch onboarding progress
        const { data: onboarding, error: onboardingError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (onboardingError) {
          if (onboardingError.code === 'PGRST116') {
            // Record doesn't exist, create it
            const { data: newOnboarding, error: createError } = await supabase
              .from('user_onboarding')
              .insert([
                { 
                  user_id: user.id,
                  welcome_completed: false,
                  training_completed: false,
                  interview_scheduled: false,
                  final_quiz_passed: false,
                  quiz_score: 0
                }
              ])
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating onboarding record:', createError);
              return;
            }
            
            setOnboardingProgress(newOnboarding);
          } else {
            console.error('Error fetching onboarding progress:', onboardingError);
          }
        } else {
          setOnboardingProgress(onboarding);
        }
        
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const handleTrainingModuleProgress = () => {
    if (moduleProgress < 100) {
      const timer = setInterval(() => {
        setModuleProgress(prev => {
          if (prev < 100) {
            return prev + 1;
          } else {
            clearInterval(timer);
            return 100;
          }
        });
      }, 30);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate onboarding completion percentage
  const calculateCompletionPercentage = () => {
    if (!onboardingProgress) return 0;
    
    const steps = [
      onboardingProgress.welcome_completed,
      onboardingProgress.training_completed,
      onboardingProgress.interview_scheduled,
      onboardingProgress.final_quiz_passed
    ];
    
    const completedSteps = steps.filter(step => step === true).length;
    return (completedSteps / steps.length) * 100;
  };
  
  const completionPercentage = calculateCompletionPercentage();
  
  const getUserInitials = () => {
    if (!userProfile) return '';
    
    const firstInitial = userProfile.first_name ? userProfile.first_name.charAt(0) : '';
    const lastInitial = userProfile.last_name ? userProfile.last_name.charAt(0) : '';
    
    return `${firstInitial}${lastInitial}`;
  };
  
  const getFullName = () => {
    if (!userProfile) return '';
    return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`;
  };
  
  const menuItems = [
    { 
      name: 'Getting Started', 
      icon: <Play className="mr-3 h-5 w-5" />, 
      active: true, 
      locked: false 
    },
    { 
      name: 'Dashboard', 
      icon: <PieChart className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: true 
    },
    { 
      name: 'Tool Page', 
      icon: <Wrench className="mr-3 h-5 w-5" />, // Changed from Tool to Wrench
      active: false, 
      locked: true 
    },
    { 
      name: 'Payment History', 
      icon: <CreditCard className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: true 
    },
    { 
      name: 'Performance', 
      icon: <BarChart2 className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: true 
    },
    { 
      name: 'Ranking', 
      icon: <Trophy className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: true 
    },
    { 
      name: 'Billing Information', 
      icon: <FileText className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: true 
    }
  ];
  
  const bottomMenuItems = [
    { 
      name: 'Settings', 
      icon: <Settings className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: true 
    },
    { 
      name: 'Log Out', 
      icon: <LogOut className="mr-3 h-5 w-5" />, 
      active: false, 
      locked: false 
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-md transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h1 className={`text-xl font-bold ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <span className="text-[#00c2cb]">Apo</span>
            <span className="text-indigo-600">Lead</span>
          </h1>
          <button
            onClick={toggleSidebar}
            className={`h-6 w-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all ${
              sidebarCollapsed ? 'ml-auto mr-auto' : ''
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Navigation */}
        <div className="py-4 flex flex-col h-[calc(100%-64px)] justify-between">
          <div>
            {menuItems.map((item, index) => (
              <TooltipProvider key={index} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-full flex items-center px-4 py-3 ${
                        item.active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                      disabled={item.locked}
                    >
                      {item.icon}
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                      {!sidebarCollapsed && item.locked && (
                        <Lock className="ml-auto h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.name} {item.locked ? '(Locked)' : ''}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div>
            <div className="border-t border-gray-100 my-2"></div>
            {bottomMenuItems.map((item, index) => (
              <TooltipProvider key={index} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-full flex items-center px-4 py-3 ${
                        item.active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                      disabled={item.locked}
                      onClick={item.name === 'Log Out' ? handleSignOut : undefined}
                    >
                      {item.icon}
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                      {!sidebarCollapsed && item.locked && (
                        <Lock className="ml-auto h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.name} {item.locked ? '(Locked)' : ''}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
            
            {!sidebarCollapsed && (
              <div className="px-4 py-3 text-xs text-gray-500 mt-4">
                <SupportFAQ />
              </div>
            )}
            {sidebarCollapsed && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-full flex items-center justify-center px-4 py-3 text-gray-500 hover:text-indigo-600">
                      <HelpCircle className="h-5 w-5" /> {/* Changed from Help to HelpCircle */}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Support Center</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div className="text-gray-700">
            Thanks for signing up, <span className="font-semibold">{userProfile?.first_name || 'User'}</span>!
          </div>
          
          <div className="flex items-center">
            <div className="flex mr-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Search className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-sm">
                {getUserInitials()}
              </div>
              <div className="ml-2 mr-1">
                <div className="text-sm font-medium">{getFullName()}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Onboarding Process</h1>
            </div>
            <p className="text-gray-600 mt-1 ml-13">Complete all steps to start earning</p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Onboarding Progress</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{Math.floor(completionPercentage)}%</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <CheckSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Steps Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {onboardingProgress ? [
                      onboardingProgress.welcome_completed,
                      onboardingProgress.training_completed,
                      onboardingProgress.interview_scheduled, 
                      onboardingProgress.final_quiz_passed
                    ].filter(Boolean).length : 0}/4
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Until Deadline</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">7 days</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <Star className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Assessment Score</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {onboardingProgress?.quiz_score ? `${onboardingProgress.quiz_score}%` : '-'}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Onboarding Steps */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Complete These Steps</h2>
              </div>
              
              <div className="flex items-center">
                <div className="w-48 h-2 rounded-full bg-gray-200 mr-3">
                  <div 
                    className="h-full rounded-full bg-indigo-600" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {onboardingProgress ? [
                    onboardingProgress.welcome_completed,
                    onboardingProgress.training_completed,
                    onboardingProgress.interview_scheduled, 
                    onboardingProgress.final_quiz_passed
                  ].filter(Boolean).length : 0} of 4 completed
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1: Initial Training */}
              <div className={`rounded-lg border ${onboardingProgress?.training_completed ? 'border-green-200 bg-green-50' : 'border-indigo-200 bg-white'} p-5 relative`}>
                <div className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  onboardingProgress?.training_completed ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  1
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Initial Training</h3>
                <p className="text-gray-600 text-sm mb-4">Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    onboardingProgress?.training_completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  onClick={() => setShowTrainingModal(true)}
                >
                  {onboardingProgress?.training_completed ? 'Completed' : 'Start'}
                </button>
              </div>
              
              {/* Step 2: Interview */}
              <div className={`rounded-lg border ${
                onboardingProgress?.interview_scheduled 
                  ? 'border-green-200 bg-green-50' 
                  : !onboardingProgress?.training_completed 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-indigo-200 bg-white'
              } p-5 relative`}>
                <div className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  onboardingProgress?.interview_scheduled 
                    ? 'bg-green-500 text-white' 
                    : !onboardingProgress?.training_completed 
                      ? 'bg-gray-300 text-white' 
                      : 'bg-indigo-100 text-indigo-600'
                }`}>
                  2
                </div>
                {!onboardingProgress?.training_completed && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Lock className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Schedule Interview</h3>
                <p className="text-gray-600 text-sm mb-4">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    onboardingProgress?.interview_scheduled 
                      ? 'bg-green-500 text-white' 
                      : onboardingProgress?.training_completed 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-300 text-white'
                  }`}
                  disabled={!onboardingProgress?.training_completed}
                >
                  {onboardingProgress?.interview_scheduled ? 'Completed' : 'Schedule'}
                </button>
              </div>
              
              {/* Step 3: Additional Training */}
              <div className={`rounded-lg border ${
                onboardingProgress?.final_quiz_passed 
                  ? 'border-green-200 bg-green-50' 
                  : !onboardingProgress?.interview_scheduled 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-indigo-200 bg-white'
              } p-5 relative`}>
                <div className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  onboardingProgress?.final_quiz_passed 
                    ? 'bg-green-500 text-white' 
                    : !onboardingProgress?.interview_scheduled 
                      ? 'bg-gray-300 text-white' 
                      : 'bg-indigo-100 text-indigo-600'
                }`}>
                  3
                </div>
                {!onboardingProgress?.interview_scheduled && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Lock className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <PenTool className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Additional Training</h3>
                <p className="text-gray-600 text-sm mb-4">After your interview, complete additional training modules to refine your skills.</p>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    onboardingProgress?.final_quiz_passed 
                      ? 'bg-green-500 text-white' 
                      : onboardingProgress?.interview_scheduled 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-300 text-white'
                  }`}
                  disabled={!onboardingProgress?.interview_scheduled}
                >
                  {onboardingProgress?.final_quiz_passed ? 'Completed' : 'Start'}
                </button>
              </div>
              
              {/* Step 4: Kickoff & Setup */}
              <div className={`rounded-lg border ${
                !onboardingProgress?.final_quiz_passed 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-indigo-200 bg-white'
              } p-5 relative`}>
                <div className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  !onboardingProgress?.final_quiz_passed 
                    ? 'bg-gray-300 text-white' 
                    : 'bg-indigo-100 text-indigo-600'
                }`}>
                  4
                </div>
                {!onboardingProgress?.final_quiz_passed && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Lock className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Kickoff & Setup</h3>
                <p className="text-gray-600 text-sm mb-4">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    onboardingProgress?.final_quiz_passed 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-300 text-white'
                  }`}
                  disabled={!onboardingProgress?.final_quiz_passed}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Training Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" /> Initial Training
              </h2>
              <button onClick={() => setShowTrainingModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to ApoLead Training!</h3>
                <p className="text-gray-600">
                  This training module will teach you the fundamentals needed to get started. 
                  It should take approximately 45-60 minutes to complete.
                </p>
                <p className="text-gray-600 mt-2">
                  Once completed, you'll be able to proceed to the next steps in your onboarding journey.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <Play className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">Introduction to ApoLead</h4>
                      <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${moduleProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {moduleProgress}% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <Lock className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">Core Principles</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        Locked
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <Lock className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">Best Practices</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        Locked
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
                  onClick={handleTrainingModuleProgress}
                >
                  {moduleProgress === 0 ? 'Begin Training' : 
                   moduleProgress < 100 ? 'Continue Training' : 'Continue to Next Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
