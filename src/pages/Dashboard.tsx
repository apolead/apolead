
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
  
  useEffect(() => {
    setIsLoading(false);

    // Add Font Awesome
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);

    // Add Poppins font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    // Add debug logging
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
    // This will be called after the quiz is submitted
    if (passed) {
      toast({
        title: "Training Completed",
        description: "You have successfully completed the training and can now proceed to the next step.",
      });
    }
  };
  
  // Generate user initials
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
  
  // Calculate progress based on completed steps
  const getProgress = () => {
    if (!userProfile) return { percentage: 0, steps: 0 };
    
    let steps = 0;
    if (userProfile.quiz_passed) steps++;
    
    // More steps will be added later
    
    return {
      percentage: (steps / 4) * 100, // 4 total steps
      steps: steps
    };
  };
  
  const { percentage, steps } = getProgress();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
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
      
      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, padding: '20px 30px' }}>
        {/* Header */}
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
        
        {/* Page Title */}
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
        
        {/* Stats Section */}
        <div className="stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '25px',
          marginBottom: '25px'
        }}>
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '25px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-icon" style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(0,194,203,0.1) 100%)',
              color: '#4f46e5',
              fontSize: '24px',
              position: 'relative'
            }}>
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>Step 1</h3>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Complete Training</p>
              <button 
                onClick={startTraining}
                style={{ 
                  backgroundColor: userProfile?.quiz_passed ? '#10b981' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 15px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {userProfile?.quiz_passed ? (
                  <>
                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                    Completed
                  </>
                ) : (
                  <>
                    <i className="fas fa-play" style={{ marginRight: '8px' }}></i>
                    Start Training
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '25px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            opacity: !userProfile?.quiz_passed ? 0.5 : 1,
            cursor: !userProfile?.quiz_passed ? 'not-allowed' : 'pointer'
          }}>
            <div className="stat-icon" style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(234,88,12,0.1) 100%)',
              color: '#f97316',
              fontSize: '24px'
            }}>
              <i className="fas fa-file-signature"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>Step 2</h3>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Complete Profile</p>
              <button 
                disabled={!userProfile?.quiz_passed}
                style={{ 
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 15px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: !userProfile?.quiz_passed ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: !userProfile?.quiz_passed ? 0.7 : 1
                }}
              >
                <i className="fas fa-edit" style={{ marginRight: '8px' }}></i>
                Update Profile
              </button>
              {!userProfile?.quiz_passed && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'transparent',
                  cursor: 'not-allowed',
                  zIndex: 5
                }}></div>
              )}
            </div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '25px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            opacity: !userProfile?.quiz_passed ? 0.5 : 1,
            cursor: !userProfile?.quiz_passed ? 'not-allowed' : 'pointer'
          }}>
            <div className="stat-icon" style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(6,182,212,0.1) 100%)',
              color: '#0ea5e9',
              fontSize: '24px'
            }}>
              <i className="fas fa-university"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>Step 3</h3>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Banking Details</p>
              <button 
                disabled={!userProfile?.quiz_passed}
                style={{ 
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 15px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: !userProfile?.quiz_passed ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: !userProfile?.quiz_passed ? 0.7 : 1
                }}
              >
                <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                Add Bank Account
              </button>
              {!userProfile?.quiz_passed && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'transparent',
                  cursor: 'not-allowed',
                  zIndex: 5
                }}></div>
              )}
            </div>
          </div>
          
          <div className="stat-card" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '25px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            opacity: !userProfile?.quiz_passed ? 0.5 : 1,
            cursor: !userProfile?.quiz_passed ? 'not-allowed' : 'pointer'
          }}>
            <div className="stat-icon" style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(168,85,247,0.1) 100%)',
              color: '#8b5cf6',
              fontSize: '24px'
            }}>
              <i className="fas fa-handshake"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>Step 4</h3>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Sign Contract</p>
              <button 
                disabled={!userProfile?.quiz_passed}
                style={{ 
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 15px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: !userProfile?.quiz_passed ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: !userProfile?.quiz_passed ? 0.7 : 1
                }}
              >
                <i className="fas fa-file-signature" style={{ marginRight: '8px' }}></i>
                Review Contract
              </button>
              {!userProfile?.quiz_passed && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'transparent',
                  cursor: 'not-allowed',
                  zIndex: 5
                }}></div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="progress-section" style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: '#1e293b', fontWeight: 600 }}>Onboarding Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#4f46e5' }}>{steps}/4 Steps</div>
              <div style={{ marginLeft: '15px', fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>{Math.round(percentage)}%</div>
            </div>
          </div>
          
          <div className="progress-bar-container" style={{ width: '100%', backgroundColor: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)', borderRadius: '5px', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
        
        {/* Guide Section */}
        <div className="guide-section" style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '20px', color: '#1e293b', fontWeight: 600, marginBottom: '15px' }}>Getting Started Guide</h3>
          
          <div className="guide-steps" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="guide-step" style={{ display: 'flex' }}>
              <div className="step-number" style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                marginRight: '15px',
                flexShrink: 0
              }}>1</div>
              <div className="step-content">
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '5px' }}>Complete the training</h4>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Watch the training video and pass the quiz to understand how our platform works and what's expected from you.</p>
              </div>
            </div>
            
            <div className="guide-step" style={{ display: 'flex' }}>
              <div className="step-number" style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                marginRight: '15px',
                flexShrink: 0
              }}>2</div>
              <div className="step-content">
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '5px' }}>Complete your profile</h4>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Add all required personal information, including contact details, experience, and a professional photo.</p>
              </div>
            </div>
            
            <div className="guide-step" style={{ display: 'flex' }}>
              <div className="step-number" style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                color: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                marginRight: '15px',
                flexShrink: 0
              }}>3</div>
              <div className="step-content">
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '5px' }}>Add your banking details</h4>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Set up your payment information to ensure you get paid quickly for your completed tasks.</p>
              </div>
            </div>
            
            <div className="guide-step" style={{ display: 'flex' }}>
              <div className="step-number" style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                marginRight: '15px',
                flexShrink: 0
              }}>4</div>
              <div className="step-content">
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '5px' }}>Review and sign the contract</h4>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Read and digitally sign the contract with all terms and conditions for working with our platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Training Modal */}
      {showTrainingModal && (
        <TrainingModal onClose={closeTrainingModal} onComplete={handleTrainingComplete} />
      )}
    </div>
  );
};

export default Dashboard;
