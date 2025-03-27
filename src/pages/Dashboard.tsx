
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Log Out
          </Button>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h2>
          
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-lg text-gray-700">
              Your account has been approved and you're now ready to start working with ApoLead.
            </p>
            
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dashboard content would go here */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2">Get Started</h3>
                <p className="text-sm text-gray-600">Complete your onboarding tasks to get started.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2">Training</h3>
                <p className="text-sm text-gray-600">Access your training materials here.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2">Schedule</h3>
                <p className="text-sm text-gray-600">View your upcoming schedule.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} ApoLead. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
