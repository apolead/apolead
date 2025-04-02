
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Loader2 } from 'lucide-react';
import TrainingModal from '@/components/training/TrainingModal';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  const handleOpenTrainingModal = () => {
    if (!userProfile?.eligible_for_training && !userProfile?.onboarding_completed) {
      toast({
        title: "Onboarding Required",
        description: "You must complete your onboarding process first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTrainingModalOpen(true);
  };
  
  const handleCloseTrainingModal = () => {
    setIsTrainingModalOpen(false);
  };
  
  const handleTrainingComplete = (passed: boolean) => {
    console.log("Training completed, passed:", passed);
    // The modal will handle updating the user profile
  };
  
  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }
  
  // Compute step completion statuses
  const isStep1Complete = userProfile.onboarding_completed === true;
  const isStep2Available = isStep1Complete && (userProfile.eligible_for_training === true);
  const isStep2Complete = userProfile.quiz_passed === true;
  const isStep3Available = isStep2Complete;
  const isStep3Complete = false; // Assuming interview completion is not tracked yet
  const isStep4Available = isStep3Complete;
  const isStep4Complete = false;
  const isStep5Available = isStep4Complete;
  
  // Calculate progress percentage
  const totalSteps = 5;
  let completedSteps = 0;
  if (isStep1Complete) completedSteps++;
  if (isStep2Complete) completedSteps++;
  if (isStep3Complete) completedSteps++;
  if (isStep4Complete) completedSteps++;
  if (isStep5Available) completedSteps++;
  
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  return (
    <DashboardShell>
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="welcome">Thanks for signing up, <span>{userProfile.first_name || 'User'}</span>!</div>
          <div className="user-info">
            <div className="action-buttons">
              <div className="action-button">
                <i className="fas fa-search"></i>
              </div>
              <div className="action-button notification">
                <i className="fas fa-bell"></i>
              </div>
              <div className="action-button">
                <i className="fas fa-cog"></i>
              </div>
            </div>
            <div className="user-profile">
              <div className="user-avatar">
                {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
              </div>
              <div className="user-name">{userProfile.first_name} {userProfile.last_name}</div>
              <i className="fas fa-chevron-down dropdown-icon"></i>
            </div>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="page-title">
          <h2>
            <div className="page-title-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            Onboarding Process
          </h2>
          <div className="page-subtitle">Complete all steps to start earning</div>
        </div>
        
        {/* Stats Section */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-info">
              <h3>{progressPercentage.toFixed(0)}%</h3>
              <p><i className="fas fa-arrow-up"></i> Onboarding Progress</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-info">
              <h3>{completedSteps}/{totalSteps}</h3>
              <p><i className="fas fa-check-circle"></i> Steps Completed</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-info">
              <h3>7 days</h3>
              <p><i className="fas fa-hourglass-half"></i> Until Deadline</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-info">
              <h3>{userProfile.quiz_score || '-'}</h3>
              <p><i className="fas fa-trophy"></i> Assessment Score</p>
            </div>
          </div>
        </div>
        
        {/* Action Cards Container */}
        <div className="action-cards-container">
          <div className="action-cards-header">
            <h2>
              <div className="header-icon">
                <i className="fas fa-tasks"></i>
              </div>
              Complete These Steps
            </h2>
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="progress-text">
                <i className="fas fa-check-circle"></i> {completedSteps} of {totalSteps} completed
              </div>
            </div>
          </div>
          
          {/* Action Cards */}
          <div className="action-cards">
            {/* Step 1: Initial Onboarding */}
            <div className={`action-card ${isStep1Complete ? 'completed' : userProfile.application_status === 'rejected' ? 'rejected' : ''}`}>
              <div className={`step-number ${isStep1Complete ? 'completed' : userProfile.application_status === 'rejected' ? 'rejected' : ''}`}>1</div>
              <div className={`action-icon ${isStep1Complete ? 'completed' : userProfile.application_status === 'rejected' ? 'rejected' : ''}`}>
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>Initial Onboarding</h3>
              <p>Complete your profile setup and account verification to get started with ApoLead.</p>
              <button 
                className={`card-button ${
                  isStep1Complete 
                    ? 'button-completed' 
                    : userProfile.application_status === 'rejected' 
                      ? 'button-rejected' 
                      : ''
                }`}
                onClick={() => navigate('/onboarding')}
              >
                {isStep1Complete 
                  ? <><i className="fas fa-check-circle"></i> Completed</>
                  : userProfile.application_status === 'rejected'
                    ? <><i className="fas fa-times-circle"></i> Not Eligible</>
                    : 'Complete Now'
                }
              </button>
            </div>
            
            {/* Step 2: Initial Training */}
            <div className={`action-card ${!isStep2Available ? 'locked' : isStep2Complete ? 'completed' : ''}`}>
              <div className={`step-number ${!isStep2Available ? 'locked' : isStep2Complete ? 'completed' : ''}`}>2</div>
              {!isStep2Available && (
                <div className="lock-icon">
                  <i className="fas fa-lock"></i>
                </div>
              )}
              <div className={`action-icon ${!isStep2Available ? 'locked' : isStep2Complete ? 'completed' : ''}`}>
                <i className="fas fa-book-reader"></i>
              </div>
              <h3>Initial Training</h3>
              <p>Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
              <button 
                className={`card-button ${
                  !isStep2Available 
                    ? 'button-locked' 
                    : isStep2Complete 
                      ? 'button-completed' 
                      : ''
                }`}
                onClick={handleOpenTrainingModal}
                disabled={!isStep2Available}
                id="trainingButton"
              >
                {!isStep2Available 
                  ? <><i className="fas fa-lock"></i> Locked</>
                  : isStep2Complete
                    ? <><i className="fas fa-check-circle"></i> Completed</>
                    : 'Start Training'
                }
              </button>
            </div>
            
            {/* Step 3: Interview */}
            <div className={`action-card ${!isStep3Available ? 'locked' : isStep3Complete ? 'completed' : ''}`}>
              <div className={`step-number ${!isStep3Available ? 'locked' : isStep3Complete ? 'completed' : ''}`}>3</div>
              {!isStep3Available && (
                <div className="lock-icon">
                  <i className="fas fa-lock"></i>
                </div>
              )}
              <div className={`action-icon ${!isStep3Available ? 'locked' : isStep3Complete ? 'completed' : ''}`}>
                <i className="fas fa-user-friends"></i>
              </div>
              <h3>Schedule Interview</h3>
              <p>Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              <button 
                className={`card-button ${
                  !isStep3Available 
                    ? 'button-locked' 
                    : isStep3Complete 
                      ? 'button-completed' 
                      : ''
                }`}
                disabled={!isStep3Available}
              >
                {!isStep3Available 
                  ? <><i className="fas fa-lock"></i> Locked</>
                  : isStep3Complete
                    ? <><i className="fas fa-check-circle"></i> Completed</>
                    : 'Schedule Now'
                }
              </button>
            </div>
            
            {/* Step 4: Additional Training */}
            <div className={`action-card ${!isStep4Available ? 'locked' : isStep4Complete ? 'completed' : ''}`}>
              <div className={`step-number ${!isStep4Available ? 'locked' : isStep4Complete ? 'completed' : ''}`}>4</div>
              {!isStep4Available && (
                <div className="lock-icon">
                  <i className="fas fa-lock"></i>
                </div>
              )}
              <div className={`action-icon ${!isStep4Available ? 'locked' : isStep4Complete ? 'completed' : ''}`}>
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>Additional Training</h3>
              <p>After your interview, complete additional training modules to refine your skills.</p>
              <button 
                className={`card-button ${
                  !isStep4Available 
                    ? 'button-locked' 
                    : isStep4Complete 
                      ? 'button-completed' 
                      : ''
                }`}
                disabled={!isStep4Available}
              >
                {!isStep4Available 
                  ? <><i className="fas fa-lock"></i> Locked</>
                  : isStep4Complete
                    ? <><i className="fas fa-check-circle"></i> Completed</>
                    : 'Start Training'
                }
              </button>
            </div>
            
            {/* Step 5: Kickoff & Setup */}
            <div className={`action-card ${!isStep5Available ? 'locked' : ''}`}>
              <div className={`step-number ${!isStep5Available ? 'locked' : ''}`}>5</div>
              {!isStep5Available && (
                <div className="lock-icon">
                  <i className="fas fa-lock"></i>
                </div>
              )}
              <div className={`action-icon ${!isStep5Available ? 'locked' : ''}`}>
                <i className="fas fa-rocket"></i>
              </div>
              <h3>Kickoff & Setup</h3>
              <p>Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              <button 
                className={`card-button ${!isStep5Available ? 'button-locked' : ''}`}
                disabled={!isStep5Available}
              >
                {!isStep5Available 
                  ? <><i className="fas fa-lock"></i> Locked</>
                  : 'Get Started'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Training Modal */}
      <TrainingModal 
        isOpen={isTrainingModalOpen}
        onClose={handleCloseTrainingModal}
        onComplete={handleTrainingComplete}
      />
    </DashboardShell>
  );
};

export default Dashboard;
