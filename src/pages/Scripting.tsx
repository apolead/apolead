
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Scripting = () => {
  const { userProfile } = useAuth();

  // Check if user has proper access
  if (!userProfile || !['probation', 'agent'].includes(userProfile.agent_standing || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Scripting Resources</h1>
      <p>Welcome to the scripting resources page. Here you will find various scripts and guides to help you with your conversations.</p>
    </div>
  );
};

export default Scripting;
