
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EditAgentDialog } from "./EditAgentDialog";

export function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched agents:", data);
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error fetching agents",
        description: "There was a problem retrieving the agent list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleEditAgent = (agent) => {
    console.log("Editing agent:", agent);
    setSelectedAgent(agent);
    setEditDialogOpen(true);
  };

  const handleAgentUpdated = () => {
    fetchAgents(); // Refresh the agent list after update
    toast({
      title: "Agent updated",
      description: "The agent information has been updated successfully",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Agent Management</h1>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{agent.first_name} {agent.last_name}</td>
                    <td className="px-6 py-4">{agent.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agent.application_status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : agent.application_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agent.application_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{agent.start_date || 'Not set'}</td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAgent && (
        <EditAgentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          agent={selectedAgent}
          onAgentUpdated={handleAgentUpdated}
        />
      )}
    </div>
  );
}
