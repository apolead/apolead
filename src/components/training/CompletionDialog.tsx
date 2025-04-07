
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from 'lucide-react';

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  passThreshold: number;
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({ 
  isOpen, 
  onClose, 
  score, 
  passThreshold 
}) => {
  const passed = score >= passThreshold;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {passed ? (
              <><CheckCircle className="h-6 w-6 text-green-500" /> Training Complete!</>
            ) : (
              <><XCircle className="h-6 w-6 text-red-500" /> Training Not Completed</>
            )}
          </DialogTitle>
          <DialogDescription>
            {passed 
              ? "Congratulations! You have successfully completed the training." 
              : "You did not meet the required score to pass this training."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-lg mb-1">Your score: <span className="font-bold">{score}%</span></p>
            <p className="text-sm text-gray-600">
              {passed 
                ? "You have successfully passed this training module." 
                : `Required score: ${passThreshold}%`}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
            {passed ? "Continue" : "Try Again"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionDialog;
