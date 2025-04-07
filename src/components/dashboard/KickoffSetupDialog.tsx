
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, DiscordLogoIcon } from '@radix-ui/react-icons';

interface KickoffSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const KickoffSetupDialog: React.FC<KickoffSetupDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const handleNavigateToBilling = () => {
    navigate('/billing');
    onClose();
  };
  
  const handleOpenDiscord = () => {
    window.open("https://discord.gg/aZtPvxQv", "_blank");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Setup</DialogTitle>
          <DialogDescription>
            Please complete these final steps to get started with ApoLead.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <BanknotesIcon className="h-5 w-5" /> Add Banking Information
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter your banking details so we can process payments for your work.
            </p>
            <Button 
              onClick={handleNavigateToBilling}
              className="bg-blue-500 hover:bg-blue-600 text-sm h-9"
              size="sm"
            >
              Go to Billing Information
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <DiscordLogoIcon className="h-5 w-5" /> Join our Discord Community
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Connect with the team and other agents on our Discord server.
            </p>
            <Button 
              onClick={handleOpenDiscord}
              className="bg-indigo-600 hover:bg-indigo-700 text-sm h-9"
              size="sm"
            >
              Join Discord
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KickoffSetupDialog;
