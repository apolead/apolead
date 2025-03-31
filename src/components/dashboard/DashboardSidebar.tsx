import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DashboardSidebarProps {
  activeItem?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeItem = 'dashboard' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
      width: sidebarCollapsed ? '60px' : '240px',
      backgroundColor: 'white',
      borderRight: '1px solid #eaeaea',
      padding: '25px 0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 20px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      position: 'relative',
      zIndex: 10,
      textAlign: 'left',
      boxSizing: 'border-box'
    }}>
      <div className="logo" style={{
        padding: sidebarCollapsed ? '25px 0 25px 0' : '0 25px 25px',
        borderBottom: '1px solid #eaeaea',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        width: sidebarCollapsed ? '100%' : 'auto',
        textAlign: sidebarCollapsed ? 'center' : 'left',
        margin: sidebarCollapsed ? '0 auto' : 'inherit',
        position: sidebarCollapsed ? 'relative' : 'static'
      }}>
        <h1 style={{
          fontSize: '28px', 
          fontWeight: 700, 
          transition: 'opacity 0.3s',
          opacity: sidebarCollapsed ? 0 : 1,
          position: sidebarCollapsed ? 'absolute' : 'static',
          left: sidebarCollapsed ? '-9999px' : 'auto',
          width: sidebarCollapsed ? 0 : 'auto',
          height: sidebarCollapsed ? 0 : 'auto',
          overflow: sidebarCollapsed ? 'hidden' : 'visible',
          visibility: sidebarCollapsed ? 'hidden' : 'visible'
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
            width: sidebarCollapsed ? '30px' : '20px',
            height: sidebarCollapsed ? '30px' : '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s',
            position: sidebarCollapsed ? 'absolute' : 'relative',
            right: sidebarCollapsed ? '-15px' : 'auto',
            top: sidebarCollapsed ? '20px' : 'auto',
            backgroundColor: sidebarCollapsed ? 'white' : 'transparent',
            boxShadow: sidebarCollapsed ? '0 0 8px rgba(0,0,0,0.1)' : 'none',
            border: sidebarCollapsed ? '1px solid #eaeaea' : 'none',
            zIndex: 20
          }}
        >
          <i className={`fas fa-angle-${sidebarCollapsed ? 'right' : 'left'}`}></i>
        </div>
      </div>
      
      <div className="nav-menu" style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: sidebarCollapsed ? 0 : '0 15px',
        overflowX: 'hidden',
        width: sidebarCollapsed ? '100%' : 'auto',
        alignItems: sidebarCollapsed ? 'center' : 'stretch'
      }}>
        <Link to="/dashboard" className={`nav-item ${activeItem === 'getting-started' ? 'active' : ''}`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: activeItem === 'getting-started' ? '#4f46e5' : '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          backgroundColor: activeItem === 'getting-started' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          fontWeight: activeItem === 'getting-started' ? 500 : 'normal',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-play-circle" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Getting Started</span>
        </Link>
        
        <Link to="/dashboard" className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: activeItem === 'dashboard' ? '#4f46e5' : '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          backgroundColor: activeItem === 'dashboard' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          fontWeight: activeItem === 'dashboard' ? 500 : 'normal',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-chart-pie" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Dashboard</span>
        </Link>
        
        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          cursor: 'not-allowed',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-tools" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Tool Page</span>
          <i className="fas fa-lock menu-lock-icon" style={{
            display: 'none',
            position: 'absolute',
            left: sidebarCollapsed ? '50%' : '50%',
            top: '50%',
            transform: sidebarCollapsed ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            color: '#94A3B8',
            fontSize: sidebarCollapsed ? '12px' : '18px',
            zIndex: 5
          }}></i>
        </div>
        
        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          cursor: 'not-allowed',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-money-bill-wave" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Payment History</span>
          <i className="fas fa-lock menu-lock-icon" style={{
            display: 'none',
            position: 'absolute',
            left: sidebarCollapsed ? '50%' : '50%',
            top: '50%',
            transform: sidebarCollapsed ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            color: '#94A3B8',
            fontSize: sidebarCollapsed ? '12px' : '18px',
            zIndex: 5
          }}></i>
        </div>
        
        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          cursor: 'not-allowed',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-chart-line" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Performance</span>
          <i className="fas fa-lock menu-lock-icon" style={{
            display: 'none',
            position: 'absolute',
            left: sidebarCollapsed ? '50%' : '50%',
            top: '50%',
            transform: sidebarCollapsed ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            color: '#94A3B8',
            fontSize: sidebarCollapsed ? '12px' : '18px',
            zIndex: 5
          }}></i>
        </div>
        
        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          cursor: 'not-allowed',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-trophy" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Ranking</span>
          <i className="fas fa-lock menu-lock-icon" style={{
            display: 'none',
            position: 'absolute',
            left: sidebarCollapsed ? '50%' : '50%',
            top: '50%',
            transform: sidebarCollapsed ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            color: '#94A3B8',
            fontSize: sidebarCollapsed ? '12px' : '18px',
            zIndex: 5
          }}></i>
        </div>
        
        <Link to="/billing" className={`nav-item ${activeItem === 'billing' ? 'active' : ''}`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: activeItem === 'billing' ? '#4f46e5' : '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          backgroundColor: activeItem === 'billing' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          fontWeight: activeItem === 'billing' ? 500 : 'normal',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-file-invoice-dollar" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Billing Information</span>
        </Link>
        
        <div className="nav-divider" style={{
          height: '1px',
          backgroundColor: '#eaeaea',
          margin: '15px 10px 15px',
          width: 'calc(100% - 20px)'
        }}></div>
        
        <div className={`nav-item locked`} style={{
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '12px 0' : '12px 20px',
          color: '#64748b',
          textDecoration: 'none',
          transition: 'all 0.3s',
          marginBottom: '8px',
          borderRadius: '10px',
          width: '100%',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxSizing: 'border-box',
          cursor: 'not-allowed',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <i className="fas fa-cog" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Settings</span>
          <i className="fas fa-lock menu-lock-icon" style={{
            display: 'none',
            position: 'absolute',
            left: sidebarCollapsed ? '50%' : '50%',
            top: '50%',
            transform: sidebarCollapsed ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            color: '#94A3B8',
            fontSize: sidebarCollapsed ? '12px' : '18px',
            zIndex: 5
          }}></i>
        </div>
        
        <div 
          onClick={handleLogout}
          className="nav-item" 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px 0' : '12px 20px',
            color: '#64748b',
            textDecoration: 'none',
            transition: 'all 0.3s',
            marginBottom: '8px',
            borderRadius: '10px',
            width: '100%',
            whiteSpace: 'nowrap',
            position: 'relative',
            boxSizing: 'border-box',
            cursor: 'pointer',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}
        >
          <i className="fas fa-sign-out-alt" style={{
            marginRight: sidebarCollapsed ? 0 : '12px',
            fontSize: '18px',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0
          }}></i>
          <span style={{
            display: sidebarCollapsed ? 'none' : 'inline-block',
            opacity: sidebarCollapsed ? 0 : 1,
            visibility: sidebarCollapsed ? 'hidden' : 'visible',
            width: sidebarCollapsed ? 0 : 'auto',
            height: sidebarCollapsed ? 0 : 'auto',
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            position: sidebarCollapsed ? 'absolute' : 'static'
          }}>Log Out</span>
        </div>
        
        <div style={{ flexGrow: 1 }}></div>
      </div>
      
      <div className="sidebar-footer" style={{
        padding: sidebarCollapsed ? 0 : '20px 25px',
        borderTop: sidebarCollapsed ? 'none' : '1px solid #eaeaea',
        color: '#64748b',
        fontSize: '14px',
        transition: 'opacity 0.3s',
        opacity: sidebarCollapsed ? 0 : 1,
        visibility: sidebarCollapsed ? 'hidden' : 'visible',
        height: sidebarCollapsed ? 0 : 'auto'
      }}>
        <i className="fas fa-info-circle"></i> Need help? <a href="#" style={{ color: '#4f46e5', textDecoration: 'none' }}>Support Center</a>
      </div>
    </div>
  );
};

export default DashboardSidebar;
