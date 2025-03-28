
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'privacy' | 'terms';
}

const TermsDialog = ({ open, onOpenChange, type }: TermsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Last updated: June 2025
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 text-sm text-gray-700">
          {type === 'privacy' ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Our Privacy Commitment</h3>
              <p>
                At ApoLead, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
              
              <h3 className="font-semibold text-lg">Information We Collect</h3>
              <p>
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create an account or user profile</li>
                <li>Apply for roles as an agent</li>
                <li>Submit government identification for verification</li>
                <li>Complete forms or surveys</li>
                <li>Participate in our training programs</li>
                <li>Communicate with our support team</li>
              </ul>
              
              <h3 className="font-semibold text-lg">How We Use Your Information</h3>
              <p>
                We may use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Processing and managing your application</li>
                <li>Verifying your identity</li>
                <li>Communicating with you about your account</li>
                <li>Providing training and support</li>
                <li>Distributing work assignments</li>
                <li>Processing payments</li>
                <li>Improving our services</li>
                <li>Complying with legal obligations</li>
              </ul>
              
              <p className="mt-6 text-xs text-gray-500">
                For the complete Privacy Policy, please visit our <Link to="/privacy-policy" className="text-indigo-600 underline" onClick={() => onOpenChange(false)}>Privacy Policy</Link> page.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Terms of Service Agreement</h3>
              <p>
                These Terms of Service ("Terms") govern your access to and use of the ApoLead platform and services. By accessing or using our services, you agree to be bound by these Terms.
              </p>
              
              <h3 className="font-semibold text-lg">Eligibility Requirements</h3>
              <p>
                To use our services, you must:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete information during registration</li>
                <li>Not have previously been removed from our platform</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Meet the technical requirements specified in the application process</li>
              </ul>
              
              <h3 className="font-semibold text-lg">User Responsibilities</h3>
              <p>
                As a user of our platform, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Comply with all policies, procedures, and guidelines</li>
                <li>Complete required training materials</li>
                <li>Provide services in a professional manner</li>
                <li>Not engage in any deceptive or fraudulent activities</li>
              </ul>
              
              <p className="mt-6 text-xs text-gray-500">
                For the complete Terms of Service, please visit our <Link to="/terms-of-service" className="text-indigo-600 underline" onClick={() => onOpenChange(false)}>Terms of Service</Link> page.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <DialogClose asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              I Understand
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
