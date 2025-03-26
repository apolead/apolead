
import { useUser } from '@/contexts/UserContext';

// Role definitions
export type UserRole = 'agent' | 'supervisor' | 'admin';

export const useRole = () => {
  const { userRole } = useUser();

  // Check if user has a specific role
  const hasRole = (role: UserRole) => {
    if (!userRole) return false;
    
    // Role hierarchy: admin > supervisor > agent
    if (role === 'agent') {
      return ['agent', 'supervisor', 'admin'].includes(userRole);
    } else if (role === 'supervisor') {
      return ['supervisor', 'admin'].includes(userRole);
    } else if (role === 'admin') {
      return userRole === 'admin';
    }
    
    return false;
  };

  // Check if user has at least one of the provided roles
  const hasAnyRole = (roles: UserRole[]) => {
    return roles.some(role => hasRole(role));
  };

  return {
    userRole,
    hasRole,
    hasAnyRole,
    isAgent: hasRole('agent'),
    isSupervisor: hasRole('supervisor'),
    isAdmin: hasRole('admin'),
  };
};
