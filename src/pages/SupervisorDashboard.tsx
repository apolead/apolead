
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }
        
        console.log("Session found, checking supervisor credentials");
        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('credentials, first_name, last_name')
          .eq('user_id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "Could not verify your credentials",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
          
        if (!profile || profile.credentials !== 'supervisor') {
          console.log("User is not a supervisor, redirecting to dashboard");
          toast({
            title: "Access Denied",
            description: "You don't have supervisor permissions",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        // Set current user information
        setCurrentUser({
          first_name: profile.first_name || '',
          last_name: profile.last_name || ''
        });
        
        // User is a supervisor, proceed to fetch all profiles
        getUserProfiles();
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        navigate('/login');
      }
    };
    
    const getUserProfiles = async () => {
      try {
        console.log("Fetching all user profiles");
        // Get all user profiles without filtering
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('application_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching user profiles:', error);
          toast({
            title: "Error",
            description: "Failed to load user profiles",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          console.log('Successfully fetched profiles:', data);
          setUserProfiles(data);
        } else {
          console.log('No profiles returned from query');
          setUserProfiles([]);
        }
      } catch (err) {
        console.error('Exception in getUserProfiles:', err);
      }
    };
    
    checkUserRole();

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
    if (!searchTerm) return true;
    
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
            
            <Popover>
              <PopoverTrigger asChild>
                <div className="user-avatar" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                  fontSize: '16px'
                }}>
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="grid gap-1">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {currentUser.first_name} {currentUser.last_name}
                  </div>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <a href="#" className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded">
                    <i className="fas fa-user-circle mr-2"></i> My Profile
                  </a>
                  <a href="#" className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded">
                    <i className="fas fa-cog mr-2"></i> Settings
                  </a>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded w-full text-left"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Log Out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Search and Filter Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="search-bar" style={{
              position: 'relative',
              width: '320px'
            }}>
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '14px'
              }}></i>
              <input 
                type="text" 
                placeholder="Search applicants by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 42px',
                  width: '100%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <style>{`
              .status-approved {
                color: #10b981;
                background-color: rgba(16, 185, 129, 0.1);
              }
              .status-rejected {
                color: #ef4444;
                background-color: rgba(239, 68, 68, 0.1);
              }
              .status-pending {
                color: #f59e0b;
                background-color: rgba(245, 158, 11, 0.1);
              }
              .image-popover {
                width: 24px;
                height: 24px;
                border-radius: 6px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                margin-right: 8px;
                background-color: #f1f5f9;
                color: #64748b;
                transition: all 0.2s;
              }
              .image-popover:hover {
                background-color: #e2e8f0;
                color: #475569;
              }
              .edit-button {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background-color: #f1f5f9;
                color: #64748b;
                transition: all 0.2s;
                border: none;
                outline: none;
              }
              .edit-button:hover {
                background-color: #e2e8f0;
                color: #475569;
              }
            `}</style>
            
            <div className="filter-actions flex gap-3">
              <Button variant="outline" style={{
                borderRadius: '10px',
                padding: '0 16px',
                height: '42px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 500
              }}>
                <i className="fas fa-filter"></i>
                Filter
              </Button>
              
              <Button style={{
                borderRadius: '10px',
                padding: '0 16px',
                height: '42px',
                backgroundColor: '#4f46e5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 500
              }}>
                <i className="fas fa-download"></i>
                Export
              </Button>
            </div>
          </div>
          
          {/* Applicants Table */}
          <div className="applicants-table bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">Applicant</TableHead>
                  <TableHead className="font-semibold text-gray-600">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-600">Gov ID</TableHead>
                  <TableHead className="font-semibold text-gray-600">Experience</TableHead>
                  <TableHead className="font-semibold text-gray-600">Application Date</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="font-semibold text-gray-600">Agent ID</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No applicants match your search criteria' : 'No applicant data available yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="user-avatar-small" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            fontSize: '14px'
                          }}>
                            {profile.first_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                            <div className="text-sm text-gray-500">Lead Source: {profile.lead_source || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{profile.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div 
                            className="image-popover" 
                            onClick={() => openPhotoModal('Government ID', profile.gov_id_image)}
                            title="View ID Image"
                          >
                            <i className="fas fa-id-card"></i>
                          </div>
                          <div className="text-sm">{profile.gov_id_number || 'Not provided'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {profile.sales_experience ? <span className="text-green-600"><i className="fas fa-check-circle mr-1"></i>Sales</span> : <span className="text-gray-400"><i className="fas fa-times-circle mr-1"></i>Sales</span>}
                          <br />
                          {profile.service_experience ? <span className="text-green-600"><i className="fas fa-check-circle mr-1"></i>Service</span> : <span className="text-gray-400"><i className="fas fa-times-circle mr-1"></i>Service</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(profile.application_date)}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`${getStatusClass(profile.application_status)} text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center`}>
                          <i className={`fas ${getStatusIcon(profile.application_status)} mr-1`}></i>
                          {profile.application_status ? profile.application_status.charAt(0).toUpperCase() + profile.application_status.slice(1) : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{profile.agent_id || 'Not assigned'}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <button 
                          className="edit-button ml-2"
                          onClick={() => openEditDialog(profile)}
                          title="Edit Profile"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Applicant Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="agent_id" className="text-right text-sm font-medium">
                Agent ID
              </label>
              <input
                id="agent_id"
                name="agent_id"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editForm.agent_id}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="agent_standing" className="text-right text-sm font-medium">
                Standing
              </label>
              <select
                id="agent_standing"
                name="agent_standing"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editForm.agent_standing}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Probation">Probation</option>
                <option value="Suspended">Suspended</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lead_source" className="text-right text-sm font-medium">
                Lead Source
              </label>
              <input
                id="lead_source"
                name="lead_source"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editForm.lead_source}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="start_date" className="text-right text-sm font-medium">
                Start Date
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editForm.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="supervisor_notes" className="text-right text-sm font-medium pt-2">
                Notes
              </label>
              <textarea
                id="supervisor_notes"
                name="supervisor_notes"
                className="col-span-3 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editForm.supervisor_notes}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Preview Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{imageType}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={imageType} 
                className="max-w-full max-h-[60vh] object-contain rounded-md" 
              />
            ) : (
              <div className="text-center text-gray-500 p-12">
                <i className="fas fa-image text-4xl mb-4"></i>
                <p>No image available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default SupervisorDashboard;
