
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, LayoutDashboard, PlayCircle, Wrench, CreditCard, BarChart2, Trophy, FileText, Settings, LogOut, Lock } from 'lucide-react';

export const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Check if onboarding is completed to determine which items should be locked
  const isOnboardingCompleted = userProfile && 
    userProfile.first_name && 
    userProfile.last_name && 
    userProfile.birth_day && 
    userProfile.gov_id_number && 
    userProfile.gov_id_image;
    
  // Check if all requirements are met to enable training
  const isTrainingEnabled = isOnboardingCompleted && 
    userProfile.meet_obligation === true && 
    userProfile.login_discord === true && 
    userProfile.check_emails === true && 
    userProfile.solve_problems === true && 
    userProfile.complete_training === true;
  
  // Additional utility function to apply icon styling based on collapsed state
  const getIconStyles = () => {
    return collapsed ? 
      "w-full flex justify-center items-center" : 
      "mr-3 min-w-[24px]";
  };
  
  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h1>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-all ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <div className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        <Link
          to="/dashboard"
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === '/dashboard' 
              ? 'bg-indigo-50 text-indigo-600' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <PlayCircle className={getIconStyles()} size={20} />
          {!collapsed && <span>Getting Started</span>}
        </Link>
        
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
          <LayoutDashboard className={getIconStyles()} size={20} />
          {!collapsed && <span>Dashboard</span>}
          {(!collapsed && !isTrainingEnabled) && <Lock size={14} className="ml-auto" />}
        </div>
        
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
          <Wrench className={getIconStyles()} size={20} />
          {!collapsed && <span>Tool Page</span>}
          {(!collapsed && !isTrainingEnabled) && <Lock size={14} className="ml-auto" />}
        </div>
        
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
          <CreditCard className={getIconStyles()} size={20} />
          {!collapsed && <span>Payment History</span>}
          {(!collapsed && !isTrainingEnabled) && <Lock size={14} className="ml-auto" />}
        </div>
        
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
          <BarChart2 className={getIconStyles()} size={20} />
          {!collapsed && <span>Performance</span>}
          {(!collapsed && !isTrainingEnabled) && <Lock size={14} className="ml-auto" />}
        </div>
        
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
          <Trophy className={getIconStyles()} size={20} />
          {!collapsed && <span>Ranking</span>}
          {(!collapsed && !isTrainingEnabled) && <Lock size={14} className="ml-auto" />}
        </div>
        
        <Link
          to="/billing"
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === '/billing' 
              ? 'bg-indigo-50 text-indigo-600' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <FileText className={getIconStyles()} size={20} />
          {!collapsed && <span>Billing Information</span>}
        </Link>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
          <Settings className={getIconStyles()} size={20} />
          {!collapsed && <span>Settings</span>}
          {(!collapsed && !isTrainingEnabled) && <Lock size={14} className="ml-auto" />}
        </div>
        
        <button
          onClick={handleSignOut}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className={getIconStyles()} size={20} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
      
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center mb-1">
            <span className="text-gray-700 font-medium">Need help?</span>
            <a href="#" className="ml-1 text-indigo-600 hover:underline">Support</a>
          </div>
          <p>© 2025 ApoLead, All rights Reserved</p>
        </div>
      )}
    </div>
  );
};
