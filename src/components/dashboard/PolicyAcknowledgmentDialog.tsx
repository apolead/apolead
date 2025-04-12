
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PolicyAcknowledgmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (name: string) => Promise<void>;
}

// Format policy for better readability
const TelemarketingPolicy = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold">Telemarketing Policy, Practice, and Procedure</h2>
    
    <div>
      <h3 className="text-md font-bold">Purpose</h3>
      <p>This document outlines the telemarketing policy, practice, and procedure to ensure compliance with applicable telemarketing laws, including the Telephone Consumer Protection Act (TCPA) and the Telemarketing Sales Rule (TSR). Our objective is to conduct telemarketing activities in a manner that respects consumer rights and adheres to legal requirements.</p>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Scope</h3>
      <p>This policy applies to all employees, contractors, and third-party vendors involved in telemarketing activities on behalf of the company.</p>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Policy</h3>
      <h4 className="font-bold mt-2">Compliance with Laws and Regulations</h4>
      
      <h5 className="font-semibold mt-2">Telephone Consumer Protection Act (TCPA)</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>Obtain prior express written consent before making any telemarketing call or sending a text message using an autodialer or prerecorded voice message.</li>
        <li>Do not call numbers on the National Do Not Call Registry unless the consumer has given prior express consent or has an established business relationship with the company.</li>
        <li>Provide an opt-out mechanism for consumers to request not to receive further calls.</li>
      </ul>
      
      <h5 className="font-semibold mt-2">Telemarketing Sales Rule (TSR)</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>Disclose the identity of the seller and the purpose of the call at the beginning of the telemarketing call.</li>
        <li>Provide accurate information about the goods or services being offered.</li>
        <li>Refrain from making false or misleading statements during telemarketing calls.</li>
        <li>Maintain records of telemarketing transactions and consumer requests to not be called.</li>
      </ul>
      
      <h5 className="font-semibold mt-2">Do Not Call (DNC) List Compliance</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>Maintain an internal Do Not Call list and update it regularly to ensure compliance with consumer requests to opt-out.</li>
        <li>Cross-reference call lists with the National Do Not Call Registry at least every 31 days.</li>
        <li>Honor consumer opt-out requests promptly, within 30 days.</li>
      </ul>
      
      <h5 className="font-semibold mt-2">Calling Hours</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>Conduct telemarketing calls only between 8 AM and 9 PM local time of the called party.</li>
        <li>Avoid calling during times when the consumer has indicated they do not wish to receive calls.</li>
      </ul>
      
      <h5 className="font-semibold mt-2">Call Monitoring and Recording</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>Inform consumers at the beginning of the call if the call is being monitored or recorded.</li>
        <li>Ensure that call recordings are stored securely and accessed only by authorized personnel.</li>
      </ul>
      
      <h5 className="font-semibold mt-2">Training and Awareness</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>Provide regular training to employees and contractors on telemarketing laws and company policies.</li>
        <li>Ensure that all telemarketing personnel understand the importance of compliance and the consequences of non-compliance.</li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Practices</h3>
      
      <h4 className="font-semibold mt-2">Obtaining Consent</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Obtain clear and unambiguous written consent from consumers before initiating telemarketing calls.</li>
        <li>Use opt-in mechanisms that require consumers to affirmatively agree to receive calls or messages.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Call Scripts</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Develop and use standardized call scripts that include required disclosures and ensure compliance with telemarketing laws.</li>
        <li>Regularly review and update call scripts to reflect any changes in legal requirements or company policies.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Record-Keeping</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Maintain detailed records of consumer consent, telemarketing transactions, and opt-out requests for a minimum of five years.</li>
        <li>Store records securely and ensure they are accessible for compliance audits and regulatory inspections.</li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Procedures</h3>
      
      <h4 className="font-semibold mt-2">Handling Consumer Complaints</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Establish a procedure for receiving, investigating, and resolving consumer complaints related to telemarketing activities.</li>
        <li>Document all complaints and actions taken to address them.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Monitoring and Auditing</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Implement a system for monitoring telemarketing calls to ensure compliance with this policy and applicable laws.</li>
        <li>Conduct regular audits of telemarketing practices and records to identify and address any compliance issues.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Enforcement and Consequences</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Take appropriate disciplinary action against employees or contractors who violate telemarketing laws or company policies.</li>
        <li>Terminate relationships with third-party vendors who fail to comply with telemarketing regulations.</li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Conclusion</h3>
      <p>Compliance with telemarketing laws is critical to maintaining consumer trust and avoiding legal penalties. By following this policy, practice, and procedure document, we ensure that our telemarketing activities are conducted ethically and in accordance with all applicable regulations.</p>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Review and Update</h3>
      <p>This document will be reviewed and updated annually or as needed to reflect changes in laws, regulations, or company practices.</p>
    </div>
  </div>
);

