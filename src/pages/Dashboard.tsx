
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRole } from '@/hooks/useRole';
import RoleGuard from '@/components/RoleGuard';

const Dashboard = () => {
  const { user } = useUser();
  const { userRole, isAgent, isSupervisor, isAdmin } = useRole();

  return (
    <RoleGuard allowedRoles={['agent', 'supervisor', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Dashboard
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Hello {user?.email} - You are logged in as: <span className="font-semibold uppercase">{userRole}</span>
              </p>
            </div>
            
            {/* User Profile Information Card */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Your Profile Information</h4>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold uppercase">{userRole}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Agent Content - visible to all roles */}
                {isAgent && (
                  <div className="sm:col-span-6">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-blue-800">Agent Dashboard</h3>
                      <p className="mt-2 text-sm text-blue-700">
                        Welcome to your agent dashboard. Here you can view your tasks, schedule, and performance metrics.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Supervisor Content */}
                {isSupervisor && (
                  <div className="sm:col-span-6">
                    <div className="bg-purple-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-purple-800">Supervisor Tools</h3>
                      <p className="mt-2 text-sm text-purple-700">
                        As a supervisor, you have access to team management tools and performance reports.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Admin Content */}
                {isAdmin && (
                  <div className="sm:col-span-6">
                    <div className="bg-red-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-red-800">Admin Controls</h3>
                      <p className="mt-2 text-sm text-red-700">
                        As an admin, you have full access to all system settings, user management, and analytics.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Dashboard;
