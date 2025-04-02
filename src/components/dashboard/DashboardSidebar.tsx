
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Home, BookOpen, Users, Wrench, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DashboardSidebarProps {
  activeItem?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeItem = 'dashboard' }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        <h1>
          <span>Apo</span><span>Lead</span>
        </h1>
        <div className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </div>
      </div>
      <div className="nav-menu">
        <Link to="/dashboard" className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}>
          <Home size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/training" className={`nav-item ${activeItem === 'training' ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>Training</span>
        </Link>
        <Link to="/supervisor" className={`nav-item ${activeItem === 'supervisor' ? 'active' : ''}`}>
          <Users size={18} />
          <span>Supervisor</span>
        </Link>
        <Link to="/tools" className={`nav-item ${activeItem === 'tools' ? 'active' : ''}`}>
          <Wrench size={18} />
          <span>Tools</span>
        </Link>
        <Link to="/billing" className={`nav-item ${activeItem === 'billing' ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Billing</span>
        </Link>
        
        <div className="nav-divider"></div>
        
        <Link to="/settings" className={`nav-item ${activeItem === 'settings' ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <a href="#" className="nav-item" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </a>
      </div>
      <div className="sidebar-footer">
        <UserCircle size={16} className="mr-1" /> Need help? <Link to="/support">Support</Link>
      </div>
    </div>
  );
};
