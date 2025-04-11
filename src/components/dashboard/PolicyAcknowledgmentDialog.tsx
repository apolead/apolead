
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

const telemarketing_policy = `
**Telemarketing Policy, Practice, and Procedure**

**Purpose**
This document outlines the telemarketing policy, practice, and procedure to ensure compliance with applicable telemarketing laws, including the Telephone Consumer Protection Act (TCPA) and the Telemarketing Sales Rule (TSR). Our objective is to conduct telemarketing activities in a manner that respects consumer rights and adheres to legal requirements.

**Scope**
This policy applies to all employees, contractors, and third-party vendors involved in telemarketing activities on behalf of the company.

**Policy**

**Compliance with Laws and Regulations**

*Telephone Consumer Protection Act (TCPA)*
• Obtain prior express written consent before making any telemarketing call or sending a text message using an autodialer or prerecorded voice message.
• Do not call numbers on the National Do Not Call Registry unless the consumer has given prior express consent or has an established business relationship with the company.
• Provide an opt-out mechanism for consumers to request not to receive further calls.

*Telemarketing Sales Rule (TSR)*
• Disclose the identity of the seller and the purpose of the call at the beginning of the telemarketing call.
• Provide accurate information about the goods or services being offered.
• Refrain from making false or misleading statements during telemarketing calls.
• Maintain records of telemarketing transactions and consumer requests to not be called.

**Do Not Call (DNC) List Compliance**
• Maintain an internal Do Not Call list and update it regularly to ensure compliance with consumer requests to opt-out.
• Cross-reference call lists with the National Do Not Call Registry at least every 31 days.
• Honor consumer opt-out requests promptly, within 30 days.

**Calling Hours**
• Conduct telemarketing calls only between 8 AM and 9 PM local time of the called party.
• Avoid calling during times when the consumer has indicated they do not wish to receive calls.

**Call Monitoring and Recording**
• Inform consumers at the beginning of the call if the call is being monitored or recorded.
• Ensure that call recordings are stored securely and accessed only by authorized personnel.

**Training and Awareness**
• Provide regular training to employees and contractors on telemarketing laws and company policies.
• Ensure that all telemarketing personnel understand the importance of compliance and the consequences of non-compliance.

**Practices**

**Obtaining Consent**
• Obtain clear and unambiguous written consent from consumers before initiating telemarketing calls.
• Use opt-in mechanisms that require consumers to affirmatively agree to receive calls or messages.

**Call Scripts**
• Develop and use standardized call scripts that include required disclosures and ensure compliance with telemarketing laws.
• Regularly review and update call scripts to reflect any changes in legal requirements or company policies.

**Record-Keeping**
• Maintain detailed records of consumer consent, telemarketing transactions, and opt-out requests for a minimum of five years.
• Store records securely and ensure they are accessible for compliance audits and regulatory inspections.

**Procedures**

**Handling Consumer Complaints**
• Establish a procedure for receiving, investigating, and resolving consumer complaints related to telemarketing activities.
• Document all complaints and actions taken to address them.

**Monitoring and Auditing**
• Implement a system for monitoring telemarketing calls to ensure compliance with this policy and applicable laws.
• Conduct regular audits of telemarketing practices and records to identify and address any compliance issues.

**Enforcement and Consequences**
• Take appropriate disciplinary action against employees or contractors who violate telemarketing laws or company policies.
• Terminate relationships with third-party vendors who fail to comply with telemarketing regulations.

**Conclusion**
Compliance with telemarketing laws is critical to maintaining consumer trust and avoiding legal penalties. By following this policy, practice, and procedure document, we ensure that our telemarketing activities are conducted ethically and in accordance with all applicable regulations.

**Review and Update**
This document will be reviewed and updated annually or as needed to reflect changes in laws, regulations, or company practices.`;