// Format policy for better readability
const DoNotCallPolicy = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold">Do Not Call Policy</h2>
    
    <div>
      <h3 className="text-md font-bold">Introduction</h3>
      <p>Apolead is committed to protecting the privacy and preferences of our customers and potential customers. This Do Not Call (DNC) Policy outlines our procedures for complying with the Telephone Consumer Protection Act (TCPA), the Telemarketing Sales Rule (TSR), and other relevant state and federal regulations. We respect the wishes of individuals who do not want to receive telemarketing calls and have implemented measures to ensure compliance with applicable laws.</p>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Policy Overview</h3>
      
      <h4 className="font-semibold mt-2">National Do Not Call Registry Compliance</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Apolead will not make telemarketing calls to numbers listed on the National Do Not Call Registry, unless the call recipient has provided prior express written consent or has an established business relationship with Apolead.</li>
        <li>We will update our call lists every 31 days to reflect the most current Do Not Call Registry listings.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Internal Do Not Call List</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Apolead maintains an internal Do Not Call list. Any individual who requests not to receive telemarketing calls from us will be added to this list.</li>
        <li>Requests to be added to the internal Do Not Call list will be honored within 30 days of receipt and will remain in effect indefinitely, unless the individual requests removal from the list.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">State Do Not Call Lists</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>In addition to the National Do Not Call Registry, Apolead will comply with state-specific Do Not Call lists and regulations where applicable.</li>
        <li>We will update our call lists in accordance with state requirements to ensure compliance.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Call Time Restrictions</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Telemarketing calls will only be made between the hours of 8:00 AM and 9:00 PM local time of the call recipient, as specified by federal and state regulations.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Consent and Established Business Relationship</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Apolead will obtain prior express written consent before making telemarketing calls to individuals, unless there is an established business relationship.</li>
        <li>Consent records will be maintained to demonstrate compliance with TCPA requirements.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Training and Compliance</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>All employees and representatives of Apolead involved in telemarketing activities will receive training on this Do Not Call Policy and relevant regulations.</li>
        <li>Regular audits will be conducted to ensure compliance with this policy and all applicable laws.</li>
      </ul>
      
      <h4 className="font-semibold mt-2">Complaint Handling</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Any complaints or inquiries regarding telemarketing practices or Do Not Call requests will be promptly investigated and addressed.</li>
        <li>Individuals can contact Apolead at the contact information below to make a complaint, request to be added to the internal Do Not Call list, or ask questions about our telemarketing practices.</li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Contact Information</h3>
      <p>For any questions or concerns regarding this Do Not Call Policy or to request placement on our internal Do Not Call list, please contact us at:</p>
      <p className="font-semibold mt-1">Apolead</p>
      <p>support@apolead.com</p>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Policy Updates</h3>
      <p>Apolead reserves the right to update or modify this Do Not Call Policy at any time. Any changes will be posted on our website and will be effective immediately upon posting.</p>
    </div>
    
    <div>
      <h3 className="text-md font-bold">Acknowledgment</h3>
      <p>By engaging in telemarketing activities on behalf of Apolead, employees and representatives acknowledge that they have read, understood, and will comply with this Do Not Call Policy and all applicable regulations.</p>
    </div>
  </div>
);

const PolicyAcknowledgmentDialog: React.FC<PolicyAcknowledgmentDialogProps> = ({
  isOpen,
  onClose,
  onAcknowledge
}) => {
  const [activeTab, setActiveTab] = useState("telemarketing");
  const [acknowledgedTelemarketing, setAcknowledgedTelemarketing] = useState(false);
  const [acknowledgedDoNotCall, setAcknowledgedDoNotCall] = useState(false);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAcknowledge = async () => {
    if (!acknowledgedTelemarketing || !acknowledgedDoNotCall) {
      setError("You must acknowledge both policies to continue.");
      return;
    }
    if (!fullName.trim()) {
      setError("Please enter your full name to acknowledge the policies.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      await onAcknowledge(fullName);
      // The onAcknowledge function now handles showing the banking dialog
    } catch (error) {
      console.error("Error acknowledging policies:", error);
      setError("There was an error saving your acknowledgment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Policy Acknowledgment Required</DialogTitle>
          <DialogDescription>
            Before you can continue, you must review and acknowledge our policies. Please read each policy carefully.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="telemarketing" className="flex items-center gap-2">
              {acknowledgedTelemarketing && <Check size={16} className="text-green-500" />}
              Telemarketing Policy
            </TabsTrigger>
            <TabsTrigger value="donotcall" className="flex items-center gap-2">
              {acknowledgedDoNotCall && <Check size={16} className="text-green-500" />}
              Do Not Call Policy
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="telemarketing" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <ScrollArea className="border rounded-md p-4 flex-1 bg-slate-50 overflow-y-auto">
              <TelemarketingPolicy />
            </ScrollArea>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="telemarketing-acknowledgment" 
                checked={acknowledgedTelemarketing} 
                onCheckedChange={checked => setAcknowledgedTelemarketing(checked === true)} 
              />
              <Label htmlFor="telemarketing-acknowledgment" className="text-sm">
                I acknowledge that I have read, understood, and will comply with the Telemarketing Policy
              </Label>
            </div>
          </TabsContent>
          
          <TabsContent value="donotcall" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <ScrollArea className="border rounded-md p-4 flex-1 bg-slate-50 overflow-y-auto">
              <DoNotCallPolicy />
            </ScrollArea>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="donotcall-acknowledgment" 
                checked={acknowledgedDoNotCall} 
                onCheckedChange={checked => setAcknowledgedDoNotCall(checked === true)} 
              />
              <Label htmlFor="donotcall-acknowledgment" className="text-sm">
                I acknowledge that I have read, understood, and will comply with the Do Not Call Policy
              </Label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Label htmlFor="full-name">Enter your full legal name to acknowledge these policies:</Label>
          <Input 
            id="full-name" 
            placeholder="Your Full Name" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            className="mt-1" 
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button 
            variant="default" 
            onClick={handleAcknowledge} 
            disabled={submitting || !acknowledgedTelemarketing || !acknowledgedDoNotCall || !fullName.trim()} 
            className="text-neutral-50"
          >
            {submitting ? "Submitting..." : "I Acknowledge & Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyAcknowledgmentDialog;
