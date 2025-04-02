
import React from 'react';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className="dashboard-shell min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardShell;