const do_not_call_policy = `
**Do Not Call Policy**

**Introduction**
Apolead is committed to protecting the privacy and preferences of our customers and potential customers. This Do Not Call (DNC) Policy outlines our procedures for complying with the Telephone Consumer Protection Act (TCPA), the Telemarketing Sales Rule (TSR), and other relevant state and federal regulations. We respect the wishes of individuals who do not want to receive telemarketing calls and have implemented measures to ensure compliance with applicable laws.

**Policy Overview**

**National Do Not Call Registry Compliance**
• Apolead will not make telemarketing calls to numbers listed on the National Do Not Call Registry, unless the call recipient has provided prior express written consent or has an established business relationship with Apolead.
• We will update our call lists every 31 days to reflect the most current Do Not Call Registry listings.

**Internal Do Not Call List**
• Apolead maintains an internal Do Not Call list. Any individual who requests not to receive telemarketing calls from us will be added to this list.
• Requests to be added to the internal Do Not Call list will be honored within 30 days of receipt and will remain in effect indefinitely, unless the individual requests removal from the list.

**State Do Not Call Lists**
• In addition to the National Do Not Call Registry, Apolead will comply with state-specific Do Not Call lists and regulations where applicable.
• We will update our call lists in accordance with state requirements to ensure compliance.

**Call Time Restrictions**
• Telemarketing calls will only be made between the hours of 8:00 AM and 9:00 PM local time of the call recipient, as specified by federal and state regulations.

**Consent and Established Business Relationship**
• Apolead will obtain prior express written consent before making telemarketing calls to individuals, unless there is an established business relationship.
• Consent records will be maintained to demonstrate compliance with TCPA requirements.

**Training and Compliance**
• All employees and representatives of Apolead involved in telemarketing activities will receive training on this Do Not Call Policy and relevant regulations.
• Regular audits will be conducted to ensure compliance with this policy and all applicable laws.

**Complaint Handling**
• Any complaints or inquiries regarding telemarketing practices or Do Not Call requests will be promptly investigated and addressed.
• Individuals can contact Apolead at support@apolead.com to make a complaint, request to be added to the internal Do Not Call list, or ask questions about our telemarketing practices.

**Contact Information**
For any questions or concerns regarding this Do Not Call Policy or to request placement on our internal Do Not Call list, please contact us at:
Apolead
support@apolead.com

**Policy Updates**
Apolead reserves the right to update or modify this Do Not Call Policy at any time. Any changes will be posted on our website and will be effective immediately upon posting.

**Acknowledgment**
By engaging in telemarketing activities on behalf of Apolead, employees and representatives acknowledge that they have read, understood, and will comply with this Do Not Call Policy and all applicable regulations.`;

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
      onClose();
    } catch (error) {
      console.error("Error acknowledging policies:", error);
      setError("There was an error saving your acknowledgment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return <Dialog open={isOpen} onOpenChange={open => {
    if (!open) onClose();
  }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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
          
          <TabsContent value="telemarketing" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="border rounded-md p-4 h-[400px] bg-slate-50">
              <div className="policy-content prose max-w-none whitespace-pre-line">
                {telemarketing_policy}
              </div>
            </ScrollArea>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="telemarketing-acknowledgment" checked={acknowledgedTelemarketing} onCheckedChange={checked => setAcknowledgedTelemarketing(checked === true)} />
              <Label htmlFor="telemarketing-acknowledgment" className="text-sm">
                I acknowledge that I have read, understood, and will comply with the Telemarketing Policy
              </Label>
            </div>
          </TabsContent>
          
          <TabsContent value="donotcall" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="border rounded-md p-4 h-[400px] bg-slate-50">
              <div className="policy-content prose max-w-none whitespace-pre-line">
                {do_not_call_policy}
              </div>
            </ScrollArea>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="donotcall-acknowledgment" checked={acknowledgedDoNotCall} onCheckedChange={checked => setAcknowledgedDoNotCall(checked === true)} />
              <Label htmlFor="donotcall-acknowledgment" className="text-sm">
                I acknowledge that I have read, understood, and will comply with the Do Not Call Policy
              </Label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Label htmlFor="full-name">Enter your full legal name to acknowledge these policies:</Label>
          <Input id="full-name" placeholder="Your Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
        </div>

        {error && <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>}

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="default" onClick={handleAcknowledge} disabled={submitting || !acknowledgedTelemarketing || !acknowledgedDoNotCall || !fullName.trim()} className="text-neutral-50">
            {submitting ? "Submitting..." : "I Acknowledge & Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};

export default PolicyAcknowledgmentDialog;
