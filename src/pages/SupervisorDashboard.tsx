
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gov_id_number: string;
  gov_id_image: string;
  speed_test: string;
  application_date: string;
  sales_experience: boolean;
  service_experience: boolean;
  application_status: string;
  credentials?: string;
}

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [supervisorName, setSupervisorName] = useState('Supervisor');
  const [supervisorInitials, setSupervisorInitials] = useState('SJ');
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(7);
  
  // Photo modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [imageType, setImageType] = useState('');
  
  // Edit evaluation modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [evalData, setEvalData] = useState({
    salesSkills: '',
    communication: '',
    interviewProcess: '',
    finalDecision: '',
    notes: ''
  });
  
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('credentials, first_name, last_name')
          .eq('user_id', session.user.id)
          .single();
          
        if (!profile || profile.credentials !== 'supervisor') {
          // Redirect to appropriate dashboard if not a supervisor
          navigate('/dashboard');
        } else {
          // Set supervisor name for display
          if (profile.first_name && profile.last_name) {
            setSupervisorName(`${profile.first_name}`);
            const firstInitial = profile.first_name.charAt(0);
            const lastInitial = profile.last_name.charAt(0);
            setSupervisorInitials(`${firstInitial}${lastInitial}`);
          }
        }
      } else {
        navigate('/login');
      }
    };
    
    const getAllUserProfiles = async () => {
      try {
        // Fetch all user profiles except those with supervisor credentials
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('credentials', 'supervisor')
          .order('application_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching user profiles:', error);
          throw error;
        }
        
        if (data) {
          setUserProfiles(data);
        }
      } catch (error) {
        console.error('Error in getAllUserProfiles:', error);
        toast({
          title: "Failed to fetch profiles",
          description: "There was an error loading the user profiles.",
          variant: "destructive",
        });
      }
    };
    
    checkUserRole();
    getAllUserProfiles();

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
  }, [navigate, toast]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const openPhotoModal = (type: string, imageUrl: string) => {
    if (!imageUrl) {
      toast({
        title: "No image available",
        description: "This user hasn't uploaded this document yet.",
        variant: "destructive",
      });
      return;
    }
    
    setImageType(type);
    setCurrentImage(imageUrl);
    setShowImageModal(true);
  };
  
  const closeModal = () => {
    setShowImageModal(false);
    setShowEditModal(false);
  };
  
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    // Reset evaluation form data
    setEvalData({
      salesSkills: '',
      communication: '',
      interviewProcess: '',
      finalDecision: user.application_status || '',
      notes: ''
    });
    setShowEditModal(true);
  };
  
  const handleEvalChange = (field: string, value: string) => {
    setEvalData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveEvaluation = async () => {
    // Validate form
    const requiredFields = [];
    if (!evalData.salesSkills) requiredFields.push('Sales Skills Assessment');
    if (!evalData.communication) requiredFields.push('Communication Quality');
    if (!evalData.interviewProcess) requiredFields.push('Interview Process');
    if (!evalData.finalDecision) requiredFields.push('Final Decision');
    if (!evalData.notes) requiredFields.push('Interview Notes');
    
    if (requiredFields.length > 0) {
      toast({
        title: "Form Incomplete",
        description: `Please complete the following fields: ${requiredFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    if (selectedUser) {
      try {
        // Update user's application status
        const { error } = await supabase
          .from('user_profiles')
          .update({ application_status: evalData.finalDecision })
          .eq('id', selectedUser.id);
          
        if (error) throw error;
        
        // Update local state to reflect changes
        setUserProfiles(prev => 
          prev.map(profile => 
            profile.id === selectedUser.id 
              ? { ...profile, application_status: evalData.finalDecision } 
              : profile
          )
        );
        
        // Close modal and show success message
        setShowEditModal(false);
        toast({
          title: "Success",
          description: "Interview evaluation saved successfully!",
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Failed",
          description: "There was an error saving the evaluation.",
          variant: "destructive",
        });
      }
    }
  };
  
  const filteredProfiles = userProfiles.filter(profile => {
    if (!searchTerm) return true;
    
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) || 
      profile.gov_id_number?.toLowerCase().includes(searchLower) ||
      profile.application_status?.toLowerCase().includes(searchLower) ||
      profile.email?.toLowerCase().includes(searchLower)
    );
  });
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      case 'waitlist':
        return 'status-pending';
      default:
        return '';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'fa-check-circle';
      case 'rejected':
        return 'fa-times-circle';
      case 'pending':
      case 'waitlist':
        return 'fa-clock';
      default:
        return 'fa-question-circle';
    }
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="sidebar" style={{
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
            id="sidebarToggle" 
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
          alignItems: sidebarCollapsed ? 'center' : 'stretch',
          justifyContent: sidebarCollapsed ? 'flex-start' : 'flex-start'
        }}>
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
          </a>
          
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
          }}>
            <i className="fas fa-user-friends" style={{
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
            }}>Interview</span>
          </a>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
          }}>
            <i className="fas fa-users" style={{
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
            }}>Agent Roster</span>
          </a>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
          </a>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
          </a>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
          </a>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
          </a>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
          </a>
          
          <div className="nav-divider" style={{
            height: '1px',
            backgroundColor: '#eaeaea',
            margin: '15px 10px 15px',
            width: 'calc(100% - 20px)'
          }}></div>
          
          <a href="#" className="nav-item" style={{
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
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              textAlign: sidebarCollapsed ? 'center' : 'left',
              overflow: sidebarCollapsed ? 'hidden' : 'visible'
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
            Welcome, <span style={{ color: '#4f46e5', position: 'relative' }}>{supervisorName}</span>
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
                {supervisorInitials}
              </div>
              <div className="user-name" style={{ fontWeight: 500, color: '#1e293b' }}>{supervisorName}</div>
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
              <i className="fas fa-user-friends"></i>
            </div>
            Interview Management
          </h2>
          <div className="page-subtitle" style={{
            color: '#64748b',
            marginLeft: '15px',
            fontSize: '14px',
            paddingLeft: '15px',
            borderLeft: '2px solid #e2e8f0'
          }}>Evaluate and manage agent interviews</div>
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
              <i className="fas fa-users"></i>
              <style>{`
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
              `}</style>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>{userProfiles.length}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-arrow-up" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i> Total Interviews
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
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>
                {userProfiles.filter(p => p.application_status === 'approved').length}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-check" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i> Approved
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
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>
                {userProfiles.filter(p => p.application_status === 'rejected').length}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-times" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i> Rejected
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
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>
                {userProfiles.filter(p => p.application_status === 'pending').length}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-hourglass-half" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i> Pending Review
              </p>
            </div>
          </div>
        </div>
        
        {/* Table Container */}
        <div className="table-container" style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <style>{`
            .table-container::before {
              content: '';
              position: absolute;
              bottom: 0;
              right: 0;
              width: 200px;
              height: 200px;
              background: radial-gradient(circle, rgba(79,70,229,0.05) 0%, rgba(79,70,229,0) 70%);
              border-radius: 0;
            }
            
            .status {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: 50px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .status-approved {
              background-color: rgba(16, 185, 129, 0.1);
              color: #10B981;
            }
            
            .status-rejected {
              background-color: rgba(239, 68, 68, 0.1);
              color: #EF4444;
            }
            
            .status-pending {
              background-color: rgba(245, 158, 11, 0.1);
              color: #F59E0B;
            }
            
            .badge {
              display: inline-flex;
              align-items: center;
              padding: 5px 10px;
              border-radius: 50px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .badge-success {
              background-color: rgba(16, 185, 129, 0.1);
              color: #10B981;
            }
            
            .badge-warning {
              background-color: rgba(245, 158, 11, 0.1);
              color: #F59E0B;
            }
            
            .badge-danger {
              background-color: rgba(239, 68, 68, 0.1);
              color: #EF4444;
            }
            
            .btn {
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s;
              border: none;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            }
            
            .btn i {
              margin-right: 8px;
            }
            
            .btn-outline {
              background: white;
              border: 1px solid #e2e8f0;
              color: #64748b;
            }
            
            .btn-sm {
              padding: 5px 10px;
              font-size: 12px;
              border-radius: 6px;
            }
            
            .btn-outline:hover {
              border-color: #4f46e5;
              color: #4f46e5;
            }
          `}</style>
          
          <div className="table-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <h2 className="table-title" style={{
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="fas fa-user-friends" style={{ marginRight: '10px', color: '#4f46e5' }}></i>
              Interview Candidates
            </h2>
            <div style={{ display: 'flex' }}>
              <div className="search-container" style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '10px 15px',
                width: '300px',
                transition: 'all 0.3s',
                border: '1px solid #e2e8f0'
              }}>
                <i className="fas fa-search" style={{ color: '#64748b', marginRight: '10px' }}></i>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search by name, ID, or status..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '14px',
                    color: '#1e293b'
                  }}
                />
              </div>
              <button className="filter-button" style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 15px',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginLeft: '15px'
              }}>
                <i className="fas fa-filter" style={{ marginRight: '8px' }}></i>
                Filter
              </button>
              <button className="filter-button" style={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginLeft: '15px'
              }}>
                <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                New Interview
              </button>
            </div>
          </div>
          
          {/* Data Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Government ID</TableHead>
                <TableHead>Gov Photo</TableHead>
                <TableHead>Speed Test</TableHead>
                <TableHead>Interview Date</TableHead>
                <TableHead>Sales Skills</TableHead>
                <TableHead>Communication</TableHead>
                <TableHead>Interview Process</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{`${profile.first_name} ${profile.last_name}`}</TableCell>
                    <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                    <TableCell>
                      {profile.gov_id_image ? (
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => openPhotoModal('id', profile.gov_id_image)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fas fa-id-card" style={{ marginRight: '5px' }}></i> View
                        </button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.speed_test ? (
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => openPhotoModal('speed', profile.speed_test)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fas fa-tachometer-alt" style={{ marginRight: '5px' }}></i> View
                        </button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(profile.application_date)}</TableCell>
                    <TableCell>
                      {profile.sales_experience !== undefined ? (
                        <span className={`badge ${profile.sales_experience ? 'badge-success' : 'badge-warning'}`}>
                          <i className={`fas ${profile.sales_experience ? 'fa-check' : 'fa-times'}`} style={{ marginRight: '5px' }}></i>
                          {profile.sales_experience ? 'Yes' : 'No'}
                        </span>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      {profile.application_status && (
                        <span className={`status ${getStatusClass(profile.application_status)}`}>
                          <i className={`fas ${getStatusIcon(profile.application_status)}`} style={{ marginRight: '5px' }}></i>
                          {profile.application_status.charAt(0).toUpperCase() + profile.application_status.slice(1)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button 
                        className="action-btn" 
                        onClick={() => openEditModal(profile)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '16px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ color: '#94a3b8', fontSize: '16px' }}>
                      <i className="fas fa-search" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
                      No candidates found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="pagination" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '25px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            <div className="pagination-info" style={{ display: 'flex', alignItems: 'center' }}>
              Showing 1 to {Math.min(filteredProfiles.length, entriesPerPage)} of {filteredProfiles.length} entries
              <div className="per-page" style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                <span>Show</span>
                <select 
                  style={{
                    margin: '0 10px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                >
                  <option>7</option>
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
              </div>
            </div>
            <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center' }}>
              <button className="pagination-button" style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#64748b',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="pagination-button active" style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#4f46e5',
                color: 'white',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderColor: '#4f46e5'
              }}>1</button>
              {filteredProfiles.length > entriesPerPage && (
                <button className="pagination-button" style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#64748b',
                  margin: '0 5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}>2</button>
              )}
              {filteredProfiles.length > entriesPerPage * 2 && (
                <button className="pagination-button" style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#64748b',
                  margin: '0 5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}>3</button>
              )}
              {filteredProfiles.length > entriesPerPage * 3 && (
                <button className="pagination-button" style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#64748b',
                  margin: '0 5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}>4</button>
              )}
              <button className="pagination-button" style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#64748b',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <i className={`fas fa-${imageType === 'id' ? 'id-card' : 'tachometer-alt'} mr-2`}></i>
                {imageType === 'id' ? 'Government ID' : 'Speed Test Result'}
              </DialogTitle>
            </DialogHeader>
            <div className="text-center p-4">
              <img 
                src={currentImage} 
                alt={imageType === 'id' ? 'Government ID' : 'Speed Test Result'} 
                className="max-w-full max-h-[60vh] border border-gray-200 rounded-lg mx-auto"
              />
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Modal */}
        <Sheet open={showEditModal} onOpenChange={setShowEditModal}>
          <SheetContent className="w-[90%] sm:max-w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center text-xl">
                <i className="fas fa-user-edit mr-2"></i>
                Edit Interview Evaluation
              </SheetTitle>
            </SheetHeader>
            
            <div className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label htmlFor="agent-name" className="text-sm font-medium">Agent Name</label>
                  <input 
                    type="text" 
                    id="agent-name" 
                    value={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="government-id" className="text-sm font-medium">Government ID</label>
                  <input 
                    type="text" 
                    id="government-id" 
                    value={selectedUser?.gov_id_number || ''} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="interview-date" className="text-sm font-medium">Interview Date</label>
                  <input 
                    type="text" 
                    id="interview-date" 
                    value={selectedUser ? formatDate(selectedUser.application_date) : ''} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="interviewer" className="text-sm font-medium">Interviewer</label>
                  <input 
                    type="text" 
                    id="interviewer" 
                    value={supervisorName} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sales Skills Assessment</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="sales-skills" 
                        value="Yes" 
                        checked={evalData.salesSkills === 'Yes'} 
                        onChange={() => handleEvalChange('salesSkills', 'Yes')}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="sales-skills" 
                        value="No" 
                        checked={evalData.salesSkills === 'No'} 
                        onChange={() => handleEvalChange('salesSkills', 'No')}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Communication Quality</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="communication" 
                        value="Good" 
                        checked={evalData.communication === 'Good'} 
                        onChange={() => handleEvalChange('communication', 'Good')}
                        className="mr-2"
                      />
                      Good
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="communication" 
                        value="Average" 
                        checked={evalData.communication === 'Average'} 
                        onChange={() => handleEvalChange('communication', 'Average')}
                        className="mr-2"
                      />
                      Average
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="communication" 
                        value="Poor" 
                        checked={evalData.communication === 'Poor'} 
                        onChange={() => handleEvalChange('communication', 'Poor')}
                        className="mr-2"
                      />
                      Poor
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Process</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="interview-process" 
                        value="Good" 
                        checked={evalData.interviewProcess === 'Good'} 
                        onChange={() => handleEvalChange('interviewProcess', 'Good')}
                        className="mr-2"
                      />
                      Good
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="interview-process" 
                        value="Average" 
                        checked={evalData.interviewProcess === 'Average'} 
                        onChange={() => handleEvalChange('interviewProcess', 'Average')}
                        className="mr-2"
                      />
                      Average
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="interview-process" 
                        value="Poor" 
                        checked={evalData.interviewProcess === 'Poor'} 
                        onChange={() => handleEvalChange('interviewProcess', 'Poor')}
                        className="mr-2"
                      />
                      Poor
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Final Decision</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="final-decision" 
                        value="approved" 
                        checked={evalData.finalDecision === 'approved'} 
                        onChange={() => handleEvalChange('finalDecision', 'approved')}
                        className="mr-2"
                      />
                      Approved
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="final-decision" 
                        value="waitlist" 
                        checked={evalData.finalDecision === 'waitlist'} 
                        onChange={() => handleEvalChange('finalDecision', 'waitlist')}
                        className="mr-2"
                      />
                      Waitlist
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="final-decision" 
                        value="rejected" 
                        checked={evalData.finalDecision === 'rejected'} 
                        onChange={() => handleEvalChange('finalDecision', 'rejected')}
                        className="mr-2"
                      />
                      Rejected
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="notes">Interview Notes</label>
                  <textarea 
                    id="notes" 
                    rows={5} 
                    placeholder="Enter interview notes here..." 
                    value={evalData.notes}
                    onChange={(e) => handleEvalChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <SheetFooter className="sm:justify-end gap-4 pt-2">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEvaluation}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-md hover:opacity-90 flex items-center"
              >
                <i className="fas fa-save mr-2"></i> Save Changes
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
