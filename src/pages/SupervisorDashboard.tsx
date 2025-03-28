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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  credentials: string;
  agent_standing?: string;
  supervisor_notes?: string;
  agent_id?: string;
  lead_source?: string;
  start_date?: string;
}

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [imageType, setImageType] = useState('');
  const [currentUser, setCurrentUser] = useState<{first_name: string, last_name: string}>({
    first_name: '',
    last_name: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    agent_id: '',
    supervisor_notes: '',
    agent_standing: 'Active',
    lead_source: '',
    start_date: ''
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
          // Redirect to appropriate dashboard based on role
          navigate('/dashboard');
          return;
        }
        
        // Set current user information
        setCurrentUser({
          first_name: profile.first_name || '',
          last_name: profile.last_name || ''
        });
      } else {
        navigate('/login');
      }
    };
    
    const getUserProfiles = async () => {
      // Get all agents (non-supervisors)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('credentials', 'agent')
        .order('application_date', { ascending: false });
      
      if (data) {
        setUserProfiles(data);
        console.log('Fetched profiles:', data);
      }
      
      if (error) {
        console.error('Error fetching user profiles:', error);
      }
    };
    
    checkUserRole();
    getUserProfiles();

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
  }, [navigate]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const openPhotoModal = (type: string, imageUrl: string) => {
    if (!imageUrl) {
      console.log('No image URL provided');
      return;
    }
    setImageType(type);
    setCurrentImage(imageUrl);
    setShowImageModal(true);
  };
  
  const closeModal = () => {
    setShowImageModal(false);
  };

  const openEditDialog = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setEditForm({
      agent_id: profile.agent_id || '',
      supervisor_notes: profile.supervisor_notes || '',
      agent_standing: profile.agent_standing || 'Active',
      lead_source: profile.lead_source || '',
      start_date: profile.start_date || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProfile) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          agent_id: editForm.agent_id,
          supervisor_notes: editForm.supervisor_notes,
          agent_standing: editForm.agent_standing,
          lead_source: editForm.lead_source,
          start_date: editForm.start_date
        })
        .eq('id', selectedProfile.id)
        .select();

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      // Update the user profiles list
      setUserProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.id === selectedProfile.id 
            ? { 
                ...profile, 
                agent_id: editForm.agent_id,
                supervisor_notes: editForm.supervisor_notes,
                agent_standing: editForm.agent_standing,
                lead_source: editForm.lead_source,
                start_date: editForm.start_date
              } 
            : profile
        )
      );

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const filteredProfiles = userProfiles.filter(profile => {
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) || 
      profile.gov_id_number?.toLowerCase().includes(searchLower) ||
      profile.application_status?.toLowerCase().includes(searchLower)
    );
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };
  
  // CSS classes for status display
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
  
  // Status icon display
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
            Welcome, <span style={{ color: '#4f46e5', position: 'relative' }}>{currentUser.first_name}</span>
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
                {currentUser.first_name.charAt(0)}{currentUser.last_name.charAt(0)}
              </div>
              <div className="user-name" style={{ fontWeight: 500, color: '#1e293b' }}>
                {currentUser.first_name} {currentUser.last_name}
              </div>
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
              <h3 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px', fontWeight: 600 }}>5</h3>
              <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-hourglass-half" style={{ color: '#4f46e5', marginRight: '5px', fontSize: '12px' }}></i> Scheduled Today
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
                        >
                          <i className="fas fa-id-card"></i> View
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
                        >
                          <i className="fas fa-tachometer-alt"></i> View
                        </button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(profile.application_date)}</TableCell>
                    <TableCell>
                      {profile.sales_experience !== undefined ? (
                        <span className={`badge ${profile.sales_experience ? 'badge-success' : 'badge-warning'}`}>
                          <i className={`fas ${profile.sales_experience ? 'fa-check' : 'fa-times'}`}></i>
                          {profile.sales_experience ? ' Yes' : ' No'}
                        </span>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.service_experience !== undefined ? (
                        <span className={`badge ${profile.service_experience ? 'badge-success' : 'badge-warning'}`}>
                          <i className={`fas ${profile.service_experience ? 'fa-check' : 'fa-times'}`}></i>
                          {profile.service_experience ? ' Good' : ' Average'}
                        </span>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.application_status && (
                        <span className={`status ${getStatusClass(profile.application_status)}`}>
                          <i className={`fas ${getStatusIcon(profile.application_status)}`}></i>
                          {' '}{profile.application_status.charAt(0).toUpperCase() + profile.application_status.slice(1)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button 
                        className="action-btn" 
                        onClick={() => openEditDialog(profile)}
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
              Showing 1 to {Math.min(filteredProfiles.length, 7)} of {filteredProfiles.length} entries
              <div className="per-page" style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                <span>Show</span>
                <select style={{
                  margin: '0 10px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#1e293b',
                  outline: 'none'
                }}>
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
        {showImageModal && (
          <div
            className="modal show"
            onClick={closeModal}
            style={{
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
              opacity: 1
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '700px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                transform: 'translateY(0)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div className="modal-header" style={{
                padding: '20px 25px',
                borderBottom: '1px solid #eaeaea',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to right, #4f46e5, #00c2cb)',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  margin: 0, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  <i className={`fas fa-${imageType === 'id' ? 'id-card' : 'tachometer-alt'}`} style={{ marginRight: '10px' }}></i>
                  {imageType === 'id' ? 'Government ID' : 'Speed Test Result'}
                </h2>
                <button
                  className="close-modal"
                  onClick={closeModal}
                  style={{
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'white',
                    opacity: 0.8,
                    transition: 'opacity 0.3s',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body" style={{ padding: '25px' }}>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={currentImage} 
                    alt={imageType === 'id' ? 'Government ID' : 'Speed Test Result'} 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '70vh',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-user-edit" style={{ marginRight: '10px', color: '#4f46e5' }}></i>
                  Edit Agent Information
                </div>
              </DialogTitle>
            </DialogHeader>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                  Agent Name
                </label>
                <input 
                  type="text" 
                  value={selectedProfile ? `${selectedProfile.first_name} ${selectedProfile.last_name}` : ''}
                  disabled
                  style={{
                    padding: '10px 15px',
                    width: '100%',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                  Agent ID
                </label>
                <input 
                  type="text" 
                  name="agent_id"
                  value={editForm.agent_id} 
                  onChange={handleInputChange}
                  placeholder="e.g., AG-12345"
                  style={{
                    padding: '10px 15px',
                    width: '100%',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                  Start Date
                </label>
                <input 
                  type="date" 
                  name="start_date"
                  value={editForm.start_date || ''} 
                  onChange={handleInputChange}
                  style={{
                    padding: '10px 15px',
                    width: '100%',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                  Supervisor
                </label>
                <input 
                  type="text" 
                  value={currentUser.first_name + ' ' + currentUser.last_name}
                  disabled
                  style={{
                    padding: '10px 15px',
                    width: '100%',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                Agent Standing
              </label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="agent_standing"
                    value="Active" 
                    checked={editForm.agent_standing === 'Active'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="agent_standing"
                    value="Probation" 
                    checked={editForm.agent_standing === 'Probation'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Probation
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="agent_standing"
                    value="Warning" 
                    checked={editForm.agent_standing === 'Warning'}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Warning
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                Email Address
              </label>
              <input 
                type="email" 
                value={selectedProfile?.email || ''}
                disabled
                style={{
                  padding: '10px 15px',
                  width: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                Lead Source
              </label>
              <select 
                name="lead_source"
                value={editForm.lead_source || ''}
                onChange={handleInputChange}
                style={{
                  padding: '10px 15px',
                  width: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select Source</option>
                <option value="ApexCredit">ApexCredit</option>
                <option value="WebAds">Web Ads</option>
                <option value="Referral">Referral</option>
                <option value="JobBoard">Job Board</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#1e293b' }}>
                Supervisor Notes
              </label>
              <textarea 
                name="supervisor_notes"
                value={editForm.supervisor_notes || ''}
                onChange={handleInputChange}
                placeholder="Enter notes about this agent..."
                style={{
                  padding: '10px 15px',
                  width: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
