import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function EditAgentDialog({ open, onOpenChange, agent, onAgentUpdated }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    start_date: "",
    application_status: "",
    agent_standing: "",
    sales_skills: false,
    communication_rating: "",
    lead_source: "",
    supervisor_notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (agent) {
      setFormData({
        first_name: agent.first_name || "",
        last_name: agent.last_name || "",
        email: agent.email || "",
        start_date: agent.start_date || "",
        application_status: agent.application_status || "pending",
        agent_standing: agent.agent_standing || "active",
        sales_skills: agent.sales_skills || false,
        communication_rating: agent.communication_rating || "",
        lead_source: agent.lead_source || "",
        supervisor_notes: agent.supervisor_notes || "",
      });
    }
  }, [agent]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', agent.id);

      if (error) throw error;

      onAgentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Agent Information</DialogTitle>
        </DialogHeader>
        
        {/* Add scrollable container for the form content */}
        <div className="overflow-y-auto pr-2 max-h-[calc(80vh-120px)] pb-4">
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="application_status">Application Status</Label>
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
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Agent Standing</Label>
              <RadioGroup
                value={formData.agent_standing}
                onValueChange={(value) => handleChange("agent_standing", value)}
                className="flex space-x-4 mt-1"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem id="active" value="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem id="probation" value="probation" />
                  <Label htmlFor="probation">Probation</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem id="waitlist" value="waitlist" />
                  <Label htmlFor="waitlist">Waitlist</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Sales Skills</Label>
              <RadioGroup
                value={formData.sales_skills ? "yes" : "no"}
                onValueChange={(value) => handleChange("sales_skills", value === "yes")}
                className="flex space-x-4 mt-1"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem id="yes" value="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem id="no" value="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="communication_rating">Communication Rating</Label>
              <Select
                value={formData.communication_rating}
                onValueChange={(value) => handleChange("communication_rating", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lead_source">Lead Source</Label>
              <Select
                value={formData.lead_source}
                onValueChange={(value) => handleChange("lead_source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supervisor_notes">Supervisor Notes</Label>
              <Textarea
                id="supervisor_notes"
                value={formData.supervisor_notes}
                onChange={(e) => handleChange("supervisor_notes", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
