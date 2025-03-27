
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronsLeft,
  ChevronsRight,
  GraduationCap, 
  CheckCircle, 
  ClipboardList, 
  Star, 
  BookOpen, 
  UserCheck, 
  School, 
  Rocket,
  Lock,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [moduleProgress, setModuleProgress] = useState(0);
  
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      }
    };
    
    getUserProfile();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const startTraining = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const simulateProgress = () => {
    if (moduleProgress === 0) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setModuleProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 30);
    }
  };
  
  // Generate user initials
  const getUserInitials = () => {
    if (!userProfile?.first_name && !userProfile?.last_name) return "U";
    
    const firstInitial = userProfile?.first_name?.charAt(0) || "";
    const lastInitial = userProfile?.last_name?.charAt(0) || "";
    
    return `${firstInitial}${lastInitial}`;
  };
  
  const getFirstName = () => {
    return userProfile?.first_name || "Agent";
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[240px]'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col relative z-10`}>
        <div className="px-6 py-5 border-b border-gray-200 mb-6 flex justify-between items-center">
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-bold">
              <span className="text-[#00c2cb]">Apo</span>
              <span className="text-indigo-600">Lead</span>
            </h1>
          )}
          <button 
            onClick={toggleSidebar}
            className={`${sidebarCollapsed ? 'absolute -right-3 top-5 bg-white shadow-sm rounded-full w-6 h-6' : ''} text-gray-500 hover:text-indigo-600 flex items-center justify-center transition-all z-20`}
          >
            {sidebarCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          </button>
        </div>
        
        <div className="flex flex-col flex-grow px-3">
          <a href="#" className="flex items-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-3 rounded-md mb-1 transition-colors font-medium">
            <BookOpen className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} size={18} />
            {!sidebarCollapsed && <span>Getting Started</span>}
          </a>
          
          <div className="relative flex items-center text-gray-400 px-3 py-3 rounded-md mb-1 cursor-not-allowed">
            <Bell className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
            <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" size={16} />
          </div>
          
          <div className="relative flex items-center text-gray-400 px-3 py-3 rounded-md mb-1 cursor-not-allowed">
            <Settings className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} size={18} />
            {!sidebarCollapsed && <span>Tool Page</span>}
            <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" size={16} />
          </div>
          
          <div className="relative flex items-center text-gray-400 px-3 py-3 rounded-md mb-1 cursor-not-allowed">
            <Calendar className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} size={18} />
            {!sidebarCollapsed && <span>Payment History</span>}
            <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" size={16} />
          </div>
          
          <div className="h-px bg-gray-200 my-3 mx-2"></div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-3 rounded-md transition-colors font-medium"
          >
            <LogOut className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} size={18} />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
        
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
            Need help? <a href="#" className="text-indigo-600">Support Center</a>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">
            Thanks for signing up, <span className="text-indigo-600 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-indigo-600 after:to-[#00c2cb] after:rounded-md">{getFirstName()}</span>!
          </h2>
          
          <div className="flex items-center">
            <div className="flex gap-3 mr-4">
              <button className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all">
                <Search size={18} />
              </button>
              <button className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
              </button>
              <button className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all">
                <Settings size={18} />
              </button>
            </div>
            
            <div className="flex items-center p-2 pr-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center font-medium text-sm mr-2">
                {getUserInitials()}
              </div>
              <span className="font-medium text-gray-800">{userProfile?.first_name} {userProfile?.last_name}</span>
              <ChevronDown size={16} className="ml-2 text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white mr-3">
            <ClipboardList size={16} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Onboarding Process</h3>
          <div className="ml-4 pl-4 border-l-2 border-gray-200 text-gray-500 text-sm">Complete all steps to start earning</div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <Card className="p-5 flex items-center hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20">
              <GraduationCap size={24} className="z-10" />
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-gray-800">25%</h4>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <span className="text-indigo-600 mr-1">↑</span> Onboarding Progress
              </p>
            </div>
          </Card>
          
          <Card className="p-5 flex items-center hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20">
              <CheckCircle size={24} className="z-10" />
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-gray-800">1/4</h4>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <span className="text-indigo-600 mr-1">✓</span> Steps Completed
              </p>
            </div>
          </Card>
          
          <Card className="p-5 flex items-center hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20">
              <Calendar size={24} className="z-10" />
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-gray-800">7 days</h4>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <span className="text-indigo-600 mr-1">⏳</span> Until Deadline
              </p>
            </div>
          </Card>
          
          <Card className="p-5 flex items-center hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-indigo-600 after:to-[#00c2cb] after:opacity-20">
              <Star size={24} className="z-10" />
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-gray-800">-</h4>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <span className="text-indigo-600 mr-1">🏆</span> Assessment Score
              </p>
            </div>
          </Card>
        </div>
        
        {/* Action Cards */}
        <Card className="p-6 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white mr-2">
                <CheckCircle size={14} />
              </div>
              <h3 className="text-lg font-semibold">Complete These Steps</h3>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <div className="w-36 h-2 bg-gray-200 rounded-full mr-3 overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-indigo-600 to-[#00c2cb] rounded-full relative after:absolute after:right-0 after:top-0 after:h-full after:w-2 after:bg-white after:opacity-30 after:animate-pulse"></div>
              </div>
              <span className="text-sm text-gray-600 flex items-center">
                <CheckCircle size={14} className="text-green-500 mr-1" /> 1 of 4 completed
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 - Completed */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center relative hover:-translate-y-2 transition-all hover:shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center font-semibold text-sm border-3 border-white shadow-sm">
                1
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center mb-4 shadow-md relative overflow-hidden">
                <BookOpen size={28} />
                <div className="absolute inset-0 bg-white opacity-20 radial-gradient"></div>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2">Initial Training</h4>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
              
              <button 
                className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium flex items-center justify-center text-sm hover:-translate-y-1 hover:shadow-md transition-all"
                onClick={startTraining}
              >
                <BookOpen size={16} className="mr-2" /> Start
              </button>
            </div>
            
            {/* Step 2 - Locked */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center relative opacity-50 bg-gray-50 border-dashed hover:shadow-none transition-all">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-3 border-white">
                2
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <UserCheck size={28} />
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2">Schedule Interview</h4>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              
              <button className="w-full py-2 px-4 rounded-lg bg-gray-400 text-white font-medium flex items-center justify-center text-sm cursor-not-allowed">
                <Lock size={16} className="mr-2" /> Locked
              </button>
            </div>
            
            {/* Step 3 - Locked */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center relative opacity-50 bg-gray-50 border-dashed hover:shadow-none transition-all">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-3 border-white">
                3
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <School size={28} />
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2">Additional Training</h4>
              <p className="text-gray-500 text-sm mb-4 flex-grow">After your interview, complete additional training modules to refine your skills.</p>
              
              <button className="w-full py-2 px-4 rounded-lg bg-gray-400 text-white font-medium flex items-center justify-center text-sm cursor-not-allowed">
                <Lock size={16} className="mr-2" /> Locked
              </button>
            </div>
            
            {/* Step 4 - Locked */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center relative opacity-50 bg-gray-50 border-dashed hover:shadow-none transition-all">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm border-3 border-white">
                4
              </div>
              
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm">
                <Lock size={14} />
              </div>
              
              <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center mb-4">
                <Rocket size={28} />
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2">Kickoff & Setup</h4>
              <p className="text-gray-500 text-sm mb-4 flex-grow">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              
              <button className="w-full py-2 px-4 rounded-lg bg-gray-400 text-white font-medium flex items-center justify-center text-sm cursor-not-allowed">
                <Lock size={16} className="mr-2" /> Locked
              </button>
            </div>
          </div>
        </Card>
        
        {/* Training Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={closeModal}>
            <div 
              className="bg-white rounded-xl shadow-xl w-full max-w-xl transform transition-all animate-enter"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white p-5 flex items-center justify-between rounded-t-xl">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen size={18} className="mr-2" /> Initial Training
                </h3>
                <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                  <GraduationCap size={40} />
                </div>
                
                <h3 className="text-xl font-semibold text-center mb-2">Welcome to ApoLead Training!</h3>
                <p className="text-gray-500 text-center mb-2">This training module will teach you the fundamentals needed to get started. It should take approximately 45-60 minutes to complete.</p>
                <p className="text-gray-500 text-center mb-6">Once completed, you'll be able to proceed to the next steps in your onboarding journey.</p>
                
                <div className="space-y-3 mb-6">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3">
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">Introduction to ApoLead</h4>
                      <div className="flex items-center">
                        <div className="w-28 h-1.5 bg-gray-200 rounded mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] rounded"
                            style={{ width: `${moduleProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{moduleProgress}% Complete</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Core Principles</h4>
                      <span className="text-xs text-gray-500">Locked</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Best Practices</h4>
                      <span className="text-xs text-gray-500">Locked</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className={`w-full py-3 px-6 rounded-lg ${moduleProgress === 100 ? 'bg-gradient-to-r from-[#00c2cb] to-indigo-600' : 'bg-gradient-to-r from-indigo-600 to-[#00c2cb]'} text-white font-medium hover:shadow-lg hover:-translate-y-1 transition-all`}
                  onClick={simulateProgress}
                >
                  {moduleProgress === 100 ? 'Continue to Next Module' : 'Begin Training'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
