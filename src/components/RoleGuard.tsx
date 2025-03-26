
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useRole, UserRole } from '@/hooks/useRole';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
};

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = '/',
}) => {
  const { user, isLoading } = useUser();
  const { hasAnyRole } = useRole();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have the required role, redirect
  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // User has the required role, render the children
  return <>{children}</>;
};

export default RoleGuard;
