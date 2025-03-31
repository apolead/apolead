
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  CreditCard,
  Calendar,
  Settings,
  FileText,
  HelpCircle
} from "lucide-react";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/dashboard")} 
                  onClick={() => navigate("/dashboard")}
                >
                  <Home size={18} />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/billing")} 
                  onClick={() => navigate("/billing")}
                >
                  <CreditCard size={18} />
                  <span>Billing Information</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* These items are placeholders for future functionality */}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Calendar size={18} />
                  <span>Schedule</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText size={18} />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings size={18} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle size={18} />
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
