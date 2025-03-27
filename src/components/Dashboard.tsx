
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  
  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile from user_profiles table
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', session.user.id)
          .single();
          
        if (data && !error) {
          const firstName = data.first_name || '';
          const lastName = data.last_name || '';
          setUserName(`${firstName} ${lastName}`.trim());
          setUserInitials(getInitials(firstName, lastName));
        } else if (session.user.user_metadata) {
          // Use metadata if profile not found
          const { first_name, last_name, name } = session.user.user_metadata;
          const firstName = first_name || (name ? name.split(' ')[0] : '');
          const lastName = last_name || (name && name.split(' ').length > 1 ? name.split(' ')[1] : '');
          setUserName(`${firstName} ${lastName}`.trim() || session.user.email?.split('@')[0] || 'User');
          setUserInitials(getInitials(firstName, lastName));
        } else {
          // Fallback to email
          setUserName(session.user.email?.split('@')[0] || 'User');
          setUserInitials(getInitials(session.user.email?.split('@')[0] || 'U', ''));
        }
      }
    };
    
    getProfile();
  }, []);
  
  const getInitials = (firstName: string, lastName: string): string => {
    const firstInitial = firstName ? firstName[0] : '';
    const lastInitial = lastName ? lastName[0] : '';
    
    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`.toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else {
      return 'U';
    }
  };
  
  useEffect(() => {
    // Modal functionality
    const modal = document.getElementById('trainingModal');
    const startButton = document.querySelector('.button-completed');
    const closeModal = document.querySelector('.close-modal');
    const beginTrainingBtn = document.querySelector('.start-training-btn');
    
    if (startButton && modal && closeModal && beginTrainingBtn) {
      startButton.addEventListener('click', function() {
        if (modal) {
          modal.style.display = 'flex';
          setTimeout(function() {
            modal.classList.add('show');
          }, 10);
        }
      });
      
      closeModal.addEventListener('click', function() {
        if (modal) {
          modal.classList.remove('show');
          setTimeout(function() {
            modal.style.display = 'none';
          }, 300);
        }
      });
      
      beginTrainingBtn.addEventListener('click', function() {
        // Simulate starting the first module
        const progressFill = document.querySelector('.module .progress-fill') as HTMLElement;
        const progressText = document.querySelector('.module .progress-bar + span') as HTMLElement;
        
        if (progressFill && progressText) {
          // Animate progress over 3 seconds
          let progress = 0;
          const interval = setInterval(function() {
            progress += 1;
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '% Complete';
            
            if (progress >= 100) {
              clearInterval(interval);
              beginTrainingBtn.textContent = 'Continue to Next Module';
              beginTrainingBtn.classList.add('next-module');
              
              // Unlock the second module
              const modules = document.querySelectorAll('.module');
              const moduleIcon = modules[1]?.querySelector('.module-icon i');
              const moduleProgress = modules[1]?.querySelector('.module-progress span');
              
              if (moduleIcon && moduleProgress) {
                moduleIcon.classList.remove('fa-lock');
                moduleIcon.classList.add('fa-play-circle');
                moduleProgress.textContent = 'Ready to Start';
              }
            }
          }, 30);
        }
      });
      
      // Close modal if clicked outside
      window.addEventListener('click', function(event) {
        if (event.target === modal) {
          modal.classList.remove('show');
          setTimeout(function() {
            modal.style.display = 'none';
          }, 300);
        }
      });
    }
  }, []);
  
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Main Content */}
      <div className="main-content flex-1 pt-20 pl-[240px]">
        {/* Header */}
        <div className="header flex justify-between items-center mb-[25px] px-[30px]">
          <div className="welcome text-[26px] font-semibold text-[#1e293b]">
            Thanks for signing up, <span className="text-[#4f46e5] relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[2px]">{userName.split(' ')[0]}</span>!
          </div>
          <div className="user-info flex items-center">
            <div className="action-buttons flex gap-[15px] mr-[20px]">
              <div className="action-button w-[42px] h-[42px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer relative text-[#64748b] transition-all duration-300">
                <i className="fas fa-search"></i>
              </div>
              <div className="action-button notification w-[42px] h-[42px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer relative text-[#64748b] transition-all duration-300 after:content-[''] after:absolute after:top-[10px] after:right-[10px] after:w-[8px] after:h-[8px] after:rounded-full after:bg-[#f56565] after:border-2 after:border-white">
                <i className="fas fa-bell"></i>
              </div>
              <div className="action-button w-[42px] h-[42px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer relative text-[#64748b] transition-all duration-300">
                <i className="fas fa-cog"></i>
              </div>
            </div>
            <div className="user-profile flex items-center bg-white py-[8px] pl-[8px] pr-[15px] rounded-[50px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300">
              <div className="user-avatar w-[36px] h-[36px] rounded-full mr-[10px] bg-gradient-to-br from-[#4f46e5] to-[#00c2cb] flex items-center justify-center text-white font-semibold text-[16px]">
                {userInitials}
              </div>
              <div className="user-name font-medium text-[#1e293b]">{userName}</div>
              <i className="fas fa-chevron-down dropdown-icon ml-[8px] text-[#64748b]"></i>
            </div>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="page-title flex items-center mb-[20px] px-[30px] relative">
          <h2 className="text-[24px] text-[#1e293b] flex items-center">
            <div className="page-title-icon mr-[12px] bg-gradient-to-br from-[#4f46e5] to-[#00c2cb] text-white w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[16px]">
              <i className="fas fa-clipboard-list"></i>
            </div>
            Onboarding Process
          </h2>
          <div className="page-subtitle text-[#64748b] ml-[15px] text-[14px] pl-[15px] border-l-2 border-[#e2e8f0]">Complete all steps to start earning</div>
        </div>
        
        {/* Stats Section */}
        <div className="stats grid grid-cols-4 gap-[25px] mb-[25px] px-[30px]">
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:rounded-bl-[70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-br from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-br after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-semibold">25%</h3>
              <p className="text-[#64748b] text-[14px] flex items-center"><i className="fas fa-arrow-up text-[#4f46e5] mr-[5px] text-[12px]"></i> Onboarding Progress</p>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:rounded-bl-[70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-br from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-br after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-semibold">1/4</h3>
              <p className="text-[#64748b] text-[14px] flex items-center"><i className="fas fa-check-circle text-[#4f46e5] mr-[5px] text-[12px]"></i> Steps Completed</p>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:rounded-bl-[70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-br from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-br after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-semibold">7 days</h3>
              <p className="text-[#64748b] text-[14px] flex items-center"><i className="fas fa-hourglass-half text-[#4f46e5] mr-[5px] text-[12px]"></i> Until Deadline</p>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-[16px] p-[25px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:right-0 before:w-[100px] before:h-[100px] before:bg-radial-gradient before:rounded-bl-[70%]">
            <div className="stat-icon w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mr-[20px] bg-gradient-to-br from-[rgba(79,70,229,0.1)] to-[rgba(0,194,203,0.1)] text-[#4f46e5] text-[24px] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-br after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[16px] after:opacity-20">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-info">
              <h3 className="text-[28px] text-[#1e293b] mb-[5px] font-semibold">-</h3>
              <p className="text-[#64748b] text-[14px] flex items-center"><i className="fas fa-trophy text-[#4f46e5] mr-[5px] text-[12px]"></i> Assessment Score</p>
            </div>
          </div>
        </div>
        
        {/* Action Cards Container */}
        <div className="action-cards-container mb-[20px] bg-white rounded-[20px] p-[25px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:right-0 before:w-[200px] before:h-[200px] before:bg-radial-gradient-light before:rounded-0 mx-[30px]">
          <div className="action-cards-header flex justify-between items-center mb-[20px] relative">
            <h2 className="text-[20px] text-[#1e293b] flex items-center">
              <div className="header-icon mr-[10px] bg-gradient-to-br from-[#4f46e5] to-[#00c2cb] text-white w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-[14px]">
                <i className="fas fa-tasks"></i>
              </div>
              Complete These Steps
            </h2>
            <div className="progress-indicator flex items-center bg-[rgba(226,232,240,0.5)] py-[8px] px-[15px] rounded-[50px]">
              <div className="progress-bar w-[150px] h-[8px] bg-[rgba(148,163,184,0.2)] rounded-[4px] mr-[15px] overflow-hidden relative">
                <div className="progress-fill h-full w-[25%] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] rounded-[4px] relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-[8px] after:h-full after:bg-white after:opacity-30 after:animate-pulse"></div>
              </div>
              <div className="progress-text text-[14px] text-[#64748b] font-medium flex items-center">
                <i className="fas fa-check-circle text-[#10B981] mr-[5px]"></i> 1 of 4 completed
              </div>
            </div>
          </div>
          
          {/* Action Cards */}
          <div className="action-cards grid grid-cols-4 gap-[25px] relative py-[20px]">
            {/* Step 1: Initial Training */}
            <div className="action-card bg-white rounded-[16px] py-[30px] px-[25px] flex flex-col items-center text-center border border-[#e2e8f0] shadow-[0_4px_15px_rgba(0,0,0,0.05)] relative z-[2] transition-all duration-300 h-full">
              <div className="step-number completed absolute top-[-18px] left-[50%] transform translate-x-[-50%] w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center font-semibold text-[16px] shadow-[0_4px_10px_rgba(16,185,129,0.3)] z-[3] border-[3px] border-white">1</div>
              <div className="action-icon completed w-[80px] h-[80px] rounded-full flex items-center justify-center mb-[15px] bg-gradient-to-br from-[#10B981] to-[#059669] text-white text-[30px] shadow-[0_8px_20px_rgba(16,185,129,0.2)] relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient-white">
                <i className="fas fa-book-reader"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-semibold">Initial Training</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
              <button className="card-button button-completed py-[12px] px-[24px] rounded-[12px] text-white border-none cursor-pointer font-medium transition-all duration-300 w-full flex items-center justify-center text-[14px] bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_10px_rgba(16,185,129,0.2)]">
                <i className="fas fa-play-circle mr-[8px] text-[16px]"></i> Start
              </button>
            </div>
            
            {/* Step 2: Interview - Locked */}
            <div className="action-card locked opacity-50 bg-[rgba(241,245,249,0.5)] rounded-[16px] py-[30px] px-[25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] filter grayscale-100 transform-none relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-[50%] transform translate-x-[-50%] w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-semibold text-[16px] z-[3] border-[3px] border-white">2</div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <i className="fas fa-lock"></i>
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full flex items-center justify-center mb-[15px] bg-gradient-to-br from-[#94A3B8] to-[#64748B] text-white text-[30px] relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient-white">
                <i className="fas fa-user-friends"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-semibold">Schedule Interview</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
              <button className="card-button button-locked py-[12px] px-[24px] rounded-[12px] text-white border-none cursor-not-allowed font-medium transition-all duration-300 w-full flex items-center justify-center text-[14px] bg-[#94A3B8] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
            
            {/* Step 3: Additional Training - Locked */}
            <div className="action-card locked opacity-50 bg-[rgba(241,245,249,0.5)] rounded-[16px] py-[30px] px-[25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] filter grayscale-100 transform-none relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-[50%] transform translate-x-[-50%] w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-semibold text-[16px] z-[3] border-[3px] border-white">3</div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <i className="fas fa-lock"></i>
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full flex items-center justify-center mb-[15px] bg-gradient-to-br from-[#94A3B8] to-[#64748B] text-white text-[30px] relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient-white">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-semibold">Additional Training</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">After your interview, complete additional training modules to refine your skills.</p>
              <button className="card-button button-locked py-[12px] px-[24px] rounded-[12px] text-white border-none cursor-not-allowed font-medium transition-all duration-300 w-full flex items-center justify-center text-[14px] bg-[#94A3B8] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
            
            {/* Step 4: Kickoff & Onboarding - Locked */}
            <div className="action-card locked opacity-50 bg-[rgba(241,245,249,0.5)] rounded-[16px] py-[30px] px-[25px] flex flex-col items-center text-center border border-dashed border-[#cbd5e1] filter grayscale-100 transform-none relative z-[2] h-full">
              <div className="step-number locked absolute top-[-18px] left-[50%] transform translate-x-[-50%] w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#94A3B8] to-[#64748B] text-white flex items-center justify-center font-semibold text-[16px] z-[3] border-[3px] border-white">4</div>
              <div className="lock-icon absolute top-[-12px] right-[-12px] w-[32px] h-[32px] rounded-full bg-[#94A3B8] text-white flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-[3] text-[14px]">
                <i className="fas fa-lock"></i>
              </div>
              <div className="action-icon locked w-[80px] h-[80px] rounded-full flex items-center justify-center mb-[15px] bg-gradient-to-br from-[#94A3B8] to-[#64748B] text-white text-[30px] relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-radial-gradient-white">
                <i className="fas fa-rocket"></i>
              </div>
              <h3 className="text-[18px] mb-[10px] text-[#1e293b] font-semibold">Kickoff & Setup</h3>
              <p className="text-[#64748b] text-[14px] mb-[25px] flex-grow leading-[1.6]">Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
              <button className="card-button button-locked py-[12px] px-[24px] rounded-[12px] text-white border-none cursor-not-allowed font-medium transition-all duration-300 w-full flex items-center justify-center text-[14px] bg-[#94A3B8] opacity-70">
                <i className="fas fa-lock mr-[8px] text-[16px]"></i> Locked
              </button>
            </div>
          </div>
        </div>
        
        {/* Training Modal */}
        <div id="trainingModal" className="modal fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] z-[1000] hidden justify-center items-center opacity-0 transition-opacity duration-300">
          <div className="modal-content bg-white w-full max-w-[600px] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] overflow-hidden transform translate-y-[20px] transition-transform duration-300">
            <div className="modal-header py-[20px] px-[25px] border-b border-[#eaeaea] flex justify-between items-center bg-gradient-to-r from-[#4169E1] to-[#00CED1] text-white">
              <h2 className="text-[20px] font-semibold m-0 flex items-center"><i className="fas fa-book-reader mr-[10px]"></i> Initial Training</h2>
              <span className="close-modal text-[24px] cursor-pointer text-white opacity-80 transition-opacity duration-300 hover:opacity-100">&times;</span>
            </div>
            <div className="modal-body p-[30px]">
              <div className="modal-icon w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#4169E1] to-[#00CED1] text-white flex items-center justify-center text-[32px] mx-auto mb-[25px] shadow-[0_8px_20px_rgba(65,105,225,0.3)]">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-[22px] font-semibold text-[#1e293b] text-center mb-[15px]">Welcome to ApoLead Training!</h3>
              <p className="text-[#64748b] text-center mb-[15px] leading-[1.6]">This training module will teach you the fundamentals needed to get started. It should take approximately 45-60 minutes to complete.</p>
              <p className="text-[#64748b] text-center mb-[15px] leading-[1.6]">Once completed, you'll be able to proceed to the next steps in your onboarding journey.</p>
              <div className="training-modules my-[30px]">
                <div className="module flex items-center py-[15px] px-[20px] rounded-[12px] bg-[#f8fafc] mb-[15px] border border-[#eaeaea] transition-all duration-300 hover:bg-[#f1f5f9] hover:transform hover:translate-y-[-3px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                  <div className="module-icon w-[40px] h-[40px] rounded-full bg-[#4169E1] text-white flex items-center justify-center text-[16px] mr-[15px] flex-shrink-0 shadow-[0_4px_8px_rgba(65,105,225,0.2)]">
                    <i className="fas fa-play-circle"></i>
                  </div>
                  <div className="module-info flex-grow">
                    <h4 className="text-[16px] font-medium text-[#1e293b] mb-[5px]">Introduction to ApoLead</h4>
                    <div className="module-progress flex items-center">
                      <div className="progress-bar w-[120px] h-[6px] bg-[rgba(148,163,184,0.2)] rounded-[3px] mr-[10px] overflow-hidden">
                        <div className="progress-fill h-full bg-gradient-to-r from-[#4169E1] to-[#00CED1] w-[0%] transition-[width] duration-300"></div>
                      </div>
                      <span className="text-[12px] text-[#64748b]">0% Complete</span>
                    </div>
                  </div>
                </div>
                <div className="module flex items-center py-[15px] px-[20px] rounded-[12px] bg-[#f8fafc] mb-[15px] border border-[#eaeaea] transition-all duration-300 hover:bg-[#f1f5f9] hover:transform hover:translate-y-[-3px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                  <div className="module-icon w-[40px] h-[40px] rounded-full bg-[#4169E1] text-white flex items-center justify-center text-[16px] mr-[15px] flex-shrink-0 shadow-[0_4px_8px_rgba(65,105,225,0.2)]">
                    <i className="fas fa-lock"></i>
                  </div>
                  <div className="module-info flex-grow">
                    <h4 className="text-[16px] font-medium text-[#1e293b] mb-[5px]">Core Principles</h4>
                    <div className="module-progress flex items-center">
                      <span className="text-[12px] text-[#64748b]">Locked</span>
                    </div>
                  </div>
                </div>
                <div className="module flex items-center py-[15px] px-[20px] rounded-[12px] bg-[#f8fafc] mb-[15px] border border-[#eaeaea] transition-all duration-300 hover:bg-[#f1f5f9] hover:transform hover:translate-y-[-3px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                  <div className="module-icon w-[40px] h-[40px] rounded-full bg-[#4169E1] text-white flex items-center justify-center text-[16px] mr-[15px] flex-shrink-0 shadow-[0_4px_8px_rgba(65,105,225,0.2)]">
                    <i className="fas fa-lock"></i>
                  </div>
                  <div className="module-info flex-grow">
                    <h4 className="text-[16px] font-medium text-[#1e293b] mb-[5px]">Best Practices</h4>
                    <div className="module-progress flex items-center">
                      <span className="text-[12px] text-[#64748b]">Locked</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="start-training-btn block w-full py-[14px] bg-gradient-to-r from-[#4169E1] to-[#00CED1] text-white border-none rounded-[12px] font-medium text-[16px] cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(65,105,225,0.3)] hover:transform hover:translate-y-[-3px] hover:shadow-[0_8px_25px_rgba(65,105,225,0.4)]">Begin Training</button>
            </div>
          </div>
        </div>
        
        {/* Add custom keyframes for animations */}
        <style>
          {`
          @keyframes pulse {
            0% { opacity: 0.3; }
            50% { opacity: 0.6; }
            100% { opacity: 0.3; }
          }
          
          .bg-radial-gradient::before {
            background: radial-gradient(circle, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0) 70%);
          }
          
          .bg-radial-gradient-light::before {
            background: radial-gradient(circle, rgba(79,70,229,0.05) 0%, rgba(79,70,229,0) 70%);
          }
          
          .bg-radial-gradient-white::before {
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%);
          }
          
          .animate-pulse::after {
            animation: pulse 1.5s infinite;
          }
          `}
        </style>
      </div>
      
      {/* Add Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    </div>
  );
};

export default Dashboard;
