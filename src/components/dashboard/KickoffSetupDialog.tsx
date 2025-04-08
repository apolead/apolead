
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface KickoffSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

const KickoffSetupDialog: React.FC<KickoffSetupDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-600">
            Complete Final Setup
          </DialogTitle>
          <DialogDescription>
            Please complete these final steps to begin working as an ApoLead agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="border rounded-md p-4 flex items-start space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-medium">Add your banking information</h3>
              <p className="text-sm text-gray-500 mt-1">We need your banking details to process your payments.</p>
              <Link to="/billing" className="mt-3 inline-block">
                <Button variant="outline" size="sm" className="mt-2">
                  Add Banking Info <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="border rounded-md p-4 flex items-start space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-medium">Join our Discord server</h3>
              <p className="text-sm text-gray-500 mt-1">Connect with other agents and get support from our team.</p>
              <a 
                href="https://discord.gg/aZtPvxQv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-block"
              >
                <Button variant="outline" size="sm" className="mt-2">
                  Join Discord <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
          
          <div className="border rounded-md p-4 flex items-start space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-medium">Check your email regularly</h3>
              <p className="text-sm text-gray-500 mt-1">We'll send important updates and announcements via email.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={onClose}
            variant="default"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KickoffSetupDialog;
