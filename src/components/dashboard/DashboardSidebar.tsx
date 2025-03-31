import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Play,
  ChartPieIcon,
  Wrench,
  DollarSign,
  LineChart,
  Trophy,
  Settings,
  LogOut,
  Receipt
} from 'lucide-react';

interface DashboardSidebarProps {
  activeItem?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeItem = 'dashboard' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{ 
      width: collapsed ? '60px' : '240px',
      backgroundColor: 'white',
      borderRight: '1px solid #eaeaea',
      padding: '25px 0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 20px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      position: 'relative',
      zIndex: 10,
      textAlign: 'left'
    }}>
      <div className="logo" style={{
        padding: collapsed ? '25px 0' : '0 25px 25px',
        borderBottom: '1px solid #eaeaea',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'space-between',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          opacity: collapsed ? 0 : 1,
          position: collapsed ? 'absolute' : 'relative',
          left: collapsed ? '-9999px' : 'auto',
          width: collapsed ? 0 : 'auto',
          height: collapsed ? 0 : 'auto',
          overflow: collapsed ? 'hidden' : 'visible',
          visibility: collapsed ? 'hidden' : 'visible'
        }}>
          <span style={{ color: '#00c2cb' }}>Apo</span>
          <span style={{ color: '#4f46e5' }}>Lead</span>
        </h1>
        <div 
          className="toggle-btn" 
          onClick={toggleSidebar}
          style={{
            cursor: 'pointer',
            fontSize: '12px',
            color: '#64748b',
            width: collapsed ? '30px' : '20px',
            height: collapsed ? '30px' : '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s',
            position: collapsed ? 'absolute' : 'relative',
            right: collapsed ? '-15px' : 'auto',
            top: collapsed ? '20px' : 'auto',
            backgroundColor: collapsed ? 'white' : 'transparent',
            boxShadow: collapsed ? '0 0 8px rgba(0,0,0,0.1)' : 'none',
            border: collapsed ? '1px solid #eaeaea' : 'none'
          }}
        >
          <i className={`fas fa-angle-${collapsed ? 'right' : 'left'}`} style={{ fontSize: collapsed ? '12px' : '12px' }}></i>
        </div>
      </div>

      <div className="nav-menu" style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: collapsed ? '0' : '0 15px',
        overflowX: 'hidden',
        alignItems: collapsed ? 'center' : 'flex-start'
      }}>
        <Link to="/dashboard" className={`nav-item ${activeItem === 'getting-started' ? 'active' : ''}`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: activeItem === 'getting-started' ? '#4f46e5' : '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          backgroundColor: activeItem === 'getting-started' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          fontWeight: activeItem === 'getting-started' ? 500 : 'normal',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <Play size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Getting Started</span>
        </Link>

        <Link to="/dashboard" className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: activeItem === 'dashboard' ? '#4f46e5' : '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          backgroundColor: activeItem === 'dashboard' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          fontWeight: activeItem === 'dashboard' ? 500 : 'normal',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <ChartPieIcon size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Dashboard</span>
        </Link>

        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          cursor: 'not-allowed',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <Wrench size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Tool Page</span>
          <i className="fas fa-lock menu-lock-icon" style={{ 
            position: 'absolute', 
            right: collapsed ? '50%' : '10px',
            top: collapsed ? '50%' : '50%',
            transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
            fontSize: '10px',
            color: '#94a3b8'
          }}></i>
        </div>

        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          cursor: 'not-allowed',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <DollarSign size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Payment History</span>
          <i className="fas fa-lock menu-lock-icon" style={{ 
            position: 'absolute', 
            right: collapsed ? '50%' : '10px',
            top: collapsed ? '50%' : '50%',
            transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
            fontSize: '10px',
            color: '#94a3b8'
          }}></i>
        </div>

        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          cursor: 'not-allowed',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <LineChart size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Performance</span>
          <i className="fas fa-lock menu-lock-icon" style={{ 
            position: 'absolute', 
            right: collapsed ? '50%' : '10px',
            top: collapsed ? '50%' : '50%',
            transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
            fontSize: '10px',
            color: '#94a3b8'
          }}></i>
        </div>

        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          cursor: 'not-allowed',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <Trophy size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Ranking</span>
          <i className="fas fa-lock menu-lock-icon" style={{ 
            position: 'absolute', 
            right: collapsed ? '50%' : '10px',
            top: collapsed ? '50%' : '50%',
            transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
            fontSize: '10px',
            color: '#94a3b8'
          }}></i>
        </div>

        <Link to="/billing" className={`nav-item ${activeItem === 'billing' ? 'active' : ''}`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: activeItem === 'billing' ? '#4f46e5' : '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          backgroundColor: activeItem === 'billing' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          fontWeight: activeItem === 'billing' ? 500 : 'normal',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <Receipt size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Billing Information</span>
        </Link>

        <div className="nav-divider" style={{
          height: '1px',
          backgroundColor: '#eaeaea',
          margin: '15px 10px',
          width: 'calc(100% - 20px)'
        }}></div>

        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          cursor: 'not-allowed',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <Settings size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Settings</span>
          <i className="fas fa-lock menu-lock-icon" style={{ 
            position: 'absolute', 
            right: collapsed ? '50%' : '10px',
            top: collapsed ? '50%' : '50%',
            transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
            fontSize: '10px',
            color: '#94a3b8'
          }}></i>
        </div>

        <div className="nav-item" onClick={handleLogout} style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <LogOut size={18} style={{ marginRight: collapsed ? 0 : '12px', minWidth: '24px', textAlign: 'center' }} />
          <span style={{ 
            display: collapsed ? 'none' : 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            width: collapsed ? 0 : 'auto',
            height: collapsed ? 0 : 'auto',
            overflow: collapsed ? 'hidden' : 'visible'
          }}>Log Out</span>
        </div>

        <div style={{ flexGrow: 1 }}></div>
      </div>

      <div className="sidebar-footer" style={{
        padding: collapsed ? 0 : '20px 25px',
        borderTop: collapsed ? 'none' : '1px solid #eaeaea',
        color: '#64748b',
        fontSize: '14px',
        transition: 'opacity 0.3s',
        opacity: collapsed ? 0 : 1,
        visibility: collapsed ? 'hidden' : 'visible',
        height: collapsed ? 0 : 'auto',
        overflow: 'hidden'
      }}>
        <i className="fas fa-info-circle"></i> Need help? <a href="#" style={{ color: '#4f46e5', textDecoration: 'none' }}>Support Center</a>
      </div>
    </div>
  );
};

export default DashboardSidebar;
