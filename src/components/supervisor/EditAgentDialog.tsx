
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: any;
  onAgentUpdated: () => void;
}

export function EditAgentDialog({ open, onOpenChange, agent, onAgentUpdated }: EditAgentDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: agent?.first_name || "",
    agent_id: agent?.agent_id || "",
    start_date: agent?.start_date ? new Date(agent.start_date) : undefined,
    supervisor: agent?.supervisor || "",
    agent_standing: agent?.agent_standing || "Active",
    application_status: agent?.application_status || "pending",
    sales_skills: agent?.sales_skills || "",
    communication_rating: agent?.communication_rating || "",
    email: agent?.email || "",
    lead_source: agent?.lead_source || "",
    supervisor_notes: agent?.supervisor_notes || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Format date for database
      const dataToSubmit = {
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, "yyyy-MM-dd") : null
      };
      
      console.log("Submitting agent update:", dataToSubmit);
      
      // Update the agent profile directly using Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update(dataToSubmit)
        .eq('user_id', agent.user_id);
      
      if (error) throw error;
      
      toast({
        title: "Agent updated",
        description: "Agent information has been successfully updated.",
      });
      
      onAgentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating agent:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the agent information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader className="px-1">
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Edit Agent Information
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4 p-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input 
                  id="agent-name" 
                  value={formData.first_name} 
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-id">Agent ID</Label>
                <Input 
                  id="agent-id" 
                  placeholder="e.g., AG-12345" 
                  value={formData.agent_id} 
                  onChange={(e) => handleChange("agent_id", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => handleChange("start_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input 
                  id="supervisor" 
                  value={formData.supervisor} 
                  onChange={(e) => handleChange("supervisor", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Agent Standing</Label>
              <RadioGroup 
                className="flex space-x-4" 
                value={formData.agent_standing}
                onValueChange={(value) => handleChange("agent_standing", value)}
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="Active" id="active" />
                  <Label htmlFor="active" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="Probation" id="probation" />
                  <Label htmlFor="probation" className="cursor-pointer">Probation</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="Waitlist" id="waitlist" />
                  <Label htmlFor="waitlist" className="cursor-pointer">Waitlist</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="application-status">Application Status</Label>
              <Select 
                value={formData.application_status}
                onValueChange={(value) => handleChange("application_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="in_training">In Training</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sales Skills</Label>
              <Select 
                value={formData.sales_skills || ""}
                onValueChange={(value) => handleChange("sales_skills", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Below Average">Below Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Communication Rating</Label>
              <Select 
                value={formData.communication_rating || ""}
                onValueChange={(value) => handleChange("communication_rating", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Below Average">Below Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lead-source">Lead Source</Label>
              <Select 
                value={formData.lead_source || ""}
                onValueChange={(value) => handleChange("lead_source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Job Board">Job Board</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Supervisor Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter notes about this agent..." 
                className="min-h-[80px]"
                value={formData.supervisor_notes} 
                onChange={(e) => handleChange("supervisor_notes", e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
