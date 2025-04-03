
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Update local form data when agent prop changes
  React.useEffect(() => {
    if (agent) {
      setFormData({
        first_name: agent.first_name || "",
        agent_id: agent.agent_id || "",
        start_date: agent.start_date ? new Date(agent.start_date) : undefined,
        supervisor: agent.supervisor || "",
        agent_standing: agent.agent_standing || "Active",
        application_status: agent.application_status || "pending",
        sales_skills: agent.sales_skills || "",
        communication_rating: agent.communication_rating || "",
        email: agent.email || "",
        lead_source: agent.lead_source || "",
        supervisor_notes: agent.supervisor_notes || "",
      });
      // Clear validation errors when agent changes
      setValidationErrors({});
    }
  }, [agent]);
  
  const handleChange = (field: string, value: any) => {
    // Clear validation error for this field when it changes
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.first_name.trim()) {
      errors.first_name = "Agent name is required";
    }
    
    if (!formData.agent_id.trim()) {
      errors.agent_id = "Agent ID is required";
    }
    
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }
    
    if (!formData.supervisor.trim()) {
      errors.supervisor = "Supervisor name is required";
    }
    
    if (!formData.agent_standing) {
      errors.agent_standing = "Agent standing is required";
    }
    
    if (!formData.application_status) {
      errors.application_status = "Application status is required";
    }
    
    if (!formData.sales_skills) {
      errors.sales_skills = "Sales skills rating is required";
    }
    
    if (!formData.communication_rating) {
      errors.communication_rating = "Communication rating is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.lead_source) {
      errors.lead_source = "Lead source is required";
    }
    
    if (!formData.supervisor_notes.trim()) {
      errors.supervisor_notes = "Supervisor notes are required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!agent || !agent.id) {
      console.error("Missing agent data or agent ID", agent);
      toast({
        title: "Update failed",
        description: "Missing agent information. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission with proper date handling
      const dataToSubmit: Record<string, any> = { ...formData };
      
      // Format date for database - null if undefined, properly formatted string if exists
      if (dataToSubmit.start_date) {
        dataToSubmit.start_date = format(dataToSubmit.start_date, "yyyy-MM-dd");
      } else {
        dataToSubmit.start_date = null; // Use null instead of empty string
      }
      
      console.log("Submitting agent update:", {
        data: dataToSubmit,
        agentId: agent.id,
      });
      
      // Use RPC function instead of direct table update for better handling
      const { data, error } = await supabase.rpc('update_user_profile_direct', {
        input_user_id: agent.user_id,
        input_updates: dataToSubmit
      });
      
      if (error) {
        console.error("Error updating profile with RPC:", error);
        throw error;
      }
      
      console.log("Profile update response:", data);
      
      toast({
        title: "Agent updated",
        description: "Agent information has been successfully updated.",
      });
      
      onAgentUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating agent:", error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating the agent information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Compact dialog with scrollable content */}
      <DialogContent 
        className="max-w-md"
        style={{ 
          maxHeight: '85vh', 
          overflowY: 'hidden', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2 mb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Edit Agent Information
          </DialogTitle>
        </DialogHeader>
        
        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: 'calc(85vh - 150px)' }}>
          <div className="grid gap-3 px-1 py-0 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="agent-name" className="flex">
                  Agent Name
                  {validationErrors.first_name && (
                    <span className="text-red-500 ml-1 text-xs">*</span>
                  )}
                </Label>
                <Input 
                  id="agent-name" 
                  value={formData.first_name} 
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className={validationErrors.first_name ? "border-red-500" : ""}
                />
                {validationErrors.first_name && (
                  <p className="text-xs text-red-500">{validationErrors.first_name}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="agent-id" className="flex">
                  Agent ID
                  {validationErrors.agent_id && (
                    <span className="text-red-500 ml-1 text-xs">*</span>
                  )}
                </Label>
                <Input 
                  id="agent-id" 
                  placeholder="e.g., AG-12345" 
                  value={formData.agent_id} 
                  onChange={(e) => handleChange("agent_id", e.target.value)}
                  className={validationErrors.agent_id ? "border-red-500" : ""}
                />
                {validationErrors.agent_id && (
                  <p className="text-xs text-red-500">{validationErrors.agent_id}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="start-date" className="flex">
                  Start Date
                  {validationErrors.start_date && (
                    <span className="text-red-500 ml-1 text-xs">*</span>
                  )}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground",
                        validationErrors.start_date && "border-red-500"
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
                {validationErrors.start_date && (
                  <p className="text-xs text-red-500">{validationErrors.start_date}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="supervisor" className="flex">
                  Supervisor
                  {validationErrors.supervisor && (
                    <span className="text-red-500 ml-1 text-xs">*</span>
                  )}
                </Label>
                <Input 
                  id="supervisor" 
                  value={formData.supervisor} 
                  onChange={(e) => handleChange("supervisor", e.target.value)}
                  className={validationErrors.supervisor ? "border-red-500" : ""}
                />
                {validationErrors.supervisor && (
                  <p className="text-xs text-red-500">{validationErrors.supervisor}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className={`flex ${validationErrors.agent_standing ? "text-red-500" : ""}`}>
                Agent Standing
                {validationErrors.agent_standing && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
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
              {validationErrors.agent_standing && (
                <p className="text-xs text-red-500">{validationErrors.agent_standing}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="application-status" className="flex">
                Application Status
                {validationErrors.application_status && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
              <Select 
                value={formData.application_status}
                onValueChange={(value) => handleChange("application_status", value)}
              >
                <SelectTrigger className={validationErrors.application_status ? "border-red-500" : ""}>
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
              {validationErrors.application_status && (
                <p className="text-xs text-red-500">{validationErrors.application_status}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label className="flex">
                Sales Skills
                {validationErrors.sales_skills && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
              <Select 
                value={formData.sales_skills || ""}
                onValueChange={(value) => handleChange("sales_skills", value)}
              >
                <SelectTrigger className={validationErrors.sales_skills ? "border-red-500" : ""}>
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
              {validationErrors.sales_skills && (
                <p className="text-xs text-red-500">{validationErrors.sales_skills}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label className="flex">
                Communication Rating
                {validationErrors.communication_rating && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
              <Select 
                value={formData.communication_rating || ""}
                onValueChange={(value) => handleChange("communication_rating", value)}
              >
                <SelectTrigger className={validationErrors.communication_rating ? "border-red-500" : ""}>
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
              {validationErrors.communication_rating && (
                <p className="text-xs text-red-500">{validationErrors.communication_rating}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email" className="flex">
                Email Address
                {validationErrors.email && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange("email", e.target.value)}
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="lead-source" className="flex">
                Lead Source
                {validationErrors.lead_source && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
              <Select 
                value={formData.lead_source || ""}
                onValueChange={(value) => handleChange("lead_source", value)}
              >
                <SelectTrigger className={validationErrors.lead_source ? "border-red-500" : ""}>
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
              {validationErrors.lead_source && (
                <p className="text-xs text-red-500">{validationErrors.lead_source}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notes" className="flex">
                Supervisor Notes
                {validationErrors.supervisor_notes && (
                  <span className="text-red-500 ml-1 text-xs">*</span>
                )}
              </Label>
              <Textarea 
                id="notes" 
                placeholder="Enter notes about this agent..." 
                className={`min-h-[60px] ${validationErrors.supervisor_notes ? "border-red-500" : ""}`}
                value={formData.supervisor_notes || ""} 
                onChange={(e) => handleChange("supervisor_notes", e.target.value)}
              />
              {validationErrors.supervisor_notes && (
                <p className="text-xs text-red-500">{validationErrors.supervisor_notes}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Fixed footer */}
        <div className="sticky bottom-0 bg-white pt-2 mt-2 border-t flex justify-end gap-2">
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
