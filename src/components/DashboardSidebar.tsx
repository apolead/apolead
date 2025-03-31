
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DashboardSidebarProps {
  activePage?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activePage }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`fixed h-screen z-10 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>
      <div className={`p-6 pb-6 border-b border-gray-200 mb-6 flex justify-between items-center ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <h1 className="text-2xl font-bold">
            <span className="text-[#00c2cb]">Apo</span>
            <span className="text-indigo-600">Lead</span>
          </h1>
        )}
        <button 
          onClick={handleToggle} 
          className={`w-6 h-6 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all rounded-full ${collapsed ? 'absolute -right-3 top-6 bg-white border border-gray-200 shadow-sm' : ''}`}
        >
          <i className={`fas ${collapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
        </button>
      </div>

      <div className="flex flex-col px-4">
        <Link 
          to="/dashboard" 
          className={`flex items-center py-3 px-5 rounded-lg mb-2 transition-all ${activePage === 'dashboard' ? 'bg-indigo-100 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
        >
          <i className="fas fa-play-circle w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Getting Started</span>}
        </Link>

        <div className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-400 relative ${collapsed ? 'justify-center' : ''}`}>
          <i className="fas fa-chart-pie w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Dashboard</span>}
          <i className="fas fa-lock absolute right-4 text-xs"></i>
        </div>

        <div className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-400 relative ${collapsed ? 'justify-center' : ''}`}>
          <i className="fas fa-tools w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Tool Page</span>}
          <i className="fas fa-lock absolute right-4 text-xs"></i>
        </div>

        <div className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-400 relative ${collapsed ? 'justify-center' : ''}`}>
          <i className="fas fa-money-bill-wave w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Payment History</span>}
          <i className="fas fa-lock absolute right-4 text-xs"></i>
        </div>

        <div className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-400 relative ${collapsed ? 'justify-center' : ''}`}>
          <i className="fas fa-chart-line w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Performance</span>}
          <i className="fas fa-lock absolute right-4 text-xs"></i>
        </div>

        <div className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-400 relative ${collapsed ? 'justify-center' : ''}`}>
          <i className="fas fa-trophy w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Ranking</span>}
          <i className="fas fa-lock absolute right-4 text-xs"></i>
        </div>

        <Link 
          to="/billing" 
          className={`flex items-center py-3 px-5 rounded-lg mb-2 transition-all ${activePage === 'billing' ? 'bg-indigo-100 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
        >
          <i className="fas fa-file-invoice-dollar w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Billing Information</span>}
        </Link>

        <div className="h-px bg-gray-200 my-4 mx-2"></div>

        <div className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-400 relative ${collapsed ? 'justify-center' : ''}`}>
          <i className="fas fa-cog w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Settings</span>}
          <i className="fas fa-lock absolute right-4 text-xs"></i>
        </div>

        <button 
          onClick={handleLogout}
          className={`flex items-center py-3 px-5 rounded-lg mb-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <i className="fas fa-sign-out-alt w-6 text-center"></i>
          {!collapsed && <span className="ml-3">Log Out</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-auto p-6 border-t border-gray-200 text-sm text-gray-500">
          <i className="fas fa-info-circle mr-2"></i> Need help? <a href="#" className="text-indigo-600">Support Center</a>
        </div>
      )}
    </div>
  );
};
