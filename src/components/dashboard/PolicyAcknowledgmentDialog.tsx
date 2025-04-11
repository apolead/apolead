
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check } from 'lucide-react';

interface PolicyAcknowledgmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (acknowledgmentName: string) => void;
}

const PolicyAcknowledgmentDialog = ({
  isOpen,
  onClose,
  onComplete
}: PolicyAcknowledgmentDialogProps) => {
  const [acknowledgmentName, setAcknowledgmentName] = useState('');
  const [telemarketingPolicyAcknowledged, setTelemarketingPolicyAcknowledged] = useState(false);
  const [doNotCallPolicyAcknowledged, setDoNotCallPolicyAcknowledged] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<'telemarketing' | 'doNotCall'>('telemarketing');
  const { toast } = useToast();

  const handleContinue = () => {
    if (currentPolicy === 'telemarketing') {
      if (!telemarketingPolicyAcknowledged) {
        toast({
          title: "Policy Acknowledgment Required",
          description: "You must acknowledge the Telemarketing Policy to continue.",
          variant: "destructive"
        });
        return;
      }
      setCurrentPolicy('doNotCall');
    } else {
      if (!doNotCallPolicyAcknowledged || !acknowledgmentName.trim()) {
        toast({
          title: "Incomplete Information",
          description: "You must acknowledge the Do Not Call Policy and provide your full name to continue.",
          variant: "destructive"
        });
        return;
      }
      onComplete(acknowledgmentName);
    }
  };

  const handleBack = () => {
    if (currentPolicy === 'doNotCall') {
      setCurrentPolicy('telemarketing');
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-semibold bg-gradient-to-br from-[#4f46e5] to-[#00c2cb] text-transparent bg-clip-text">
            {currentPolicy === 'telemarketing' ? 'Telemarketing Policy' : 'Do Not Call Policy'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 font-medium">
            Please read the following policy carefully before proceeding.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow my-4 max-h-[60vh] p-4 border rounded-md bg-gray-50">
          <div className="prose prose-sm max-w-none">
            {currentPolicy === 'telemarketing' ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Telemarketing Policy, Practice, and Procedure</h2>
                <h3 className="text-lg font-semibold mt-4">Purpose</h3>
                <p>This document outlines the telemarketing policy, practice, and procedure to ensure compliance with applicable telemarketing laws, including the Telephone Consumer Protection Act (TCPA) and the Telemarketing Sales Rule (TSR). Our objective is to conduct telemarketing activities in a manner that respects consumer rights and adheres to legal requirements.</p>
                
                <h3 className="text-lg font-semibold mt-4">Scope</h3>
                <p>This policy applies to all employees, contractors, and third-party vendors involved in telemarketing activities on behalf of the company.</p>
                
                <h3 className="text-lg font-semibold mt-4">Policy</h3>
                <h4 className="text-md font-medium mt-2">Compliance with Laws and Regulations</h4>
                <h5 className="text-md font-medium mt-2">Telephone Consumer Protection Act (TCPA)</h5>
                <ul className="list-disc ml-6 mt-2">
                  <li>Obtain prior express written consent before making any telemarketing call or sending a text message using an autodialer or prerecorded voice message.</li>
                  <li>Do not call numbers on the National Do Not Call Registry unless the consumer has given prior express consent or has an established business relationship with the company.</li>
                  <li>Provide an opt-out mechanism for consumers to request not to receive further calls.</li>
                </ul>
                
                <h5 className="text-md font-medium mt-2">Telemarketing Sales Rule (TSR)</h5>
                <ul className="list-disc ml-6 mt-2">
                  <li>Disclose the identity of the seller and the purpose of the call at the beginning of the telemarketing call.</li>
                  <li>Provide accurate information about the goods or services being offered.</li>
                  <li>Refrain from making false or misleading statements during telemarketing calls.</li>
                  <li>Maintain records of telemarketing transactions and consumer requests to not be called.</li>
                </ul>
                
                <h5 className="text-md font-medium mt-2">Do Not Call (DNC) List Compliance</h5>
                <ul className="list-disc ml-6 mt-2">
                  <li>Maintain an internal Do Not Call list and update it regularly to ensure compliance with consumer requests to opt-out.</li>
                  <li>Cross-reference call lists with the National Do Not Call Registry at least every 31 days.</li>
                  <li>Honor consumer opt-out requests promptly, within 30 days.</li>
                </ul>
                
                <h5 className="text-md font-medium mt-2">Calling Hours</h5>
                <ul className="list-disc ml-6 mt-2">
                  <li>Conduct telemarketing calls only between 8 AM and 9 PM local time of the called party.</li>
                  <li>Avoid calling during times when the consumer has indicated they do not wish to receive calls.</li>
                </ul>
                
                <h5 className="text-md font-medium mt-2">Call Monitoring and Recording</h5>
                <ul className="list-disc ml-6 mt-2">
                  <li>Inform consumers at the beginning of the call if the call is being monitored or recorded.</li>
                  <li>Ensure that call recordings are stored securely and accessed only by authorized personnel.</li>
                </ul>
                
                <h5 className="text-md font-medium mt-2">Training and Awareness</h5>
                <ul className="list-disc ml-6 mt-2">
                  <li>Provide regular training to employees and contractors on telemarketing laws and company policies.</li>
                  <li>Ensure that all telemarketing personnel understand the importance of compliance and the consequences of non-compliance.</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Practices</h3>
                <h4 className="text-md font-medium mt-2">Obtaining Consent</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Obtain clear and unambiguous written consent from consumers before initiating telemarketing calls.</li>
                  <li>Use opt-in mechanisms that require consumers to affirmatively agree to receive calls or messages.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Call Scripts</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Develop and use standardized call scripts that include required disclosures and ensure compliance with telemarketing laws.</li>
                  <li>Regularly review and update call scripts to reflect any changes in legal requirements or company policies.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Record-Keeping</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Maintain detailed records of consumer consent, telemarketing transactions, and opt-out requests for a minimum of five years.</li>
                  <li>Store records securely and ensure they are accessible for compliance audits and regulatory inspections.</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Procedures</h3>
                <h4 className="text-md font-medium mt-2">Handling Consumer Complaints</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Establish a procedure for receiving, investigating, and resolving consumer complaints related to telemarketing activities.</li>
                  <li>Document all complaints and actions taken to address them.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Monitoring and Auditing</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Implement a system for monitoring telemarketing calls to ensure compliance with this policy and applicable laws.</li>
                  <li>Conduct regular audits of telemarketing practices and records to identify and address any compliance issues.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Enforcement and Consequences</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Take appropriate disciplinary action against employees or contractors who violate telemarketing laws or company policies.</li>
                  <li>Terminate relationships with third-party vendors who fail to comply with telemarketing regulations.</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Conclusion</h3>
                <p>Compliance with telemarketing laws is critical to maintaining consumer trust and avoiding legal penalties. By following this policy, practice, and procedure document, we ensure that our telemarketing activities are conducted ethically and in accordance with all applicable regulations.</p>
                
                <h3 className="text-lg font-semibold mt-4">Review and Update</h3>
                <p>This document will be reviewed and updated annually or as needed to reflect changes in laws, regulations, or company practices.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Do Not Call Policy</h2>
                <h3 className="text-lg font-semibold mt-4">Introduction</h3>
                <p>Apolead is committed to protecting the privacy and preferences of our customers and potential customers. This Do Not Call (DNC) Policy outlines our procedures for complying with the Telephone Consumer Protection Act (TCPA), the Telemarketing Sales Rule (TSR), and other relevant state and federal regulations. We respect the wishes of individuals who do not want to receive telemarketing calls and have implemented measures to ensure compliance with applicable laws.</p>
                
                <h3 className="text-lg font-semibold mt-4">Policy Overview</h3>
                <h4 className="text-md font-medium mt-2">National Do Not Call Registry Compliance</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Apolead will not make telemarketing calls to numbers listed on the National Do Not Call Registry, unless the call recipient has provided prior express written consent or has an established business relationship with Apolead.</li>
                  <li>We will update our call lists every 31 days to reflect the most current Do Not Call Registry listings.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Internal Do Not Call List</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Apolead maintains an internal Do Not Call list. Any individual who requests not to receive telemarketing calls from us will be added to this list.</li>
                  <li>Requests to be added to the internal Do Not Call list will be honored within 30 days of receipt and will remain in effect indefinitely, unless the individual requests removal from the list.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">State Do Not Call Lists</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>In addition to the National Do Not Call Registry, Apolead will comply with state-specific Do Not Call lists and regulations where applicable.</li>
                  <li>We will update our call lists in accordance with state requirements to ensure compliance.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Call Time Restrictions</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Telemarketing calls will only be made between the hours of 8:00 AM and 9:00 PM local time of the call recipient, as specified by federal and state regulations.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Consent and Established Business Relationship</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Apolead will obtain prior express written consent before making telemarketing calls to individuals, unless there is an established business relationship.</li>
                  <li>Consent records will be maintained to demonstrate compliance with TCPA requirements.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Training and Compliance</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>All employees and representatives of Apolead involved in telemarketing activities will receive training on this Do Not Call Policy and relevant regulations.</li>
                  <li>Regular audits will be conducted to ensure compliance with this policy and all applicable laws.</li>
                </ul>
                
                <h4 className="text-md font-medium mt-2">Complaint Handling</h4>
                <ul className="list-disc ml-6 mt-2">
                  <li>Any complaints or inquiries regarding telemarketing practices or Do Not Call requests will be promptly investigated and addressed.</li>
                  <li>Individuals can contact Apolead at [Contact Information] to make a complaint, request to be added to the internal Do Not Call list, or ask questions about our telemarketing practices.</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Contact Information</h3>
                <p>For any questions or concerns regarding this Do Not Call Policy or to request placement on our internal Do Not Call list, please contact us at:</p>
                <p className="font-medium mt-2">Apolead<br/>support@apolead.com</p>
                
                <h3 className="text-lg font-semibold mt-4">Policy Updates</h3>
                <p>Apolead reserves the right to update or modify this Do Not Call Policy at any time. Any changes will be posted on our website and will be effective immediately upon posting.</p>
                
                <h3 className="text-lg font-semibold mt-4">Acknowledgment</h3>
                <p>By engaging in telemarketing activities on behalf of Apolead, employees and representatives acknowledge that they have read, understood, and will comply with this Do Not Call Policy and all applicable regulations.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`${currentPolicy}-policy-acknowledgment`} 
              checked={currentPolicy === 'telemarketing' ? telemarketingPolicyAcknowledged : doNotCallPolicyAcknowledged}
              onCheckedChange={currentPolicy === 'telemarketing' 
                ? setTelemarketingPolicyAcknowledged 
                : setDoNotCallPolicyAcknowledged}
            />
            <label 
              htmlFor={`${currentPolicy}-policy-acknowledgment`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I acknowledge that I have read, understood, and will comply with the {currentPolicy === 'telemarketing' ? 'Telemarketing' : 'Do Not Call'} Policy.
            </label>
          </div>

          {currentPolicy === 'doNotCall' && (
            <div className="space-y-2">
              <label htmlFor="acknowledgment-name" className="text-sm font-medium">
                Please enter your full legal name to acknowledge these policies:
              </label>
              <Input
                id="acknowledgment-name"
                value={acknowledgmentName}
                onChange={(e) => setAcknowledgmentName(e.target.value)}
                placeholder="Full Legal Name"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleBack}>
            {currentPolicy === 'telemarketing' ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white hover:shadow-lg transition-all"
          >
            {currentPolicy === 'telemarketing' ? 'Continue' : 'Acknowledge & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyAcknowledgmentDialog;
