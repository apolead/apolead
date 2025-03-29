
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
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div className="stat-icon" style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(79, 70, 229, 0.1)',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
              fontSize: '22px'
            }}>
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '5px' }}>
              Complete
            </div>
            <div className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Your profile is ready</div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-icon" style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: trainingStatus.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 
                           trainingStatus.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: trainingStatus.status === 'completed' ? '#10B981' : 
                     trainingStatus.status === 'failed' ? '#EF4444' : '#4f46e5',
              fontSize: '22px'
            }}>
              <i className={`fas fa-${trainingStatus.btnIcon}`}></i>
            </div>
            
            <div className="stat-title" style={{ fontWeight: 600, color: '#1e293b', marginBottom: '5px' }}>
              Training & Quiz
            </div>
            
            <div className="stat-status" style={{ 
              color: trainingStatus.status === 'completed' ? '#10B981' : 
                    trainingStatus.status === 'failed' ? '#EF4444' : '#4f46e5',
              fontSize: '14px', 
              fontWeight: 500, 
              marginBottom: '15px' 
            }}>
              {trainingStatus.status === 'completed' ? 'Completed' : 
               trainingStatus.status === 'failed' ? 'Failed' : 'Pending'}
            </div>
            
            <button 
              onClick={trainingStatus.canClick ? startTraining : undefined}
              style={{
                padding: '8px 15px',
                borderRadius: '10px',
                border: 'none',
                background: trainingStatus.btnColor,
                color: 'white',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: trainingStatus.canClick ? 'pointer' : 'default',
                boxShadow: trainingStatus.btnShadow,
                opacity: trainingStatus.canClick ? 1 : 0.7
              }}
            >
              <i className={`fas fa-${trainingStatus.btnIcon}`}></i>
              {trainingStatus.btnText}
            </button>
            
            {trainingStatus.status === 'completed' && (
              <div className="stat-overlay" style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#10B981',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                boxShadow: '0 2px 5px rgba(16,185,129,0.3)'
              }}>
                <i className="fas fa-check"></i>
              </div>
            )}
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: userProfile?.quiz_passed === true ? 1 : 0.7
          }}>
            <div className="stat-icon" style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(79, 70, 229, 0.1)',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
              fontSize: '22px'
            }}>
              <i className="fas fa-calendar-check"></i>
            </div>
            
            <div className="stat-title" style={{ fontWeight: 600, color: '#1e293b', marginBottom: '5px' }}>
              Schedule Interview
            </div>
            
            <div className="stat-status" style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
              {userProfile?.quiz_passed === true ? 'Ready to schedule' : 'Complete training first'}
            </div>
            
            <button 
              onClick={userProfile?.quiz_passed === true ? handleScheduleInterview : undefined}
              disabled={userProfile?.quiz_passed !== true}
              style={{
                padding: '8px 15px',
                borderRadius: '10px',
                border: 'none',
                background: userProfile?.quiz_passed === true ? 
                  'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)' : 
                  '#E2E8F0',
                color: userProfile?.quiz_passed === true ? 'white' : '#94A3B8',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: userProfile?.quiz_passed === true ? 'pointer' : 'not-allowed',
                boxShadow: userProfile?.quiz_passed === true ? 
                  '0 4px 10px rgba(79,70,229,0.2)' : 
                  'none'
              }}
            >
              <i className="fas fa-calendar-alt"></i>
              Schedule Now
            </button>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            opacity: 0.7
          }}>
            <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div className="stat-icon" style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                fontSize: '22px'
              }}>
                <i className="fas fa-tasks"></i>
              </div>
              
              <div className="stat-progress" style={{ fontWeight: 600, color: '#1e293b' }}>
                {steps}/4 Complete
              </div>
            </div>
            
            <div className="progress-bar-container" style={{ 
              width: '100%', 
              height: '10px', 
              backgroundColor: '#E2E8F0', 
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              <div className="progress-bar" style={{
                width: `${percentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
                borderRadius: '5px',
                transition: 'width 0.5s'
              }}></div>
            </div>
            
            <div style={{ flexGrow: 1 }}></div>
            
            <div className="stats-list" style={{ marginTop: '10px' }}>
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <i className="fas fa-check-circle" style={{ color: '#10B981', marginRight: '10px', width: '18px' }}></i>
                <span style={{ color: '#64748b' }}>Profile setup complete</span>
              </div>
              
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <i className={`fas ${userProfile?.quiz_passed === true ? 'fa-check-circle' : 'fa-circle'}`} 
                   style={{ 
                     color: userProfile?.quiz_passed === true ? '#10B981' : '#CBD5E1', 
                     marginRight: '10px', 
                     width: '18px' 
                   }}></i>
                <span style={{ color: '#64748b' }}>Complete training & quiz</span>
              </div>
              
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <i className="fas fa-circle" style={{ color: '#CBD5E1', marginRight: '10px', width: '18px' }}></i>
                <span style={{ color: '#64748b' }}>Schedule interview</span>
              </div>
              
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-circle" style={{ color: '#CBD5E1', marginRight: '10px', width: '18px' }}></i>
                <span style={{ color: '#64748b' }}>Start earning</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add your additional content components here */}
        
      </div>
      
      {showTrainingModal && (
        <TrainingModal
          onClose={closeTrainingModal}
          onComplete={handleTrainingComplete}
          quizStatus={userProfile?.quiz_passed}
        />
      )}
    </div>
  );
};

export default Dashboard;
