
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { 
  Home, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings
} from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { 
      title: "Dashboard", 
      path: "/dashboard", 
      icon: Home
    },
    { 
      title: "Billing Information", 
      path: "/billing-information", 
      icon: DollarSign
    },
    { 
      title: "Schedule Interview", 
      path: "https://calendly.com/apolead-support/apolead-agent-interview", 
      icon: Calendar,
      external: true
    },
    { 
      title: "Privacy Policy", 
      path: "/privacy-policy", 
      icon: FileText
    },
    { 
      title: "Terms of Service", 
      path: "/terms-of-service", 
      icon: FileText
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold">ApoLead</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                >
                  {item.external ? (
                    <a href={item.path} target="_blank" rel="noopener noreferrer">
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
