
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompletionDialogProps {
  open: boolean;
  onClose: () => void;
  score: number;
  passThreshold: number;
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({
  open,
  onClose,
  score,
  passThreshold = 70
}) => {
  const passed = score >= passThreshold;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={passed ? "text-green-600" : "text-red-600"}>
            Training {passed ? "Completed Successfully!" : "Not Passed"}
          </DialogTitle>
          <DialogDescription>
            {passed ? 
              "Congratulations! You've completed the training program." :
              "Unfortunately, you did not meet the minimum score requirement."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className={`rounded-lg p-6 ${passed ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex items-center justify-center mb-4">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-2xl font-bold">!</span>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              Overall Training Score
            </h3>
            <p className="text-3xl font-bold text-center mb-3">
              {score}%
            </p>
            <p className="text-center text-gray-600 text-sm">
              {passed 
                ? "You've successfully completed all the required modules." 
                : `Minimum required score: ${passThreshold}%`}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            onClick={onClose}
            variant="default"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          
          {passed && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Link to="/billing" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Add Banking Info <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a 
                href="https://discord.gg/aZtPvxQv" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto"
              >
                <Button variant="outline" className="w-full sm:w-auto">
                  Join Discord <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionDialog;
