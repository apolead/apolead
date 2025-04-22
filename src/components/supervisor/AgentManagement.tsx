
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EditAgentDialog } from "./EditAgentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [quizFilter, setQuizFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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
      setFilteredAgents(data || []);
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

  useEffect(() => {
    let result = [...agents];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(agent => agent.application_status === statusFilter);
    }

    // Filter by quiz status
    if (quizFilter !== "all") {
      if (quizFilter === "passed") {
        result = result.filter(agent => agent.quiz_passed === true);
      } else if (quizFilter === "failed") {
        result = result.filter(agent => agent.quiz_passed === false);
      } else if (quizFilter === "pending") {
        result = result.filter(agent => agent.quiz_passed === null);
      }
    }

    // Filter by search term (name or email)
    if (searchTerm) {
      result = result.filter(agent => 
        `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgents(result);
  }, [agents, statusFilter, quizFilter, searchTerm]);

  const handleEditAgent = (agent) => {
    console.log("Editing agent:", agent);
    setSelectedAgent(agent);
    setEditDialogOpen(true);
  };

  const handleAgentUpdated = () => {
    fetchAgents();
    toast({
      title: "Agent updated",
      description: "The agent information has been updated successfully",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Agent Management</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={quizFilter} onValueChange={setQuizFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by quiz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quiz Status</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Not Taken</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quiz Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.first_name} {agent.last_name}</TableCell>
                    <TableCell>{agent.email || "No email"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agent.application_status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : agent.application_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agent.application_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agent.quiz_passed === true
                          ? 'bg-green-100 text-green-800'
                          : agent.quiz_passed === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agent.quiz_passed === true ? 'Passed' : agent.quiz_passed === false ? 'Failed' : 'Not Taken'}
                      </span>
                    </TableCell>
                    <TableCell>{agent.start_date || 'Not set'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
