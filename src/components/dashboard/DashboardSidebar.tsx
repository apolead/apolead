import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  PieChart,
  TrendingUp,
  Award,
  Lock,
  FileText,
  Settings,
  Wrench,
  Info,
  DollarSign,
  GraduationCap
} from 'lucide-react';

export interface DashboardSidebarProps {
  activeItem?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeItem = 'dashboard' }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always navigate to home page, even if logout had issues
      navigate('/', { replace: true });
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Define which items should be active vs locked
  const unlockedItems = ['dashboard', 'billing', 'probation-training', 'logout'];
  const isItemUnlocked = (itemName: string) => unlockedItems.includes(itemName);
  const isProbationAgent = userProfile?.agent_standing === 'probation' || userProfile?.agent_standing === 'Probation';

  return (
    <div className="sidebar ${collapsed ? 'collapsed' : ''}">
      <div className="logo">
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
          <span style={{ color: '#00c2cb' }}>Apo</span><span style={{ color: '#4f46e5' }}>Lead</span>
        </h1>
        <div className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </div>
      </div>
      <div className="nav-menu">
        <Link to="/dashboard" className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}>
          <Home size={18} />
          <span>Getting Started</span>
        </Link>
        
        <div className={`nav-item locked ${activeItem === 'metrics' ? 'active' : ''}`}>
          <PieChart size={18} />
          <span>Dashboard</span>
          <Lock size={18} className="menu-lock-icon" />
        </div>
        
        <div className={`nav-item locked ${activeItem === 'tools' ? 'active' : ''}`}>
          <Wrench size={18} />
          <span>Tool Page</span>
          <Lock size={18} className="menu-lock-icon" />
        </div>
        
        <div className={`nav-item locked ${activeItem === 'payment-history' ? 'active' : ''}`}>
          <DollarSign size={18} />
          <span>Payment History</span>
          <Lock size={18} className="menu-lock-icon" />
        </div>
        
        <div className={`nav-item locked ${activeItem === 'performance' ? 'active' : ''}`}>
          <TrendingUp size={18} />
          <span>Performance</span>
          <Lock size={18} className="menu-lock-icon" />
        </div>
        
        <div className={`nav-item locked ${activeItem === 'ranking' ? 'active' : ''}`}>
          <Award size={18} />
          <span>Ranking</span>
          <Lock size={18} className="menu-lock-icon" />
        </div>

        {isProbationAgent && (
          <Link to="/dashboard" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  document.getElementById('additional-training-btn')?.click(); 
                }} 
                className={`nav-item ${activeItem === 'probation-training' ? 'active' : ''}`}>
            <GraduationCap size={18} />
            <span>Additional Training</span>
          </Link>
        )}
        
        <Link to="/billing" className={`nav-item ${activeItem === 'billing' ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Billing Information</span>
        </Link>
        
        <div className="nav-divider"></div>
        
        <div className={`nav-item locked ${activeItem === 'settings' ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
          <Lock size={18} className="menu-lock-icon" />
        </div>

        <a href="#" className="nav-item" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </a>
        
        <div style={{ flexGrow: 1 }}></div>
      </div>
      <div className="sidebar-footer">
        <Info size={16} className="mr-1" /> Need help? <Link to="/support" className="text-indigo-600 ml-1">Support Center</Link>
      </div>
    </div>
  );
};
