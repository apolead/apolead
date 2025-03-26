import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  PieChart, 
  Wrench, 
  CreditCard, 
  BarChart2, 
  Trophy, 
  FileText, 
  Settings, 
  LogOut,
  HelpCircle 
} from 'lucide-react';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('agent');
  const [currentStep, setCurrentStep] = useState(0);
  const [showSupportFAQ, setShowSupportFAQ] = useState(false);
  const trainingModalRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const beginTrainingBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error loading profile",
            description: "Unable to load your profile data.",
            variant: "destructive",
          });
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching role:', roleError);
        } else if (roleData) {
          setRole(roleData.role);
        }

        const { data: progressData, error: progressError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!progressError && progressData) {
          let step = 0;
          if (progressData.welcome_completed) step = 1;
          if (progressData.training_completed) step = 2;
          if (progressData.interview_scheduled) step = 3;
          if (progressData.final_quiz_passed) step = 4;
          
          setCurrentStep(step);
        } else {
          const { error: insertError } = await supabase
            .from('user_onboarding')
            .insert({
              user_id: user.id,
              welcome_completed: false,
              training_completed: false,
              interview_scheduled: false,
              final_quiz_passed: false,
              quiz_score: 0
            });

          if (insertError) {
            console.error('Error creating onboarding record:', insertError);
          }
        }

        setUserProfile({
          ...profileData,
          email: user.email,
          id: user.id
        });
      } catch (error) {
        console.error('Error in dashboard:', error);
        toast({
          title: "Error",
          description: "There was a problem loading the dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  const openTrainingModal = () => {
    if (trainingModalRef.current) {
      trainingModalRef.current.style.display = 'flex';
      setTimeout(() => {
        if (trainingModalRef.current) {
          trainingModalRef.current.classList.add('show');
        }
      }, 10);
    }
    
    if (currentStep === 0 && userProfile) {
      completeWelcomeStep();
    }
  };

  const closeTrainingModal = () => {
    if (trainingModalRef.current) {
      trainingModalRef.current.classList.remove('show');
      setTimeout(() => {
        if (trainingModalRef.current) {
          trainingModalRef.current.style.display = 'none';
        }
      }, 300);
    }
  };

  const toggleSupportFAQ = () => {
    setShowSupportFAQ(!showSupportFAQ);
  };

  const completeWelcomeStep = async () => {
    if (!userProfile) return;
    
    const { error } = await supabase
      .from('user_onboarding')
      .update({ welcome_completed: true })
      .eq('user_id', userProfile.id);
      
    if (!error) {
      setCurrentStep(1);
    } else {
      console.error('Error updating onboarding progress:', error);
    }
  };

  const beginTraining = () => {
    if (!progressFillRef.current || !progressTextRef.current || !beginTrainingBtnRef.current) return;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${progress}%`;
      }
      
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${progress}% Complete`;
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        
        if (beginTrainingBtnRef.current) {
          beginTrainingBtnRef.current.textContent = 'Continue to Next Module';
          beginTrainingBtnRef.current.classList.add('next-module');
        }
        
        const modules = document.querySelectorAll('.module');
        const secondModule = modules[1];
        if (secondModule) {
          const icon = secondModule.querySelector('.module-icon i');
          const span = secondModule.querySelector('.module-progress span');
          
          if (icon) {
            icon.classList.remove('fa-lock');
            icon.classList.add('fa-play-circle');
          }
          
          if (span) {
            span.textContent = 'Ready to Start';
          }
        }
      }
    }, 30);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getUserInitials = () => {
    if (!userProfile) return '';
    
    const firstName = userProfile.first_name || '';
    const lastName = userProfile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Poppins', sans-serif;
          }
          
          body {
              display: flex;
              min-height: 100vh;
              background-color: #f8fafc;
          }
          
          /* Sidebar Styles */
          .sidebar {
              width: 240px;
              background-color: white;
              border-right: 1px solid #eaeaea;
              padding: 25px 0;
              display: flex;
              flex-direction: column;
              box-shadow: 0 0 20px rgba(0,0,0,0.05);
              transition: all 0.3s ease;
              position: relative;
              z-index: 10;
              text-align: left;
              box-sizing: border-box;
          }
          
          .sidebar.collapsed {
              width: 60px !important;
              text-align: center !important;
              overflow: visible !important;
          }
          
          .logo {
              padding: 0 25px 25px;
              border-bottom: 1px solid #eaeaea;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              overflow: hidden;
          }
          
          .logo h1 {
              font-size: 28px;
              font-weight: 700;
              transition: opacity 0.3s;
          }
          
          .sidebar.collapsed .logo h1 {
              opacity: 0;
              position: absolute;
              left: -9999px;
              width: 0;
              height: 0;
              overflow: hidden;
              visibility: hidden;
          }
          
          .sidebar.collapsed .logo {
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              padding: 25px 0 25px 0 !important;
              width: 100% !important;
              text-align: center !important;
              margin: 0 auto !important;
              position: relative !important;
              overflow: visible !important;
          }
          
          .sidebar.collapsed .toggle-btn {
              position: absolute !important;
              right: -10px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              background-color: white !important;
              box-shadow: 0 0 5px rgba(0,0,0,0.1) !important;
              border-radius: 50% !important;
              width: 20px !important;
              height: 20px !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              font-size: 10px !important;
              z-index: 999 !important;
              border: 1px solid #eaeaea !important;
          }
          
          .toggle-btn {
              cursor: pointer;
              font-size: 12px;
              color: #64748b;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              transition: all 0.3s;
              position: relative;
              z-index: 20;
          }
          
          .toggle-btn:hover {
              color: #4f46e5;
          }
          
          .sidebar.collapsed .toggle-btn {
              position: absolute !important;
              right: -15px !important;
              top: 20px !important;
              background-color: white !important;
              box-shadow: 0 0 8px rgba(0,0,0,0.1) !important;
              border-radius: 50% !important;
              width: 30px !important;
              height: 30px !important;
          }
          
          .logo span:first-child {
              color: #00c2cb;
          }
          
          .logo span:last-child {
              color: #4f46e5;
          }
          
          .nav-menu {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              padding: 0 15px;
              overflow-x: hidden;
          }
          
          .sidebar.collapsed .nav-menu {
              padding: 0 !important;
              align-items: center !important;
          }
          
          .sidebar.collapsed .nav-menu {
              padding: 0 !important;
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: flex-start !important;
          }
          
          .nav-item {
              display: flex;
              align-items: center;
              padding: 12px 20px;
              color: #64748b;
              text-decoration: none;
              transition: all 0.3s;
              margin-bottom: 8px;
              border-radius: 10px;
              width: 100%;
              white-space: nowrap;
              position: relative;
              box-sizing: border-box;
          }
          
          .nav-item.locked {
              cursor: not-allowed;
          }
          
          .nav-item.locked:hover {
              background-color: rgba(148, 163, 184, 0.2);
              color: #94A3B8;
              position: relative;
          }
          
          .nav-item.locked:hover i:not(.menu-lock-icon),
          .nav-item.locked:hover span {
              opacity: 0.5;
          }
          
          .nav-item.locked:hover .menu-lock-icon {
              color: #64748B;
              font-size: 20px;
              text-shadow: 0 0 5px rgba(255,255,255,0.8);
          }
          
          .sidebar.collapsed .nav-item {
              padding: 12px 0 !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              width: 100% !important;
              text-align: center !important;
              overflow: hidden !important;
          }
          
          .nav-item:hover, .nav-item.active {
              background-color: rgba(79, 70, 229, 0.08);
              color: #4f46e5;
          }
          
          .nav-item.active {
              background-color: rgba(79, 70, 229, 0.1);
              font-weight: 500;
          }
          
          .nav-item i, .nav-item svg {
              margin-right: 18px;
              font-size: 18px;
              width: 24px;
              text-align: center;
              flex-shrink: 0;
          }
          
          .sidebar.collapsed .nav-item i, .sidebar.collapsed .nav-item svg {
              margin-right: 0;
          }
          
          .sidebar.collapsed .nav-item span {
              display: none !important;
              opacity: 0;
              visibility: hidden;
              width: 0;
              height: 0;
              overflow: hidden;
          }
          
          .sidebar.collapsed .menu-lock-icon {
              left: 50%;
              transform: translate(-50%, -50%);
          }
          
          .nav-divider {
              height: 1px;
              background-color: #eaeaea;
              margin: 15px 10px 15px;
              width: calc(100% - 20px);
          }
          
          .sidebar-footer {
              padding: 20px 25px;
              border-top: 1px solid #eaeaea;
              color: #64748b;
              font-size: 14px;
              transition: opacity 0.3s;
              cursor: pointer;
          }
          
          .sidebar.collapsed .sidebar-footer {
              opacity: 0;
              visibility: hidden;
              height: 0;
              padding: 0;
              border: none;
          }
          
          .sidebar-footer a {
              color: #4f46e5;
              text-decoration: none;
          }
          
          /* Main Content */
          .main-content {
              flex: 1;
              padding: 30px 40px;
          }
          
          .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 40px;
          }
          
          .welcome {
              font-size: 26px;
              font-weight: 600;
              color: #1e293b;
          }
          
          .welcome span {
              color: #4f46e5;
              position: relative;
          }
          
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
          
          .user-info {
              display: flex;
              align-items: center;
          }
          
          .action-buttons {
              display: flex;
              gap: 15px;
              margin-right: 20px;
          }
          
          .action-button {
              width: 42px;
              height: 42px;
              border-radius: 12px;
              background-color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
              cursor: pointer;
              position: relative;
              color: #64748b;
              transition: all 0.3s;
          }
          
          .action-button:hover {
              transform: translateY(-3px);
              box-shadow: 0 6px 15px rgba(0,0,0,0.1);
              color: #4f46e5;
          }
          
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
          
          .user-profile {
              display: flex;
              align-items: center;
              background: white;
              padding: 8px 15px 8px 8px;
              border-radius: 50px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
              cursor: pointer;
              transition: all 0.3s;
          }
          
          .user-profile:hover {
              box-shadow: 0 6px 15px rgba(0,0,0,0.1);
              transform: translateY(-3px);
          }
          
          .user-avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              margin-right: 10px;
              background: linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              font-size: 16px;
          }
          
          .user-name {
              font-weight: 500;
              color: #1e293b;
          }
          
          .dropdown-icon {
              margin-left: 8px;
              color: #64748b;
          }
          
          /* Page Title */
          .page-title {
              display: flex;
              align-items: center;
              margin-bottom: 30px;
              position: relative;
          }
          
          .page-title h2 {
              font-size: 24px;
              color: #1e293b;
              display: flex;
              align-items: center;
          }
          
          .page-title-icon {
              margin-right: 12px;
              background: linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%);
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
          }
          
          .page-subtitle {
              color: #64748b;
              margin-left: 15px;
              font-size: 14px;
              padding-left: 15px;
              border-left: 2px solid #e2e8f0;
          }
          
          /* Stats Section */
          .stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 25px;
              margin-bottom: 40px;
          }
          
          .stat-card {
              background-color: white;
              border-radius: 16px;
              padding: 25px;
              display: flex;
              align-items: center;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
          }
          
          .stat-card::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 100px;
              height: 100px;
              background: radial-gradient(circle, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0) 70%);
              border-radius: 0 0 0 70%;
          }
          
          .stat-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .stat-icon {
              width: 60px;
              height: 60px;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 20px;
              background: linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(0,194,203,0.1) 100%);
              color: #4f46e5;
              font-size: 24px;
              position: relative;
          }
          
          .stat-icon::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%);
              border-radius: 16px;
              opacity: 0.2;
          }
          
          .stat-info h3 {
              font-size: 28px;
              color: #1e293b;
              margin-bottom: 5px;
              font-weight: 600;
          }
          
          .stat-info p {
              color: #64748b;
              font-size: 14px;
              display: flex;
              align-items: center;
          }
          
          .stat-info p i {
              color: #4f46e5;
              margin-right: 5px;
              font-size: 12px;
          }
          
          /* Action Cards */
          .action-cards-container {
              margin-bottom: 40px;
              background: white;
              border-radius: 20px;
              padding: 30px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              position: relative;
              overflow: hidden;
          }
          
          .action-cards-container::before {
              content: '';
              position: absolute;
              bottom: 0;
              right: 0;
              width: 200px;
              height: 200px;
              background: radial-gradient(circle, rgba(79,70,229,0.05) 0%, rgba(79,70,229,0) 70%);
              border-radius: 0;
          }
          
          .action-cards-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              position: relative;
          }
          
          .action-cards-header h2 {
              font-size: 20px;
              color: #1e293b;
              display: flex;
              align-items: center;
          }
          
          .header-icon {
              margin-right: 10px;
              background: linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%);
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
          }
          
          .progress-indicator {
              display: flex;
              align-items: center;
              background: rgba(226, 232, 240, 0.5);
              padding: 8px 15px;
              border-radius: 50px;
          }
          
          .progress-bar {
              width: 150px;
              height: 8px;
              background-color: rgba(148, 163, 184, 0.2);
              border-radius: 4px;
              margin-right: 15px;
              overflow: hidden;
              position: relative;
          }
          
          .progress-fill {
              height: 100%;
              width: 0%;
              background: linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%);
              border-radius: 4px;
              position: relative;
          }
          
          .progress-fill::after {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 8px;
              height: 100%;
              background: white;
              opacity: 0.3;
              animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
              0% { opacity: 0.3; }
              50% { opacity: 0.6; }
              100% { opacity: 0.3; }
          }
          
          .progress-text {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
              display: flex;
              align-items: center;
          }
          
          .progress-text i {
              color: #10B981;
              margin-right: 5px;
          }
          
          .action-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 25px;
              position: relative;
              padding-top: 20px;
              padding-bottom: 20px;
          }
          
          .action-card {
              background-color: white;
              border-radius: 16px;
              padding: 30px 25px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              position: relative;
              z-index: 2;
              transition: all 0.3s ease;
              height: 100%;
          }
          
          .action-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 15px 30px rgba(0,0,0,0.1);
          }
          
          .action-card.locked {
              opacity: 0.5;
              background-color: rgba(241, 245, 249, 0.5);
              box-shadow: none;
              filter: grayscale(100%);
              transform: none;
              border: 1px dashed #cbd5e1;
          }
          
          .action-card.locked:hover {
              transform: none;
              box-shadow: none;
          }
          
          .step-number {
              position: absolute;
              top: -18px;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 10px rgba(79,70,229,0.3);
              z-index: 3;
              border: 3px solid white;
          }
          
          .step-number.completed {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              box-shadow: 0 4px 10px rgba(16,185,129,0.3);
          }
          
          .step-number.locked {
              background: linear-gradient(135deg, #94A3B8 0%, #64748B 100%);
              box-shadow: none;
          }
          
          .action-icon {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 25px;
              background: linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%);
              color: white;
              font-size: 30px;
              box-shadow: 0 8px 20px rgba(79,70,229,0.2);
              position: relative;
              overflow: hidden;
          }
          
          .action-icon::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%);
          }
          
          .action-icon.completed {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              box-shadow: 0 8px 20px rgba(16,185,129,0.2);
          }
          
          .action-icon.locked {
              background: linear-gradient(135deg, #94A3B8 0%, #64748B 100%);
              box-shadow: none;
          }
          
          .action-card h3 {
              font-size: 18px;
              margin-bottom: 15px;
              color: #1e293b;
              font-weight: 600;
          }
          
          .action-card p {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 25px;
              flex-grow: 1;
              line-height: 1.6;
          }
          
          .card-button {
              padding: 12px 24px;
              border-radius: 12px;
              color: white;
              border: none;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.3s;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
          }
          
          .card-button i {
              margin-right: 8px;
              font-size: 16px;
          }
          
          .button-completed {
              background: linear-gradient(90deg, #10B981 0%, #059669 100%);
              box-shadow: 0 4px 10px rgba(16,185,129,0.2);
          }
          
          .button-completed:hover {
              transform: translateY(-3px);
              box-shadow: 0 6px 15px rgba(16,185,129,0.3);
          }
          
          .button-current {
              background: linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%);
              box-shadow: 0 4px 10px rgba(79,70,229,0.2);
          }
          
          .button-current:hover {
              transform: translateY(-3px);
              box-shadow: 0 6px 15px rgba(79,70,229,0.3);
          }
          
          .button-locked {
              background: #94A3B8;
              opacity: 0.7;
              cursor: not-allowed;
          }
          
          /* Lock Icon */
          .lock-icon {
              position: absolute;
              top: -12px;
              right: -12px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #94A3B8;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              z-index: 3;
              font-size: 14px;
          }
          
          /* Menu Lock Icon - Only shows on hover */
          .menu-lock-icon {
              display: none !important;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              color: #94A3B8;
              font-size: 18px;
              z-index: 5;
          }
          
          .nav-item.locked:hover .menu-lock-icon {
              display: block !important;
          }
          
          .sidebar.collapsed .menu-lock-icon {
              left: 50%;
              transform: translate(-50%, -50%);
          }
          
          /* Info Cards - Remove from layout */
          .info-cards {
              display: none;
          }
          
          /* Adjust main content padding for better vertical fit */
          .main-content {
              flex: 1;
              padding: 20px 30px;
          }
          
          /* Reduce top margin on header */
          .header {
              margin-bottom: 25px;
          }
          
          /* Reduce space between sections */
          .stats {
              margin-bottom: 25px;
          }
          
          .page-title {
              margin-bottom: 20px;
          }
          
          /* Make action cards container more compact */
          .action-cards-container {
              margin-bottom: 20px;
              padding: 25px;
          }
          
          .action-cards-header {
              margin-bottom: 20px;
          }
          
          /* Adjust vertical spacing in cards */
          .action-icon {
              margin-bottom: 15px;
          }
          
          .action-card h3 {
              margin-bottom: 10px;
          }
          
          /* Modal Styles */
          .modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              justify-content: center;
              align-items: center;
              opacity: 0;
              transition: opacity 0.3s ease;
          }
          
          .modal.show {
              opacity: 1;
          }
          
          .modal-content {
              background-color: white;
              width: 100%;
              max-width: 600px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              overflow: hidden;
              transform: translateY(20px);
              transition: transform 0.3s ease;
          }
          
          .modal.show .modal-content {
              transform: translateY(0);
          }
          
          .modal-header {
              padding: 20px 25px;
              border-bottom: 1px solid #eaeaea;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: linear-gradient(to right, #4169E1, #00CED1);
              color: white;
          }
          
          .modal-header h2 {
              font-size: 20px;
              font-weight: 600;
              margin: 0;
              display: flex;
              align-items: center;
          }
          
          .modal-header h2 i {
              margin-right: 10px;
          }
          
          .close-modal {
              font-size: 24px;
              cursor: pointer;
              color: white;
              opacity: 0.8;
              transition: opacity 0.3s;
          }
          
          .close-modal:hover {
              opacity: 1;
          }
          
          .modal-body {
              padding: 30px;
          }
          
          .modal-icon {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4169E1, #00CED1);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              margin: 0 auto 25px;
              box-shadow: 0 8px 20px rgba(65, 105, 225, 0.3);
          }
          
          .modal-body h3 {
              font-size: 22px;
              font-weight: 600;
              color: #1e293b;
              text-align: center;
              margin-bottom: 15px;
          }
          
          .modal-body p {
              color: #64748b;
              text-align: center;
              margin-bottom: 15px;
              line-height: 1.6;
          }
          
          .training-modules {
              margin: 30px 0;
          }
          
          .module {
              display: flex;
              align-items: center;
              padding: 15px 20px;
              border-radius: 12px;
              background-color: #f8fafc;
              margin-bottom: 15px;
              border: 1px solid #eaeaea;
              transition: all 0.3s;
          }
          
          .module:hover {
              background-color: #f1f5f9;
              transform: translateY(-3px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          }
          
          .module-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #4169E1;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              margin-right: 15px;
              flex-shrink: 0;
              box-shadow: 0 4px 8px rgba(65, 105, 225, 0.2);
          }
          
          .module-info {
              flex-grow: 1;
          }
          
          .module-info h4 {
              font-size: 16px;
              font-weight: 500;
              color: #1e293b;
              margin-bottom: 5px;
          }
          
          .module-progress {
              display: flex;
              align-items: center;
          }
          
          .module-progress .progress-bar {
              width: 120px;
              height: 6px;
              background-color: rgba(148, 163, 184, 0.2);
              border-radius: 3px;
              margin-right: 10px;
              overflow: hidden;
          }
          
          .module-progress .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #4169E1, #00CED1);
              width: 0%;
              transition: width 0.3s;
          }
          
          .module-progress span {
              font-size: 12px;
              color: #64748b;
          }
          
          .start-training-btn {
              display: block;
              width: 100%;
              padding: 14px;
              background: linear-gradient(90deg, #4169E1, #00CED1);
              color: white;
              border: none;
              border-radius: 12px;
              font-weight: 500;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(65, 105, 225, 0.3);
          }
          
          .start-training-btn:hover {
              transform: translateY(-3px);
              box-shadow: 0 8px 25px rgba(65, 105, 225, 0.4);
          }
          
          .start-training-btn.next-module {
              background: linear-gradient(90deg, #00CED1, #4169E1);
              box-shadow: 0 4px 15px rgba(0, 206, 209, 0.3);
          }
          
          .start-training-btn.next-module:hover {
              box-shadow: 0 8px 25px rgba(0, 206, 209, 0.4);
          }

          /* Support FAQ Modal Styles */
          .support-faq-modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              justify-content: center;
              align-items: center;
              opacity: 0;
              transition: opacity 0.3s ease;
          }
          
          .support-faq-modal.show {
              display: flex;
              opacity: 1;
          }
          
          .support-faq-content {
              background-color: white;
              width: 100%;
              max-width: 600px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              overflow: hidden;
          }
          
          .faq-header {
              padding: 20px 25px;
              border-bottom: 1px solid #eaeaea;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: linear-gradient(to right, #4169E1, #00CED1);
              color: white;
          }
          
          .faq-body {
              padding: 25px;
              max-height: 60vh;
              overflow-y: auto;
          }
          
          .faq-item {
              margin-bottom: 20px;
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 20px;
          }
          
          .faq-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
          }
          
          .faq-question {
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 10px;
              font-size: 16px;
          }
          
          .faq-answer {
              color: #64748b;
              font-size: 14px;
              line-height: 1.6;
          }
        `}
      </style>
    
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
          <div className="logo">
            <h1>
              <span style={{ color: '#00c2cb' }}>Apo</span><span style={{ color: '#4f46e5' }}>Lead</span>
            </h1>
            <div className="toggle-btn" id="sidebarToggle" onClick={toggleSidebar}>
              <i className={`fas ${sidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
            </div>
          </div>
          
          <div className="nav-menu">
            <a href="#" className="nav-item active">
              <Play size={20} />
              <span>Getting Started</span>
            </a>
            <a href="#" className="nav-item locked">
              <PieChart size={20} />
              <span>Dashboard</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            <a href="#" className="nav-item locked">
              <Wrench size={20} />
              <span>Tool Page</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            <a href="#" className="nav-item locked">
              <CreditCard size={20} />
              <span>Payment History</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            <a href="#" className="nav-item locked">
              <BarChart2 size={20} />
              <span>Performance</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            <a href="#" className="nav-item locked">
              <Trophy size={20} />
              <span>Ranking</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            <a href="#" className="nav-item locked">
              <FileText size={20} />
              <span>Billing Information</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            
            <div className="nav-divider"></div>
            
            <a href="#" className="nav-item locked">
              <Settings size={20} />
              <span>Settings</span>
              <i className="fas fa-lock menu-lock-icon"></i>
            </a>
            <a href="#" className="nav-item" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Log Out</span>
            </a>
            
            <div style={{ flexGrow: 1 }}></div>
          </div>
          
          <div className="sidebar-footer" onClick={toggleSupportFAQ}>
            <i className="fas fa-info-circle"></i> Need help? Support Center
          </div>
        </div>
        
        <div className="main-content">
          <div className="header">
            <div className="welcome">
              Thanks for signing up, <span>{userProfile?.first_name || 'User'}</span>!
            </div>
            
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
                  {getUserInitials()}
                </div>
                <div className="user-name">
                  {userProfile?.first_name || ''} {userProfile?.last_name || ''}
                </div>
                <i className="fas fa-chevron-down dropdown-icon"></i>
              </div>
            </div>
          </div>
          
          <div className="page-title">
            <h2>
              <div className="page-title-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              Onboarding Process
            </h2>
            <div className="page-subtitle">Complete all steps to start earning</div>
          </div>
          
          <div className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="stat-info">
                <h3>{currentStep * 25}%</h3>
                <p><i className="fas fa-arrow-up"></i> Onboarding Progress</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="stat-info">
                <h3>{currentStep}/4</h3>
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
                <h3>-</h3>
                <p><i className="fas fa-trophy"></i> Assessment Score</p>
              </div>
            </div>
          </div>
          
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
                  <div className="progress-fill" style={{ width: `${currentStep * 25}%` }}></div>
                </div>
                <div className="progress-text">
                  <i className="fas fa-check-circle"></i> {currentStep} of 4 completed
                </div>
              </div>
            </div>
            
            <div className="action-cards">
              <div className={`action-card ${currentStep > 0 ? 'completed' : ''}`}>
                <div className={`step-number ${currentStep > 0 ? 'completed' : ''}`}>
                  {currentStep > 0 ? <i className="fas fa-check"></i> : 1}
                </div>
                <div className={`action-icon ${currentStep > 0 ? 'completed' : ''}`}>
                  <i className="fas fa-book-reader"></i>
                </div>
                <h3>Initial Training</h3>
                <p>Complete the initial training module to unlock the next step. This will teach you the fundamentals.</p>
                <button 
                  className={`card-button ${currentStep > 0 ? 'button-completed' : 'button-current'}`}
                  onClick={openTrainingModal}
                >
                  <i className={`fas ${currentStep > 0 ? 'fa-check-circle' : 'fa-play-circle'}`}></i>
                  {currentStep > 0 ? 'Completed' : 'Start'}
                </button>
              </div>
              
              <div className={`action-card ${currentStep > 1 ? 'completed' : currentStep < 1 ? 'locked' : ''}`}>
                {currentStep < 1 && 
                  <div className="lock-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                }
                <div className={`step-number ${currentStep > 1 ? 'completed' : currentStep < 1 ? 'locked' : ''}`}>
                  {currentStep > 1 ? <i className="fas fa-check"></i> : 2}
                </div>
                <div className={`action-icon ${currentStep > 1 ? 'completed' : currentStep < 1 ? 'locked' : ''}`}>
                  <i className="fas fa-user-friends"></i>
                </div>
                <h3>Schedule Interview</h3>
                <p>Once your training is reviewed, you'll be able to schedule your interview with our team.</p>
                <button 
                  className={`card-button ${
                    currentStep > 1 ? 'button-completed' : 
                    currentStep === 1 ? 'button-current' : 
                    'button-locked'
                  }`}
                  onClick={currentStep >= 1 ? openTrainingModal : undefined}
                >
                  <i className={`fas ${
                    currentStep > 1 ? 'fa-check-circle' : 
                    currentStep === 1 ? 'fa-calendar-alt' : 
                    'fa-lock'
                  }`}></i>
                  {currentStep > 1 ? 'Completed' : currentStep === 1 ? 'Schedule' : 'Locked'}
                </button>
              </div>
              
              <div className={`action-card ${currentStep > 2 ? 'completed' : currentStep < 2 ? 'locked' : ''}`}>
                {currentStep < 2 && 
                  <div className="lock-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                }
                <div className={`step-number ${currentStep > 2 ? 'completed' : currentStep < 2 ? 'locked' : ''}`}>
                  {currentStep > 2 ? <i className="fas fa-check"></i> : 3}
                </div>
                <div className={`action-icon ${currentStep > 2 ? 'completed' : currentStep < 2 ? 'locked' : ''}`}>
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <h3>Additional Training</h3>
                <p>After your interview, complete additional training modules to refine your skills.</p>
                <button 
                  className={`card-button ${
                    currentStep > 2 ? 'button-completed' : 
                    currentStep === 2 ? 'button-current' : 
                    'button-locked'
                  }`}
                  onClick={currentStep >= 2 ? openTrainingModal : undefined}
                >
                  <i className={`fas ${
                    currentStep > 2 ? 'fa-check-circle' : 
                    currentStep === 2 ? 'fa-book' : 
                    'fa-lock'
                  }`}></i>
                  {currentStep > 2 ? 'Completed' : currentStep === 2 ? 'Start Training' : 'Locked'}
                </button>
              </div>
              
              <div className={`action-card ${currentStep > 3 ? 'completed' : currentStep < 3 ? 'locked' : ''}`}>
                {currentStep < 3 && 
                  <div className="lock-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                }
                <div className={`step-number ${currentStep > 3 ? 'completed' : currentStep < 3 ? 'locked' : ''}`}>
                  {currentStep > 3 ? <i className="fas fa-check"></i> : 4}
                </div>
                <div className={`action-icon ${currentStep > 3 ? 'completed' : currentStep < 3 ? 'locked' : ''}`}>
                  <i className="fas fa-rocket"></i>
                </div>
                <h3>Kickoff & Setup</h3>
                <p>Add your banking info, join Discord, and complete final onboarding steps to get started.</p>
                <button 
                  className={`card-button ${
                    currentStep > 3 ? 'button-completed' : 
                    currentStep === 3 ? 'button-current' : 
                    'button-locked'
                  }`}
                  onClick={currentStep >= 3 ? openTrainingModal : undefined}
                >
                  <i className={`fas ${
                    currentStep > 3 ? 'fa-check-circle' : 
                    currentStep === 3 ? 'fa-rocket' : 
                    'fa-lock'
                  }`}></i>
                  {currentStep > 3 ? 'Completed' : currentStep === 3 ? 'Start Setup' : 'Locked'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div id="trainingModal" className="modal" ref={trainingModalRef}>
          <div className="modal-content">
            <div className="modal-header">
              <h2><i className="fas fa-book-reader"></i> Initial Training</h2>
              <span className="close-modal" onClick={closeTrainingModal}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="modal-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>Welcome to ApoLead Training!</h3>
              <p>This training module will teach you the fundamentals needed to get started. It should take approximately 45-60 minutes to complete.</p>
              <p>Once completed, you'll be able to proceed to the next steps in your onboarding journey.</p>
              <div className="training-modules">
                <div className="module">
                  <div className="module-icon">
                    <i className="fas fa-play-circle"></i>
                  </div>
                  <div className="module-info">
                    <h4>Introduction to ApoLead</h4>
                    <div className="module-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" ref={progressFillRef} style={{ width: '0%' }}></div>
                      </div>
                      <span ref={progressTextRef}>0% Complete</span>
                    </div>
                  </div>
                </div>
                <div className="module">
                  <div className="module-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <div className="module-info">
                    <h4>Core Principles</h4>
                    <div className="module-progress">
                      <span>Locked</span>
                    </div>
                  </div>
                </div>
                <div className="module">
                  <div className="module-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <div className="module-info">
                    <h4>Best Practices</h4>
                    <div className="module-progress">
                      <span>Locked</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                className="start-training-btn" 
                ref={beginTrainingBtnRef}
                onClick={beginTraining}
              >
                Begin Training
              </button>
            </div>
          </div>
        </div>

        <div className={`support-faq-modal ${showSupportFAQ ? 'show' : ''}`}>
          <div className="support-faq-content">
            <div className="faq-header">
              <h2><HelpCircle size={18} style={{ marginRight: '8px' }} /> Support Center</h2>
              <span className="close-modal" onClick={toggleSupportFAQ}>&times;</span>
            </div>
            <div className="faq-body">
              <div className="faq-item">
                <div className="faq-question">How long does the onboarding process take?</div>
                <div className="faq-answer">
                  The entire onboarding process typically takes 2-3 days to complete. This includes the initial training (1-2 hours), 
                  scheduling and attending your interview (30-45 minutes), completing additional training (1-2 hours), 
                  and setting up your account (30 minutes). Our team will review your application within 24-48 hours after completion.
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">Why are some features locked?</div>
                <div className="faq-answer">
                  Features are unlocked as you progress through the onboarding process. This ensures you have the necessary training and 
                  understanding before accessing all platform capabilities. Each completed step unlocks new features and functionality.
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">What happens after I complete all onboarding steps?</div>
                <div className="faq-answer">
                  After completing all onboarding steps, our team will review your application and training performance. Once approved, 
                  you'll receive full access to the platform and can begin accepting assignments. You'll also receive notifications about 
                  available opportunities matched to your skills and availability.
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">Can I pause my onboarding and continue later?</div>
                <div className="faq-answer">
                  Yes, your progress is automatically saved at each step. You can return at any time to continue where you left off. 
                  However, we recommend completing the process within 7 days to ensure your application remains active in our system.
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">Why is the training so important?</div>
                <div className="faq-answer">
                  Training is critical to ensure all our agents represent ApoLead with professionalism and expertise. The training 
                  modules cover essential skills, company policies, and best practices that will help you succeed. Take each module 
                  seriously as your performance during training impacts your approval and initial ranking.
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">How do I get help if I'm stuck?</div>
                <div className="faq-answer">
                  If you need assistance at any point, you can reach our support team at support@apolead.com. We typically respond within 
                  24 hours. For urgent matters, you can also schedule a quick 15-minute call with our onboarding specialists through the 
                  support portal that will be available after completing the first training module.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
