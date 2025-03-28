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
import { toast } from "sonner";

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
      try {
        // Debug log to see if we're attempting to fetch
        console.log('Attempting to fetch user profiles');
        
        // Get all profiles, including those with null credentials
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('application_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching user profiles:', error);
          toast.error('Failed to load profiles');
          return;
        }
        
        if (data) {
          // Debug log to see what we're getting back
          console.log('Fetched profiles raw data:', data);
          
          // Filter out supervisor profiles in the client code
          const nonSupervisorProfiles = data.filter(profile => 
            profile.credentials !== 'supervisor'
          );
          
          console.log('Filtered non-supervisor profiles:', nonSupervisorProfiles);
          setUserProfiles(nonSupervisorProfiles);
        }
      } catch (error) {
        console.error('Exception when fetching profiles:', error);
        toast.error('Failed to load profiles');
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
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully');

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
      toast.error('Something went wrong');
    }
  };
  
  const filteredProfiles = userProfiles.filter(profile => {
    if (!searchTerm.trim()) return true;
    
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) || 
      (profile.gov_id_number && profile.gov_id_number.toLowerCase().includes(searchLower)) ||
      (profile.application_status && profile.application_status.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
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
    if (!status) return '';
    
    switch (status.toLowerCase()) {
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
    if (!status) return 'fa-question-circle';
    
    switch (status.toLowerCase()) {
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

  // Image handler with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image failed to load');
    e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Available';
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
                fontSize: '16px',
                fontWeight: 600
              }}>
                {currentUser.first_name ? currentUser.first_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-name" style={{ fontWeight: 500, fontSize: '14px' }}>
                {currentUser.first_name} {currentUser.last_name}
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Search and filter */}
          <div className="search-filter" style={{ marginBottom: '25px' }}>
            <div className="search-box" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              borderRadius: '12px',
              padding: '12px 20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              width: '100%',
              maxWidth: '600px'
            }}>
              <i className="fas fa-search" style={{ color: '#64748b', marginRight: '15px' }}></i>
              <input 
                type="text" 
                placeholder="Search by name, email, or ID number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  flexGrow: 1,
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
          
          {/* Candidates Table */}
          <div className="candidates-table" style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            padding: '20px',
            overflowX: 'auto'
          }}>
            <div className="table-header" style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                Candidates ({filteredProfiles.length})
              </h2>
              
              <div className="filters" style={{ display: 'flex', gap: '10px' }}>
                {/* Additional filter buttons could go here */}
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Government ID</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500 }}>{profile.first_name} {profile.last_name}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{profile.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                      <TableCell>{formatDate(profile.application_date)}</TableCell>
                      <TableCell>
                        <div className={`status ${getStatusClass(profile.application_status)}`} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '13px',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          <i className={`fas ${getStatusIcon(profile.application_status)}`}></i>
                          {profile.application_status || 'N/A'}
                        </div>
                        <style>{`
                          .status-approved {
                            color: #10b981;
                          }
                          .status-rejected {
                            color: #ef4444;
                          }
                          .status-pending {
                            color: #f59e0b;
                          }
                        `}</style>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => openPhotoModal('Government ID', profile.gov_id_image)} className="doc-button" style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#64748b',
                            transition: 'all 0.3s'
                          }}>
                            <i className="fas fa-id-card"></i> ID
                          </button>
                          <button onClick={() => openPhotoModal('Speed Test', profile.speed_test)} className="doc-button" style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#64748b',
                            transition: 'all 0.3s'
                          }}>
                            <i className="fas fa-tachometer-alt"></i> Speed
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => openEditDialog(profile)} size="sm" variant="outline">
                          <i className="fas fa-pencil-alt"></i> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} style={{ textAlign: 'center', padding: '30px 0' }}>
                      No candidate profiles found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{imageType} Image</DialogTitle>
          </DialogHeader>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={`${imageType} document`} 
                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px' }}
                onError={handleImageError}
              />
            ) : (
              <div style={{ padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                No image available
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Agent Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="agent_id" className="block text-sm font-medium mb-1">Agent ID</label>
                <input
                  id="agent_id"
                  name="agent_id"
                  value={editForm.agent_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="agent_standing" className="block text-sm font-medium mb-1">Agent Standing</label>
                <select
                  id="agent_standing"
                  name="agent_standing"
                  value={editForm.agent_standing}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="lead_source" className="block text-sm font-medium mb-1">Lead Source</label>
                <input
                  id="lead_source"
                  name="lead_source"
                  value={editForm.lead_source}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={editForm.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="supervisor_notes" className="block text-sm font-medium mb-1">Supervisor Notes</label>
                <textarea
                  id="supervisor_notes"
                  name="supervisor_notes"
                  value={editForm.supervisor_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 border rounded-md"
                ></textarea>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSS */}
      <style>{`
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
        }
        
        .sidebar .nav-item:hover {
          background-color: rgba(79, 70, 229, 0.05);
        }
        
        .doc-button:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        
        .action-button:hover {
          background-color: #f8fafc;
          color: #4f46e5;
        }
        
        .user-profile:hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        /* Add responsive styles for smaller screens */
        @media (max-width: 768px) {
          .main-content {
            padding: 15px;
          }
          
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .user-info {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default SupervisorDashboard;
