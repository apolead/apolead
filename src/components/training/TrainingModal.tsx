
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TrainingVideo from './TrainingVideo';
import TrainingQuiz from './TrainingQuiz';
import { useAuth } from '@/hooks/useAuth';
import { DialogOverlay } from '@radix-ui/react-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (passed: boolean) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Steps: video -> quiz -> result
  const [step, setStep] = useState<'video' | 'quiz' | 'result'>('video');
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  useEffect(() => {
    if (!userProfile) return;
    
    console.log("Training Modal - Current user profile:", userProfile);
    
    // Check if quiz state is already set in the database using strict type checking
    if (userProfile.quiz_passed === true) {
      console.log("User has passed the quiz", userProfile);
      setStep('result');
      setQuizPassed(true);
      setQuizScore(userProfile.quiz_score || 0);
    } else if (userProfile.quiz_passed === false) {
      console.log("User has failed the quiz", userProfile);
      setStep('result');
      setQuizPassed(false);
      setQuizScore(userProfile.quiz_score || 0);
    } else if (userProfile.training_video_watched === true) {
      console.log("User has watched the video but not completed quiz", userProfile);
      setStep('quiz');
    } else {
      console.log("User has not watched the video yet", userProfile);
      setStep('video');
    }
  }, [userProfile]);
  
  const handleVideoComplete = async () => {
    console.log("Video completed");
    
    if (!user) return;
    
    try {
      // Mark video as watched in database
      const { error } = await updateProfile({
        training_video_watched: true
      });
      
      if (error) {
        console.error("Error updating training_video_watched status:", error);
        toast({
          title: "Error",
          description: "Failed to update training progress.",
          variant: "destructive",
        });
        return;
      }
      
      // Continue to quiz
      setStep('quiz');
    } catch (error) {
      console.error("Error in handleVideoComplete:", error);
    }
  };
  
  const handleQuizComplete = async (score: number, passed: boolean) => {
    console.log(`Quiz completed with score ${score}, passed: ${passed}`);
    
    if (!user) return;
    
    try {
      // Store quiz results in database
      const { error } = await updateProfile({
        quiz_score: score,
        quiz_passed: passed
      });
      
      if (error) {
        console.error("Error updating quiz results:", error);
        toast({
          title: "Error",
          description: "Failed to save quiz results.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setQuizScore(score);
      setQuizPassed(passed);
      setStep('result');
      
      // Notify parent component
      onComplete(passed);
      
      // If passed, show the interview scheduling option
      if (passed) {
        setShowScheduleDialog(true);
      }
    } catch (error) {
      console.error("Error in handleQuizComplete:", error);
    }
  };
  
  const handleCloseClick = () => {
    setShowScheduleDialog(false);
    onClose();
  };
  
  const renderContent = () => {
    switch (step) {
      case 'video':
        return (
          <div className="space-y-4">
            <TrainingVideo onComplete={handleVideoComplete} />
            <Button 
              onClick={handleCloseClick} 
              variant="outline" 
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        );
      case 'quiz':
        return (
          <div className="space-y-4">
            <TrainingQuiz onComplete={handleQuizComplete} />
            <Button 
              onClick={handleCloseClick} 
              variant="outline" 
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        );
      case 'result':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className={`text-3xl mb-2 font-bold ${quizPassed ? 'text-green-600' : 'text-red-600'}`}>
                {quizPassed ? 'Congratulations!' : 'Try Again Later'}
              </div>
              <p className="text-gray-700 mb-4">
                {quizPassed 
                  ? 'You have successfully passed the training quiz.' 
                  : 'Unfortunately, you did not pass the training quiz.'}
              </p>
              <div className="text-xl font-semibold">
                Your Score: <span className={quizPassed ? 'text-green-600' : 'text-red-600'}>{quizScore}%</span>
              </div>
              {quizPassed && (
                <p className="mt-4 text-gray-700">
                  You can now schedule your interview to proceed to the next step.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button onClick={handleCloseClick} variant="outline">
                Close
              </Button>
              {quizPassed && (
                <Button onClick={() => setShowScheduleDialog(true)} variant="default">
                  Schedule Interview
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'video' && 'Training Video'}
            {step === 'quiz' && 'Training Quiz'}
            {step === 'result' && 'Training Results'}
          </DialogTitle>
          <DialogDescription>
            {step === 'video' && 'Please watch the complete training video before proceeding to the quiz.'}
            {step === 'quiz' && 'Complete the quiz to test your knowledge of the training material.'}
            {step === 'result' && 'Review your training quiz results.'}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default TrainingModal;
