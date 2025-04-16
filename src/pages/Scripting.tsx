
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ScriptCard from '@/components/scripting/ScriptCard';
import ScriptDialog from '@/components/scripting/ScriptDialog';
import scripts, { Script } from '@/data/scripts';
import { Search } from 'lucide-react';

const Scripting = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScripts, setFilteredScripts] = useState<Script[]>(scripts);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter scripts based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredScripts(scripts);
    } else {
      const filtered = scripts.filter(
        (script) =>
          script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          script.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          script.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          script.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScripts(filtered);
    }
  }, [searchTerm]);

  // Check if user is authorized to view this page
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    // Check if user is an agent or on probation
    if (
      userProfile && 
      userProfile.agent_standing !== 'probation' && 
      userProfile.agent_standing !== 'Probation' && 
      userProfile.agent_standing !== 'agent' && 
      userProfile.agent_standing !== 'Agent'
    ) {
      navigate('/dashboard');
    }
  }, [user, userProfile, loading, navigate]);

  const openScriptDialog = (script: Script) => {
    setSelectedScript(script);
    setIsDialogOpen(true);
  };

  const closeScriptDialog = () => {
    setIsDialogOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeItem="scripting" />
      
      <div className="flex-1 p-[20px_30px]">
        <div className="page-title flex flex-col mb-[25px]">
          <h2 className="text-[24px] font-[600] text-[#1e293b] flex items-center">
            <div className="page-title-icon mr-[12px] bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[16px]">
              <i className="fas fa-file-code"></i>
            </div>
            Scripting Library
          </h2>
          <div className="page-subtitle text-[#64748b] mt-[5px] text-[14px]">
            Access call scripts for different products and scenarios
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative max-w-md mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search scripts by product, company or type..."
            className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Script cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <ScriptCard 
              key={script.id} 
              script={script} 
              onClick={() => openScriptDialog(script)} 
            />
          ))}
        </div>

        {filteredScripts.length === 0 && (
          <div className="text-center py-10">
            <div className="text-gray-400 text-lg">No scripts found matching your search</div>
          </div>
        )}
        
        {/* Script dialog */}
        <ScriptDialog 
          script={selectedScript} 
          isOpen={isDialogOpen} 
          onClose={closeScriptDialog} 
        />
      </div>
    </div>
  );
};

export default Scripting;
