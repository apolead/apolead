import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import TrainingModal from '@/components/training/TrainingModal';

const Dashboard = () => {
  const navigate = useNavigate();
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
    if (userProfile?.quiz_passed !== true && userProfile?.quiz_passed !== false) {
      setShowTrainingModal(true);
    } else {
      console.log("Training already completed with result:", userProfile?.quiz_passed);
      toast({
        title: "Training Status",
        description: userProfile?.quiz_passed === true 
          ? "You have already completed the training successfully." 
          : "You have already attempted the training.",
      });
    }
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
    if (userProfile.quiz_passed === true) steps++;
    
    return {
      percentage: (steps / 4) * 100,
      steps: steps
    };
  };
  
  const getTrainingStatus = () => {
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <main className="flex-1 bg-background p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            
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
                padding: '25px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="stat-header" style={{ marginBottom: '15px' }}>
                  <div className="stat-title" style={{ fontSize: '16px', color: '#64748b', marginBottom: '5px' }}>Total Earnings</div>
                  <div className="stat-value" style={{ fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>$0.00</div>
                </div>
                <div className="stat-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-change locked" style={{ fontSize: '14px', color: '#94a3b8' }}>
                    <i className="fas fa-lock" style={{ marginRight: '5px' }}></i>
                    Locked
                  </div>
                  <div className="stat-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '18px'
                  }}>
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                </div>
              </div>
              
              <div className="stat-card" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="stat-header" style={{ marginBottom: '15px' }}>
                  <div className="stat-title" style={{ fontSize: '16px', color: '#64748b', marginBottom: '5px' }}>Completion</div>
                  <div className="stat-value" style={{ fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>{Math.round(percentage)}%</div>
                </div>
                <div className="stat-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-change" style={{ fontSize: '14px', color: '#64748b' }}>
                    <span className="stat-steps" style={{ color: '#4f46e5', fontWeight: 500 }}>{steps}</span> of 4 steps
                  </div>
                  <div className="stat-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px'
                  }}>
                    <i className="fas fa-tasks"></i>
                  </div>
                </div>
                <div className="progress-bar" style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '4px',
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              
              <div className="stat-card" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="stat-header" style={{ marginBottom: '15px' }}>
                  <div className="stat-title" style={{ fontSize: '16px', color: '#64748b', marginBottom: '5px' }}>Appointment</div>
                  <div className="stat-value" style={{ fontSize: '22px', fontWeight: 600, color: '#1e293b' }}>Not Scheduled</div>
                </div>
                <div className="stat-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-change locked" style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {userProfile?.quiz_passed === true ? (
                      <span style={{ color: '#10b981' }}>Ready to schedule</span>
                    ) : (
                      <>
                        <i className="fas fa-lock" style={{ marginRight: '5px' }}></i>
                        Locked
                      </>
                    )}
                  </div>
                  <div className="stat-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: userProfile?.quiz_passed === true ? 
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                      'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: userProfile?.quiz_passed === true ? 'white' : '#94a3b8',
                    fontSize: '18px'
                  }}>
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                </div>
              </div>
              
              <div className="stat-card" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="stat-header" style={{ marginBottom: '15px' }}>
                  <div className="stat-title" style={{ fontSize: '16px', color: '#64748b', marginBottom: '5px' }}>Your Status</div>
                  <div className="stat-value" style={{ fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>Applicant</div>
                </div>
                <div className="stat-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-change locked" style={{ fontSize: '14px', color: '#94a3b8' }}>
                    <i className="fas fa-lock" style={{ marginRight: '5px' }}></i>
                    Locked
                  </div>
                  <div className="stat-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '18px'
                  }}>
                    <i className="fas fa-user-tag"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="task-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '30px' }}>
              <div className="task-card" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
              }}>
                <div className="task-header" style={{
                  padding: '25px 25px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: trainingStatus.color === 'green' ? '#ecfdf5' : trainingStatus.color === 'red' ? '#fef2f2' : '#eff6ff',
                      color: trainingStatus.color === 'green' ? '#10b981' : trainingStatus.color === 'red' ? '#ef4444' : '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontSize: '16px',
                    }}>
                      <i className={`fas fa-${trainingStatus.btnIcon}`}></i>
                    </div>
                    Initial Training
                  </h3>
                  <span className={`task-status ${trainingStatus.status}`} style={{
                    padding: '5px 10px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: trainingStatus.color === 'green' ? '#ecfdf5' : trainingStatus.color === 'red' ? '#fef2f2' : '#eff6ff',
                    color: trainingStatus.color === 'green' ? '#10b981' : trainingStatus.color === 'red' ? '#ef4444' : '#3b82f6',
                  }}>
                    {trainingStatus.status === 'completed' ? 'Completed' : trainingStatus.status === 'failed' ? 'Failed' : 'Pending'}
                  </span>
                </div>
                <div className="task-body" style={{ padding: '20px 25px' }}>
                  <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
                    {trainingStatus.status === 'completed' ? (
                      'You have successfully completed your initial training! Now you can schedule your interview.'
                    ) : trainingStatus.status === 'failed' ? (
                      'Unfortunately, you did not pass the initial training quiz. Please contact support.'
                    ) : (
                      'Watch our training video and complete the quiz to proceed to the next step.'
                    )}
                  </p>
                  <button 
                    onClick={trainingStatus.canClick ? startTraining : undefined}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: trainingStatus.btnColor,
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: trainingStatus.canClick ? 'pointer' : 'default',
                      boxShadow: trainingStatus.btnShadow,
                      transition: 'all 0.3s',
                      opacity: trainingStatus.canClick ? 1 : 0.85,
                    }}
                    disabled={!trainingStatus.canClick}
                  >
                    <i className={`fas fa-${trainingStatus.btnIcon} mr-2`} style={{ marginRight: '8px' }}></i>
                    {trainingStatus.btnText}
                  </button>
                </div>
              </div>
              
              <div className="task-card locked" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                opacity: 0.7,
                pointerEvents: userProfile?.quiz_passed === true ? 'auto' : 'none',
              }}>
                <div className="task-header" style={{
                  padding: '25px 25px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: userProfile?.quiz_passed === true ? '#ecfdf5' : '#f1f5f9',
                      color: userProfile?.quiz_passed === true ? '#10b981' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontSize: '16px',
                    }}>
                      <i className="fas fa-video"></i>
                    </div>
                    Schedule Interview
                  </h3>
                  <span className="task-status pending" style={{
                    padding: '5px 10px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: userProfile?.quiz_passed === true ? '#ecfdf5' : '#f1f5f9',
                    color: userProfile?.quiz_passed === true ? '#10b981' : '#94a3b8',
                  }}>
                    {userProfile?.quiz_passed === true ? 'Ready' : 'Locked'}
                  </span>
                </div>
                <div className="task-body" style={{ padding: '20px 25px' }}>
                  <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
                    {userProfile?.quiz_passed === true ? 
                      'Now that you have completed the training, schedule your interview with our team.' :
                      'This step will be unlocked after completing your initial training.'
                    }
                  </p>
                  <button 
                    onClick={userProfile?.quiz_passed === true ? handleScheduleInterview : undefined}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: userProfile?.quiz_passed === true ? 
                        'linear-gradient(90deg, #10B981 0%, #059669 100%)' : 
                        'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: userProfile?.quiz_passed === true ? 'pointer' : 'default',
                      boxShadow: userProfile?.quiz_passed === true ? 
                        '0 4px 10px rgba(16,185,129,0.2)' : 
                        'none',
                      transition: 'all 0.3s',
                    }}
                    disabled={userProfile?.quiz_passed !== true}
                  >
                    <i className={`fas fa-${userProfile?.quiz_passed === true ? 'calendar-alt' : 'lock'} mr-2`} style={{ marginRight: '8px' }}></i>
                    {userProfile?.quiz_passed === true ? 'Schedule Now' : 'Locked'}
                  </button>
                </div>
                {userProfile?.quiz_passed !== true && (
                  <div className="task-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(241, 245, 249, 0.3)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 5,
                  }}>
                    <div style={{
                      fontSize: '24px',
                      color: '#94a3b8',
                    }}>
                      <i className="fas fa-lock"></i>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="task-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '30px' }}>
              <div className="task-card locked" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                opacity: 0.7,
                pointerEvents: 'none',
              }}>
                <div className="task-header" style={{
                  padding: '25px 25px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontSize: '16px',
                    }}>
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    Advanced Training
                  </h3>
                  <span className="task-status pending" style={{
                    padding: '5px 10px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#f1f5f9',
                    color: '#94a3b8',
                  }}>
                    Locked
                  </span>
                </div>
                <div className="task-body" style={{ padding: '20px 25px' }}>
                  <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
                    This advanced training will be unlocked after your interview is successfully completed.
                  </p>
                  <button 
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'default',
                      transition: 'all 0.3s',
                    }}
                    disabled={true}
                  >
                    <i className="fas fa-lock mr-2" style={{ marginRight: '8px' }}></i>
                    Locked
                  </button>
                </div>
                <div className="task-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(241, 245, 249, 0.3)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 5,
                }}>
                  <div style={{
                    fontSize: '24px',
                    color: '#94a3b8',
                  }}>
                    <i className="fas fa-lock"></i>
                  </div>
                </div>
              </div>
              
              <div className="task-card locked" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                opacity: 0.7,
                pointerEvents: 'none',
              }}>
                <div className="task-header" style={{
                  padding: '25px 25px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontSize: '16px',
                    }}>
                      <i className="fas fa-user-cog"></i>
                    </div>
                    Account Setup
                  </h3>
                  <span className="task-status pending" style={{
                    padding: '5px 10px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#f1f5f9',
                    color: '#94a3b8',
                  }}>
                    Locked
                  </span>
                </div>
                <div className="task-body" style={{ padding: '20px 25px' }}>
                  <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
                    Complete your account setup with payment information and profile settings.
                  </p>
                  <button 
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'default',
                      transition: 'all 0.3s',
                    }}
                    disabled={true}
                  >
                    <i className="fas fa-lock mr-2" style={{ marginRight: '8px' }}></i>
                    Locked
                  </button>
                </div>
                <div className="task-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(241, 245, 249, 0.3)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 5,
                }}>
                  <div style={{
                    fontSize: '24px',
                    color: '#94a3b8',
                  }}>
                    <i className="fas fa-lock"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <TrainingModal 
          isOpen={showTrainingModal}
          onClose={closeTrainingModal}
          onComplete={handleTrainingComplete}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
