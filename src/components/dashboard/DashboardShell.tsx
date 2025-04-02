
import React from 'react';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className="dashboard-shell">
      {children}
    </div>
  );
};

export default DashboardShell;
