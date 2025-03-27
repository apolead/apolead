
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
    
    // Change icon direction based on sidebar state
    const toggleIcon = document.querySelector('#sidebarToggle i');
    if (toggleIcon instanceof HTMLElement) {
      if (sidebar?.classList.contains('collapsed')) {
        toggleIcon.classList.remove('fa-angle-left');
        toggleIcon.classList.add('fa-angle-right');
      } else {
        toggleIcon.classList.remove('fa-angle-right');
        toggleIcon.classList.add('fa-angle-left');
      }
    }
    
    // Apply styles for collapsed state
    if (sidebar?.classList.contains('collapsed')) {
      // Hide spans
      document.querySelectorAll('.sidebar span').forEach(span => {
        if (span instanceof HTMLElement) {
          span.style.display = 'none';
          span.style.width = '0';
          span.style.height = '0';
          span.style.position = 'absolute';
          span.style.overflow = 'hidden';
        }
      });
      
      // Center icons
      setTimeout(centerIcons, 50);
    } else {
      // Reset icon styling for expanded mode
      document.querySelectorAll('.sidebar .nav-item i:not(.menu-lock-icon)').forEach(icon => {
        if (icon instanceof HTMLElement) {
          icon.style.position = '';
          icon.style.left = '';
          icon.style.right = '';
          icon.style.margin = '';
          icon.style.display = '';
          icon.style.justifyContent = '';
          icon.style.alignItems = '';
          icon.style.width = '';
          icon.style.textAlign = '';
        }
      });
      
      // Show all spans again
      document.querySelectorAll('.sidebar span').forEach(span => {
        if (span instanceof HTMLElement) {
          span.style.display = '';
          span.style.width = '';
          span.style.height = '';
          span.style.position = '';
          span.style.overflow = '';
        }
      });
    }
  };
  
  // Function to forcefully center all icons in collapsed state
  const centerIcons = () => {
    document.querySelectorAll('.sidebar .nav-item i:not(.menu-lock-icon)').forEach(icon => {
      if (icon instanceof HTMLElement) {
        icon.style.position = 'relative';
        icon.style.left = '0';
        icon.style.right = '0';
        icon.style.margin = '0 auto';
        icon.style.display = 'flex';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';
        icon.style.width = '100%';
        icon.style.textAlign = 'center';
      }
    });
  };

  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth',
      });
    }
    setMobileMenuOpen(false);
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  useEffect(() => {
    // Initialize the DOM elements after component mounts
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebar && sidebarToggle) {
      // Adjust toggle button position
      if (sidebarToggle instanceof HTMLElement) {
        sidebarToggle.style.position = 'absolute';
        sidebarToggle.style.right = '-15px';
        sidebarToggle.style.top = '25px';
      }
      
      // Add event listener to handle hover on locked menu items
      const lockedItems = document.querySelectorAll('.nav-item.locked');
      lockedItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
          const lockIcon = item.querySelector('.menu-lock-icon');
          if (lockIcon instanceof HTMLElement) {
            lockIcon.style.display = 'block';
          }
          item.classList.add('hovering');
        });
        
        item.addEventListener('mouseleave', () => {
          const lockIcon = item.querySelector('.menu-lock-icon');
          if (lockIcon instanceof HTMLElement) {
            lockIcon.style.display = 'none';
          }
          item.classList.remove('hovering');
        });
      });
    }
    
    return () => {
      // Clean up event listeners if necessary
      const lockedItems = document.querySelectorAll('.nav-item.locked');
      lockedItems.forEach(item => {
        item.removeEventListener('mouseenter', () => {});
        item.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-[1000]">
      {/* Sidebar */}
      <div className="sidebar" id="sidebar">
        <div className="logo">
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
            <span style={{ color: '#00c2cb' }}>Apo</span>
            <span style={{ color: '#4f46e5' }}>Lead</span>
          </h1>
          <div className="toggle-btn" id="sidebarToggle" onClick={toggleSidebar} style={{ position: 'absolute', right: '-15px', top: '25px' }}>
            <i className="fas fa-angle-left"></i>
          </div>
        </div>
        <div className="nav-menu">
          <a href="#" className="nav-item active">
            <i className="fas fa-play-circle"></i>
            <span>Getting Started</span>
          </a>
          <a href="#" className="nav-item locked">
            <i className="fas fa-chart-pie"></i>
            <span>Dashboard</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          <a href="#" className="nav-item locked">
            <i className="fas fa-tools"></i>
            <span>Tool Page</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          <a href="#" className="nav-item locked">
            <i className="fas fa-money-bill-wave"></i>
            <span>Payment History</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          <a href="#" className="nav-item locked">
            <i className="fas fa-chart-line"></i>
            <span>Performance</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          <a href="#" className="nav-item locked">
            <i className="fas fa-trophy"></i>
            <span>Ranking</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          <a href="#" className="nav-item locked">
            <i className="fas fa-file-invoice-dollar"></i>
            <span>Billing Information</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          
          <div className="nav-divider"></div>
          
          <a href="#" className="nav-item locked">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
            <i className="fas fa-lock menu-lock-icon"></i>
          </a>
          <a href="#" className="nav-item" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </a>
          
          <div style={{ flexGrow: 1 }}></div>
        </div>
        <div className="sidebar-footer">
          <i className="fas fa-info-circle"></i> Need help? <a href="#">Support Center</a>
        </div>
      </div>
      
      {/* Add custom styles for hover states */}
      <style>
        {`
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
          
          .nav-item.locked:hover .menu-lock-icon,
          .nav-item.locked.hovering .menu-lock-icon {
            display: block !important;
          }
          
          .nav-item.locked:hover,
          .nav-item.locked.hovering {
            background-color: rgba(148, 163, 184, 0.2);
            color: #94A3B8;
            position: relative;
          }
          
          .nav-item.locked:hover i:not(.menu-lock-icon),
          .nav-item.locked:hover span,
          .nav-item.locked.hovering i:not(.menu-lock-icon),
          .nav-item.locked.hovering span {
            opacity: 0.5;
          }
          
          .sidebar.collapsed .menu-lock-icon {
            left: 50%;
            transform: translate(-50%, -50%);
          }
          
          .sidebar.collapsed .toggle-btn {
            position: absolute !important;
            right: -15px !important;
            top: 25px !important;
            background-color: white !important;
            box-shadow: 0 0 8px rgba(0,0,0,0.1) !important;
            border-radius: 50% !important;
            width: 30px !important;
            height: 30px !important;
          }
        `}
      </style>
      
      {/* Add Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    </header>
  );
};

export default Header;
