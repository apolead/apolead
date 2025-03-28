
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'privacy' | 'terms';
}

const TermsDialog = ({ open, onOpenChange, type }: TermsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-indigo-700">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            {type === 'privacy' ? (
              <>
                <h3 className="text-lg font-semibold">Introduction</h3>
                <p>ApoLead ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
                
                <h3 className="text-lg font-semibold">Information We Collect</h3>
                <p>We may collect personal information that you voluntarily provide to us when you register with us, express an interest in obtaining information about us or our services, or otherwise contact us.</p>
                <p>The personal information we collect may include: names, email addresses, phone numbers, job titles, government ID information, and other information you choose to provide.</p>
                
                <h3 className="text-lg font-semibold">Use of Your Information</h3>
                <p>We may use the information we collect for various purposes, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>To process and manage your application</li>
                  <li>To verify your identity</li>
                  <li>To provide and maintain our services</li>
                  <li>To notify you about changes to our services</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information so that we can improve our services</li>
                  <li>To monitor the usage of our services</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Data Security</h3>
                <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
                
                <h3 className="text-lg font-semibold">Third-Party Disclosure</h3>
                <p>We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</p>
                
                <h3 className="text-lg font-semibold">Your Rights</h3>
                <p>You have the right to access, update or delete the information we have on you. Please contact us to exercise these rights.</p>
                
                <h3 className="text-lg font-semibold">Changes to This Privacy Policy</h3>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
                
                <h3 className="text-lg font-semibold">Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at support@apolead.com.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Acceptance of Terms</h3>
                <p>By accessing and using ApoLead services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
                
                <h3 className="text-lg font-semibold">User Eligibility</h3>
                <p>You must be at least 18 years old to use our services. By using our services, you represent and warrant that you meet this eligibility requirement.</p>
                
                <h3 className="text-lg font-semibold">Account Registration</h3>
                <p>To access certain features of our platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
                
                <h3 className="text-lg font-semibold">User Obligations</h3>
                <p>As a user, you agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use our services only for lawful purposes and in accordance with these Terms</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Be responsible for all activities that occur under your account</li>
                  <li>Promptly notify us of any unauthorized use of your account</li>
                  <li>Not use our services in any way that could damage, disable, overburden, or impair our services</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Remote Work Standards</h3>
                <p>If accepted as a remote worker, you agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Complete all assigned training</li>
                  <li>Maintain the equipment necessary to perform your duties</li>
                  <li>Adhere to scheduled hours and availability commitments</li>
                  <li>Maintain a professional demeanor when representing our company</li>
                  <li>Comply with all data protection and confidentiality requirements</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Intellectual Property</h3>
                <p>All content, features, and functionality of our services, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of ApoLead and are protected by copyright, trademark, and other intellectual property laws.</p>
                
                <h3 className="text-lg font-semibold">Termination</h3>
                <p>We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.</p>
                
                <h3 className="text-lg font-semibold">Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, ApoLead shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
                
                <h3 className="text-lg font-semibold">Changes to These Terms</h3>
                <p>We reserve the right to modify these Terms at any time. If we make changes, we will provide notice of such changes, such as by sending an email notification or providing notice through our services.</p>
                
                <h3 className="text-lg font-semibold">Contact Us</h3>
                <p>If you have any questions about these Terms, please contact us at support@apolead.com.</p>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
