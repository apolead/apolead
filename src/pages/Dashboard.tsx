
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import TrainingModal from '@/components/training/TrainingModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleScheduleInterview = () => {
    setShowTrainingModal(true);
  };
  
  useEffect(() => {
    setIsLoading(false);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    console.log('Dashboard mounted, user:', user);
    console.log('Dashboard mounted, userProfile:', userProfile);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, [user, userProfile]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const startTraining = () => {
    setShowTrainingModal(true);
  };
  
  const closeTrainingModal = () => {
    setShowTrainingModal(false);
  };
  
  const handleTrainingComplete = (passed: boolean) => {
    if (passed) {
      toast({
        title: "Training Completed",
        description: "You have successfully completed the training and can now proceed to the next step.",
      });
    }
  };
  
  const getUserInitials = () => {
    if (!userProfile?.first_name && !userProfile?.last_name) {
      if (user?.email) {
        return user.email.substring(0, 2).toUpperCase();
      }
      return "NA";
    }
    
    const firstInitial = userProfile?.first_name?.charAt(0) || "";
    const lastInitial = userProfile?.last_name?.charAt(0) || "";
    
    return `${firstInitial}${lastInitial}`;
  };
  
  const getFirstName = () => {
    return userProfile?.first_name || user?.email?.split('@')[0] || "User";
  };

  const getFullName = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim();
    }
    
    return user?.email || "User";
  };
  
  const getProgress = () => {
    if (!userProfile) return { percentage: 0, steps: 0 };
    
    let steps = 0;
    if (userProfile.quiz_passed) steps++;
    
    return {
      percentage: (steps / 4) * 100,
      steps: steps
    };
  };
  
  const getTrainingStatus = () => {
    // Handle the false case properly
    if (userProfile?.quiz_passed === true) {
      return {
        status: 'completed',
        color: 'green',
        btnText: 'Completed',
        btnIcon: 'check-circle',
        btnColor: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
        btnShadow: '0 4px 10px rgba(16,185,129,0.2)',
        canClick: false
      };
    } else if (userProfile?.quiz_passed === false) {
      return {
        status: 'failed',
        color: 'red',
        btnText: 'Failed',
        btnIcon: 'times-circle',
        btnColor: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
        btnShadow: '0 4px 10px rgba(239,68,68,0.2)',
        canClick: false
      };
    } else {
      return {
        status: 'pending',
        color: 'blue',
        btnText: 'Start',
        btnIcon: 'play-circle',
        btnColor: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
        btnShadow: '0 4px 10px rgba(79,70,229,0.2)',
        canClick: true
      };
    }
  };
  
  const { percentage, steps } = getProgress();
  const trainingStatus = getTrainingStatus();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
          <a href="#" className="nav-item active" style={{
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
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fontWeight: 500,
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
          </a>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <div className="nav-divider" style={{
            height: '1px',
            backgroundColor: '#eaeaea',
            margin: '15px 10px 15px',
            width: 'calc(100% - 20px)'
          }}></div>
          
          <a href="#" className="nav-item locked" style={{
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
          </a>
          
          <a 
            href="#" 
            className="nav-item" 
            onClick={handleLogout}
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
          </a>
          
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
      
      <div className="main-content" style={{ flex: 1, padding: '20px 30px' }}>
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div className="welcome" style={{ fontSize: '26px', fontWeight: 600, color: '#1e293b' }}>
            {isLoading ? (
              <span>Loading profile...</span>
            ) : (
              <>
                Thanks for signing up, <span style={{ color: '#4f46e5', position: 'relative' }}>{getFirstName()}</span>!
              </>
            )}
            <style>{`
              .welcome span::after {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%);
                border-radius: 2px;
              }
            `}</style>
          </div>
          
          <div className="user-info" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="action-buttons" style={{ display: 'flex', gap: '15px', marginRight: '20px' }}>
              <div className="action-button" style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                position: 'relative',
                color: '#64748b',
                transition: 'all 0.3s'
              }}>
                <i className="fas fa-search"></i>
              </div>
              <div className="action-button notification" style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                position: 'relative',
                color: '#64748b',
                transition: 'all 0.3s'
              }}>
                <i className="fas fa-bell"></i>
                <style>{`
                  .notification::after {
                    content: '';
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #f56565;
                    border: 2px solid white;
                  }
                `}</style>
              </div>
              <div className="action-button" style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                position: 'relative',
                color: '#64748b',
                transition: 'all 0.3s'
              }}>
                <i className="fas fa-cog"></i>
              </div>
            </div>
            
            <div className="user-profile" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              padding: '8px 15px 8px 8px',
              borderRadius: '50px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div className="user-avatar" style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                marginRight: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px'
              }}>
                {getUserInitials()}
              </div>
              <div className="user-name" style={{ fontWeight: 500, color: '#1e293b' }}>{getFullName()}</div>
              <i className="fas fa-chevron-down dropdown-icon" style={{ marginLeft: '8px', color: '#64748b' }}></i>
            </div>
          </div>
        </div>
        
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
          <h2 style={{ fontSize: '24px', color: '#1e293b', display: 'flex', alignItems: 'center' }}>
            <div className="page-title-icon" style={{
              marginRight: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              <i className="fas fa-clipboard-list"></i>
            </div>
            Onboarding Process
          </h2>
          <div className="page-subtitle" style={{
            color: '#64748b',
            marginLeft: '15px',
            fontSize: '14px',
            paddingLeft: '15px',
            borderLeft: '2px solid #e2e8f0'
          }}>Complete all steps to start earning</div>
        </div>
        
        <div className="stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '25px',
          marginBottom: '30px'
        }}>
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '150px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-icon" style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(0, 194, 203, 0.1) 100%)',
              borderRadius: '0 0 0 100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '15px'
            }}>
              <i className="fas fa-bullseye" style={{ fontSize: '24px', color: '#4f46e5' }}></i>
            </div>
            <div className="stat-title" style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Completion Progress</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>{Math.round(percentage)}%</div>
            <div className="stat-bar" style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginTop: '15px' }}>
              <div style={{
                height: '100%',
                width: `${percentage}%`,
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)'
              }}></div>
            </div>
            <div className="stat-detail" style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>
              {steps} of 4 steps completed
            </div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '150px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-icon" style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(0, 194, 203, 0.1) 100%)',
              borderRadius: '0 0 0 100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '15px'
            }}>
              <i className="fas fa-user-check" style={{ fontSize: '24px', color: '#4f46e5' }}></i>
            </div>
            <div className="stat-title" style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Account Status</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
              {userProfile?.quiz_passed === true ? 'Approved' : 'Pending'}
            </div>
            <div className="stat-detail" style={{ fontSize: '13px', color: '#64748b', marginTop: '15px' }}>
              {userProfile?.quiz_passed === true ? (
                <span className="status" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '5px' }}></i> Ready to schedule interview
                </span>
              ) : (
                <span className="status" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <i className="fas fa-clock" style={{ color: '#f59e0b', marginRight: '5px' }}></i> Complete training required
                </span>
              )}
            </div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '150px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-icon" style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(0, 194, 203, 0.1) 100%)',
              borderRadius: '0 0 0 100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '15px'
            }}>
              <i className="fas fa-calendar-alt" style={{ fontSize: '24px', color: '#4f46e5' }}></i>
            </div>
            <div className="stat-title" style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Interview Status</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
              {userProfile?.quiz_passed === true ? 'Ready' : 'Locked'}
            </div>
            <div className="stat-detail" style={{ fontSize: '13px', color: '#64748b', marginTop: '15px' }}>
              {userProfile?.quiz_passed === true ? (
                <span className="status" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <i className="fas fa-unlock" style={{ color: '#10b981', marginRight: '5px' }}></i> Available to schedule
                </span>
              ) : (
                <span className="status" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <i className="fas fa-lock" style={{ color: '#94a3b8', marginRight: '5px' }}></i> Complete training first
                </span>
              )}
            </div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '150px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-icon" style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(0, 194, 203, 0.1) 100%)',
              borderRadius: '0 0 0 100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '15px'
            }}>
              <i className="fas fa-wallet" style={{ fontSize: '24px', color: '#4f46e5' }}></i>
            </div>
            <div className="stat-title" style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Estimated Earnings</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>$0.00</div>
            <div className="stat-detail" style={{ fontSize: '13px', color: '#64748b', marginTop: '15px' }}>
              <span className="status" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <i className="fas fa-lock" style={{ color: '#94a3b8', marginRight: '5px' }}></i> Complete all steps to unlock
              </span>
            </div>
          </div>
        </div>
        
        <div className="onboarding-steps" style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>Your Onboarding Steps</h3>
          
          <div className="steps" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="step-number" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>1</div>
              <div className="step-content" style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '5px' }}>Complete Initial Training</h4>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Watch the training video and pass the knowledge quiz</p>
                <div className="step-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="status" style={{ fontSize: '14px' }}>
                    {userProfile?.quiz_passed === true ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#10b981' }}>
                        <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i> Completed
                      </span>
                    ) : userProfile?.quiz_passed === false ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#ef4444' }}>
                        <i className="fas fa-times-circle" style={{ marginRight: '5px' }}></i> Failed
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#f59e0b' }}>
                        <i className="fas fa-clock" style={{ marginRight: '5px' }}></i> Not Started
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={trainingStatus.canClick ? startTraining : undefined}
                    disabled={!trainingStatus.canClick}
                    style={{
                      background: trainingStatus.btnColor,
                      boxShadow: trainingStatus.btnShadow,
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '8px 20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: trainingStatus.canClick ? 'pointer' : 'not-allowed',
                      opacity: trainingStatus.canClick ? 1 : 0.8,
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className={`fas fa-${trainingStatus.btnIcon}`} style={{ marginRight: '8px' }}></i>
                    {trainingStatus.btnText}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="step-number" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: userProfile?.quiz_passed === true ? 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)' : '#e2e8f0',
                color: userProfile?.quiz_passed === true ? 'white' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>2</div>
              <div className="step-content" style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', color: userProfile?.quiz_passed === true ? '#1e293b' : '#94a3b8', marginBottom: '5px' }}>Schedule an Interview</h4>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Book a time for your virtual onboarding interview</p>
                <div className="step-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="status" style={{ fontSize: '14px' }}>
                    {userProfile?.quiz_passed === true ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#f59e0b' }}>
                        <i className="fas fa-clock" style={{ marginRight: '5px' }}></i> Not Scheduled
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8' }}>
                        <i className="fas fa-lock" style={{ marginRight: '5px' }}></i> Locked
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={userProfile?.quiz_passed === true ? handleScheduleInterview : undefined}
                    disabled={userProfile?.quiz_passed !== true}
                    style={{
                      background: userProfile?.quiz_passed === true 
                        ? 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)' 
                        : '#e2e8f0',
                      boxShadow: userProfile?.quiz_passed === true 
                        ? '0 4px 10px rgba(79,70,229,0.2)' 
                        : 'none',
                      color: userProfile?.quiz_passed === true ? 'white' : '#94a3b8',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '8px 20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: userProfile?.quiz_passed === true ? 'pointer' : 'not-allowed',
                      opacity: userProfile?.quiz_passed === true ? 1 : 0.8,
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className={`fas fa-${userProfile?.quiz_passed === true ? 'calendar-alt' : 'lock'}`} style={{ marginRight: '8px' }}></i>
                    {userProfile?.quiz_passed === true ? 'Schedule' : 'Locked'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="step-number" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>3</div>
              <div className="step-content" style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '5px' }}>Complete Background Check</h4>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Provide necessary information for verification</p>
                <div className="step-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="status" style={{ fontSize: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8' }}>
                      <i className="fas fa-lock" style={{ marginRight: '5px' }}></i> Locked
                    </span>
                  </div>
                  <button 
                    disabled={true}
                    style={{
                      background: '#e2e8f0',
                      color: '#94a3b8',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '8px 20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'not-allowed',
                      opacity: 0.8,
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                    Locked
                  </button>
                </div>
              </div>
            </div>
            
            <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="step-number" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>4</div>
              <div className="step-content" style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '5px' }}>Setup Payment Information</h4>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Add your banking details for receiving payments</p>
                <div className="step-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="status" style={{ fontSize: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8' }}>
                      <i className="fas fa-lock" style={{ marginRight: '5px' }}></i> Locked
                    </span>
                  </div>
                  <button 
                    disabled={true}
                    style={{
                      background: '#e2e8f0',
                      color: '#94a3b8',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '8px 20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'not-allowed',
                      opacity: 0.8,
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                    Locked
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="additional-resources" style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>Helpful Resources</h3>
          
          <div className="resources" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            <div className="resource" style={{
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div className="resource-icon" style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                flexShrink: 0
              }}>
                <i className="fas fa-book"></i>
              </div>
              <div className="resource-content">
                <h4 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '2px' }}>Knowledge Base</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Common questions and answers</p>
              </div>
            </div>
            
            <div className="resource" style={{
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div className="resource-icon" style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                flexShrink: 0
              }}>
                <i className="fas fa-play-circle"></i>
              </div>
              <div className="resource-content">
                <h4 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '2px' }}>Tutorial Videos</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Learn the platform with video guides</p>
              </div>
            </div>
            
            <div className="resource" style={{
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div className="resource-icon" style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                flexShrink: 0
              }}>
                <i className="fas fa-users"></i>
              </div>
              <div className="resource-content">
                <h4 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '2px' }}>Community Forum</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Connect with other agents</p>
              </div>
            </div>
            
            <div className="resource" style={{
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div className="resource-icon" style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                flexShrink: 0
              }}>
                <i className="fas fa-headset"></i>
              </div>
              <div className="resource-content">
                <h4 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '2px' }}>Contact Support</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Get help from our support team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showTrainingModal && (
        <TrainingModal 
          isOpen={showTrainingModal} 
          onClose={closeTrainingModal} 
          onComplete={handleTrainingComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
