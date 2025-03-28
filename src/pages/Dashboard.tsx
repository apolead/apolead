
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [moduleProgress, setModuleProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const getUserProfile = async () => {
      setIsLoading(true);
      try {
        if (user) {
          console.log("Current authenticated user:", user);
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            toast({
              title: "Error",
              description: "Could not fetch your profile information",
              variant: "destructive",
            });
          } else if (data) {
            console.log("User profile fetched:", data);
            setUserProfile(data);
          } else {
            console.log("No profile found for user ID:", user.id);
          }
        }
      } catch (error) {
        console.error("Error in getUserProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      getUserProfile();
    }

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

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, [toast, user]);
  
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
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const simulateProgress = () => {
    if (moduleProgress === 0) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setModuleProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 30);
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
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>25%</h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-arrow-up" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i>
                Onboarding Progress
              </p>
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
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>1/4</h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-check-circle" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i>
                Steps Completed
              </p>
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
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>7 days</h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-hourglass-half" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i>
                Until Deadline
              </p>
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
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>-</h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-trophy" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i>
                Assessment Score
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Cards Container */}
        <div className="action-cards-container" style={{
          marginBottom: '25px',
          background: 'white',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="action-cards-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            position: 'relative'
          }}>
            <h2 style={{ fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center' }}>
              <div className="header-icon" style={{
                marginRight: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)',
                color: 'white',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>
                <i className="fas fa-tasks"></i>
              </div>
              Complete These Steps
            </h2>
            <div className="progress-indicator" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(226, 232, 240, 0.5)',
              padding: '8px 15px',
              borderRadius: '50px'
            }}>
              <div className="progress-bar" style={{
                width: '150px',
                height: '8px',
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                borderRadius: '4px',
                marginRight: '15px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div className="progress-fill" style={{
                  height: '100%',
                  width: '25%',
                  background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
                  borderRadius: '4px',
                  position: 'relative'
                }}></div>
              </div>
              <div className="progress-text" style={{
                fontSize: '14px',
                color: '#64748b',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center'
              }}>
                <i className="fas fa-check-circle" style={{ color: '#10B981', marginRight: '5px' }}></i>
                1 of 4 completed
              </div>
            </div>
          </div>
          
          {/* Action Cards */}
          <div className="action-cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '25px',
            position: 'relative',
            paddingTop: '20px',
            paddingBottom: '20px'
          }}>
            {/* Step 1: Initial Training */}
            <div className="action-card" style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '30px 25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s ease',
              height: '100%'
            }}>
              <div className="step-number completed" style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
                zIndex: 3,
                border: '3px solid white'
              }}>1</div>
              <div className="action-icon completed" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontSize: '30px',
                boxShadow: '0 8px 20px rgba(16,185,129,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <i className="fas fa-book-reader"></i>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b', fontWeight: 600 }}>Initial Training</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px', flexGrow: 1, lineHeight: 1.6 }}>
                Complete the initial training module to unlock the next step. This will teach you the fundamentals.
              </p>
              <button 
                onClick={startTraining}
                className="card-button button-completed" 
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                }}
              >
                <i className="fas fa-play-circle" style={{ marginRight: '8px', fontSize: '16px' }}></i> Start
              </button>
            </div>
            
            {/* Step 2: Interview - Locked */}
            <div className="action-card locked" style={{
              backgroundColor: 'rgba(241, 245, 249, 0.5)',
              borderRadius: '16px',
              padding: '30px 25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s ease',
              height: '100%',
              opacity: 0.5,
              filter: 'grayscale(100%)',
              boxShadow: 'none'
            }}>
              <div className="step-number locked" style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: 'none',
                zIndex: 3,
                border: '3px solid white'
              }}>2</div>
              <div className="lock-icon" style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#94A3B8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 3,
                fontSize: '14px'
              }}>
                <i className="fas fa-lock"></i>
              </div>
              <div className="action-icon locked" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                fontSize: '30px',
                boxShadow: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <i className="fas fa-user-friends"></i>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b', fontWeight: 600 }}>Schedule Interview</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px', flexGrow: 1, lineHeight: 1.6 }}>
                Once your training is reviewed, you'll be able to schedule your interview with our team.
              </p>
              <button 
                className="card-button button-locked" 
                disabled
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  color: 'white',
                  border: 'none',
                  cursor: 'not-allowed',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: '#94A3B8',
                  opacity: 0.7
                }}
              >
                <i className="fas fa-lock" style={{ marginRight: '8px', fontSize: '16px' }}></i> Locked
              </button>
            </div>
            
            {/* Step 3: Additional Training - Locked */}
            <div className="action-card locked" style={{
              backgroundColor: 'rgba(241, 245, 249, 0.5)',
              borderRadius: '16px',
              padding: '30px 25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s ease',
              height: '100%',
              opacity: 0.5,
              filter: 'grayscale(100%)',
              boxShadow: 'none'
            }}>
              <div className="step-number locked" style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: 'none',
                zIndex: 3,
                border: '3px solid white'
              }}>3</div>
              <div className="lock-icon" style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#94A3B8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 3,
                fontSize: '14px'
              }}>
                <i className="fas fa-lock"></i>
              </div>
              <div className="action-icon locked" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                fontSize: '30px',
                boxShadow: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b', fontWeight: 600 }}>Additional Training</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px', flexGrow: 1, lineHeight: 1.6 }}>
                After your interview, complete additional training modules to refine your skills.
              </p>
              <button 
                className="card-button button-locked" 
                disabled
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  color: 'white',
                  border: 'none',
                  cursor: 'not-allowed',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: '#94A3B8',
                  opacity: 0.7
                }}
              >
                <i className="fas fa-lock" style={{ marginRight: '8px', fontSize: '16px' }}></i> Locked
              </button>
            </div>
            
            {/* Step 4: Kickoff & Onboarding - Locked */}
            <div className="action-card locked" style={{
              backgroundColor: 'rgba(241, 245, 249, 0.5)',
              borderRadius: '16px',
              padding: '30px 25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s ease',
              height: '100%',
              opacity: 0.5,
              filter: 'grayscale(100%)',
              boxShadow: 'none'
            }}>
              <div className="step-number locked" style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: 'none',
                zIndex: 3,
                border: '3px solid white'
              }}>4</div>
              <div className="lock-icon" style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#94A3B8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 3,
                fontSize: '14px'
              }}>
                <i className="fas fa-lock"></i>
              </div>
              <div className="action-icon locked" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                fontSize: '30px',
                boxShadow: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <i className="fas fa-rocket"></i>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b', fontWeight: 600 }}>Kickoff & Setup</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px', flexGrow: 1, lineHeight: 1.6 }}>
                Add your banking info, join Discord, and complete final onboarding steps to get started.
              </p>
              <button 
                className="card-button button-locked" 
                disabled
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  color: 'white',
                  border: 'none',
                  cursor: 'not-allowed',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: '#94A3B8',
                  opacity: 0.7
                }}
              >
                <i className="fas fa-lock" style={{ marginRight: '8px', fontSize: '16px' }}></i> Locked
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Training Modal */}
      {showModal && (
        <div className="modal" style={{
          display: 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 1,
          transition: 'opacity 0.3s ease'
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '600px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease'
          }}>
            <div className="modal-header" style={{
              padding: '20px 25px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to right, #4169E1, #00CED1)',
              color: 'white'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-book-reader" style={{ marginRight: '10px' }}></i> Initial Training
              </h2>
              <span 
                className="close-modal" 
                onClick={closeModal}
                style={{ fontSize: '24px', cursor: 'pointer', color: 'white', opacity: 0.8, transition: 'opacity 0.3s' }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body" style={{ padding: '30px' }}>
              <div className="modal-icon" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4169E1, #00CED1)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 25px',
                boxShadow: '0 8px 20px rgba(65, 105, 225, 0.3)'
              }}>
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#1e293b', textAlign: 'center', marginBottom: '15px' }}>
                Welcome to ApoLead Training!
              </h3>
              <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '15px', lineHeight: 1.6 }}>
                This training module will teach you the fundamentals needed to get started. It should take approximately 45-60 minutes to complete.
              </p>
              <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '15px', lineHeight: 1.6 }}>
                Once completed, you'll be able to proceed to the next steps in your onboarding journey.
              </p>
              <div className="training-modules" style={{ margin: '30px 0' }}>
                <div className="module" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  marginBottom: '15px',
                  border: '1px solid #eaeaea',
                  transition: 'all 0.3s'
                }}>
                  <div className="module-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#4169E1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    marginRight: '15px',
                    flexShrink: 0,
                    boxShadow: '0 4px 8px rgba(65, 105, 225, 0.2)'
                  }}>
                    <i className="fas fa-play-circle"></i>
                  </div>
                  <div className="module-info" style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#1e293b', marginBottom: '5px' }}>
                      Introduction to ApoLead
                    </h4>
                    <div className="module-progress" style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="progress-bar" style={{
                        width: '120px',
                        height: '6px',
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        borderRadius: '3px',
                        marginRight: '10px',
                        overflow: 'hidden'
                      }}>
                        <div className="progress-fill" style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #4169E1, #00CED1)',
                          width: `${moduleProgress}%`,
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {moduleProgress}% Complete
                      </span>
                    </div>
                  </div>
                </div>
                <div className="module" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  marginBottom: '15px',
                  border: '1px solid #eaeaea',
                  transition: 'all 0.3s'
                }}>
                  <div className="module-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#4169E1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    marginRight: '15px',
                    flexShrink: 0,
                    boxShadow: '0 4px 8px rgba(65, 105, 225, 0.2)'
                  }}>
                    <i className={moduleProgress === 100 ? "fas fa-play-circle" : "fas fa-lock"}></i>
                  </div>
                  <div className="module-info" style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#1e293b', marginBottom: '5px' }}>
                      Core Principles
                    </h4>
                    <div className="module-progress" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {moduleProgress === 100 ? "Ready to Start" : "Locked"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="module" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  marginBottom: '15px',
                  border: '1px solid #eaeaea',
                  transition: 'all 0.3s'
                }}>
                  <div className="module-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#4169E1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    marginRight: '15px',
                    flexShrink: 0,
                    boxShadow: '0 4px 8px rgba(65, 105, 225, 0.2)'
                  }}>
                    <i className="fas fa-lock"></i>
                  </div>
                  <div className="module-info" style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#1e293b', marginBottom: '5px' }}>
                      Best Practices
                    </h4>
                    <div className="module-progress" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Locked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={simulateProgress}
                className={`start-training-btn ${moduleProgress === 100 ? 'next-module' : ''}`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  background: moduleProgress === 100 
                    ? 'linear-gradient(90deg, #00CED1, #4169E1)' 
                    : 'linear-gradient(90deg, #4169E1, #00CED1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 500,
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: moduleProgress === 100 
                    ? '0 4px 15px rgba(0, 206, 209, 0.3)' 
                    : '0 4px 15px rgba(65, 105, 225, 0.3)'
                }}
              >
                {moduleProgress === 100 ? 'Continue to Next Module' : 'Begin Training'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
