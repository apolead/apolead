"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast";

const SupervisorDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editAgentOpen, setEditAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/get-agents', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAgents(data);
      } catch (error) {
        console.error("Could not fetch agents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents.",
          variant: "destructive"
        });
      }
    };

    fetchAgents();
  }, [user, toast]);

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setEditAgentOpen(true);
  };

  const refreshAgents = async () => {
    try {
      const response = await fetch('/api/get-agents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAgents(data);
      toast({
        title: "Success",
        description: "Agent list refreshed successfully.",
      });
    } catch (error) {
      console.error("Could not refresh agents:", error);
      toast({
        title: "Error",
        description: "Failed to refresh agents.",
        variant: "destructive"
      });
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Edit Agent Dialog Component
  const EditAgentDialog = ({ open, setOpen, agentData, refreshAgents }) => {
    const { updateAgentProfile } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
      agent_id: agentData?.agent_id || '',
      first_name: agentData?.first_name || '',
      last_name: agentData?.last_name || '',
      start_date: agentData?.start_date || '',
      agent_standing: agentData?.agent_standing || 'Active',
      application_status: agentData?.application_status || 'Pending',
      sales_skills: agentData?.sales_skills || '',
      communication_rating: agentData?.communication_rating || '',
      email: agentData?.email || '',
      lead_source: agentData?.lead_source || '',
      supervisor_notes: agentData?.supervisor_notes || '',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Update formData if agentData changes
    useEffect(() => {
      if (agentData) {
        setFormData({
          agent_id: agentData.agent_id || '',
          first_name: agentData.first_name || '',
          last_name: agentData.last_name || '',
          start_date: agentData.start_date || '',
          agent_standing: agentData.agent_standing || 'Active',
          application_status: agentData.application_status || 'Pending',
          sales_skills: agentData.sales_skills || '',
          communication_rating: agentData.communication_rating || '',
          email: agentData.email || '',
          lead_source: agentData.lead_source || '',
          supervisor_notes: agentData.supervisor_notes || '',
        });
      }
    }, [agentData]);

    const handleInputChange = (e) => {
      const { name, value, type } = e.target;
      
      if (type === 'radio') {
        setFormData((prev) => ({
          ...prev,
          [name]: value
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value
        }));
      }
    };

    const handleSaveChanges = async () => {
      if (!agentData?.user_id) {
        toast({
          title: "Error",
          description: "No user ID found for this agent",
          variant: "destructive"
        });
        return;
      }

      try {
        setIsSubmitting(true);
        
        // Format the data for the updateAgentProfile function
        const updateData = {
          agent_id: formData.agent_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          start_date: formData.start_date ? new Date(formData.start_date) : null,
          agent_standing: formData.agent_standing,
          application_status: formData.application_status,
          sales_skills: formData.sales_skills,
          communication_rating: formData.communication_rating,
          email: formData.email,
          lead_source: formData.lead_source,
          supervisor_notes: formData.supervisor_notes,
        };
        
        // Call the updateAgentProfile function with the user_id and update data
        await updateAgentProfile(agentData.user_id, updateData);
        
        toast({
          title: "Success",
          description: "Agent information updated successfully",
        });
        
        // Close the dialog
        setOpen(false);
        
        // Refresh the agents list
        if (refreshAgents) {
          refreshAgents();
        }
      } catch (error) {
        console.error("Error updating agent profile:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update agent information",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Information</DialogTitle>
            <DialogDescription>
              Update the agent's information and click save when done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <div className="flex space-x-2">
                <Input 
                  id="first-name" 
                  name="first_name"
                  placeholder="First Name" 
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
                <Input 
                  id="last-name" 
                  name="last_name"
                  placeholder="Last Name" 
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent-id">Agent ID</Label>
              <Input 
                id="agent-id" 
                name="agent_id"
                placeholder="e.g. AG-12345" 
                value={formData.agent_id}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input 
                id="start-date" 
                name="start_date"
                type="date" 
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Input 
                id="supervisor" 
                placeholder="Supervisor Name" 
                value="Alex Wtorkowski"
                disabled
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label>Agent Standing</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="active"
                    name="agent_standing"
                    value="Active"
                    checked={formData.agent_standing === 'Active'}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="active" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="probation"
                    name="agent_standing"
                    value="Probation"
                    checked={formData.agent_standing === 'Probation'}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="probation" className="cursor-pointer">Probation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="waitlist"
                    name="agent_standing"
                    value="Waitlist"
                    checked={formData.agent_standing === 'Waitlist'}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="waitlist" className="cursor-pointer">Waitlist</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="application-status">Application Status</Label>
              <select
                id="application-status"
                name="application_status"
                value={formData.application_status}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="In Training">In Training</option>
                <option value="Active">Active</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Sales Skills</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="yes-sales"
                    name="sales_skills"
                    value="Yes"
                    checked={formData.sales_skills === 'Yes'}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="yes-sales" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="no-sales"
                    name="sales_skills"
                    value="No"
                    checked={formData.sales_skills === 'No'}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="no-sales" className="cursor-pointer">No</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="communication-rating">Communication Rating</Label>
              <select
                id="communication-rating"
                name="communication_rating"
                value={formData.communication_rating}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Rating</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
                <option value="Not Set">Not Set</option>
              </select>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input 
                id="email-address" 
                name="email"
                type="email" 
                placeholder="agent@example.com" 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="lead-source">Lead Source</Label>
              <select
                id="lead-source"
                name="lead_source"
                value={formData.lead_source}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Source</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Social Media">Social Media</option>
                <option value="Job Board">Job Board</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="supervisor-notes">Supervisor Notes</Label>
              <textarea
                id="supervisor-notes"
                name="supervisor_notes"
                placeholder="Enter notes about this agent..."
                value={formData.supervisor_notes}
                onChange={handleInputChange}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Supervisor Dashboard</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 lg:w-1/3"
        />
      </div>

      <Table>
        <TableCaption>A list of all agents.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Agent ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAgents.map((agent) => (
            <TableRow key={agent.user_id}>
              <TableCell className="font-medium">{agent.agent_id}</TableCell>
              <TableCell>{agent.first_name} {agent.last_name}</TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>{agent.agent_standing}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => handleEditAgent(agent)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditAgentDialog
        open={editAgentOpen}
        setOpen={setEditAgentOpen}
        agentData={selectedAgent}
        refreshAgents={refreshAgents}
      />
    </div>
  );
};

export default SupervisorDashboard;
