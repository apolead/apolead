import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Phone,
  Settings
} from 'lucide-react';

export interface SupervisorSidebarProps {
  activeItem?: string;
  collapsed: boolean;
  onToggle: () => void;
}

export const SupervisorSidebar: React.FC<SupervisorSidebarProps> = ({ 
  activeItem = 'interview', 
  collapsed,
  onToggle 
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
          <span style={{ color: '#00c2cb' }}>Apo</span><span style={{ color: '#4f46e5' }}>Lead</span>
        </h1>
        <div className="toggle-btn" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </div>
      </div>
      <div className="nav-menu">
        <Link to="/supervisor" className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}>
          <Home size={18} />
          <span>Dashboard</span>
        </Link>
        
        <Link to="/supervisor" className={`nav-item ${activeItem === 'interview' ? 'active' : ''}`}>
          <Users size={18} />
          <span>Interview</span>
        </Link>
        
        <Link to="/did-list" className={`nav-item ${activeItem === 'did-list' ? 'active' : ''}`}>
          <Phone size={18} />
          <span>DID List</span>
        </Link>
        
        <div className="nav-divider"></div>
        
        <div className={`nav-item locked`}>
          <Settings size={18} />
          <span>Settings</span>
        </div>

        <a href="#" className="nav-item" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </a>
        
        <div style={{ flexGrow: 1 }}></div>
      </div>
    </div>
  );
};
