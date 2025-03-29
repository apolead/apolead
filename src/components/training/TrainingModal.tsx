
import React, { useState, useEffect } from 'react';
import TrainingVideo from './TrainingVideo';
import TrainingQuiz from './TrainingQuiz';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (passed: boolean) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'video' | 'quiz' | 'result'>('video');
  const { userProfile, updateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  useEffect(() => {
    // Check if quiz state is already set in the database - use strict equality checks
    if (userProfile?.quiz_passed === true) {
      console.log("User has passed the quiz", userProfile);
      setStep('result');
      setQuizPassed(true);
      setQuizScore(userProfile.quiz_score || 0);
    } else if (userProfile?.quiz_passed === false) {
      console.log("User has failed the quiz", userProfile);
      setStep('result');
      setQuizPassed(false);
      setQuizScore(userProfile.quiz_score || 0);
    } else if (userProfile?.training_video_watched === true) {
      console.log("User has watched the video but not completed quiz", userProfile);
      setStep('quiz');
    } else {
      console.log("User has not started training yet", userProfile);
      setStep('video');
    }
  }, [userProfile]);
  
  const handleVideoComplete = async () => {
    try {
      // Mark the video as watched in the database
      await updateProfile({
        training_video_watched: true
      });
      setStep('quiz');
    } catch (error) {
      console.error("Error updating training video status:", error);
      setError("There was an error saving your progress. Please try again.");
    }
  };
  
  const handleContinueToQuiz = () => {
    setStep('quiz');
  };
  
  const handleQuizComplete = async (passed: boolean, score: number) => {
    try {
      setQuizPassed(passed);
      setQuizScore(score);
      
      // Update user profile with quiz results
      await updateProfile({
        quiz_passed: passed,
        quiz_score: score
      });
      
      // Set step to result to show final screen
      setStep('result');
      
      // Call the onComplete callback to update parent component
      onComplete(passed);
      
      // If passed, show the schedule interview dialog
      if (passed) {
        setShowScheduleDialog(true);
      }
    } catch (error) {
      console.error("Error completing training:", error);
      setError("There was an error saving your quiz results. Please try again.");
    }
  };
  
  const handleCloseModal = () => {
    onClose();
  };
  
  const handleScheduleInterview = () => {
    setShowScheduleDialog(true);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
          (quizPassed === true) 
            ? 'bg-gradient-to-r from-green-600 to-green-500' 
            : (quizPassed === false)
              ? 'bg-gradient-to-r from-red-600 to-red-500'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500'
        } text-white rounded-t-lg`}>
          <h2 className="text-xl font-semibold flex items-center">
            {step === 'video' && 'Initial Training: Training Video'}
            {step === 'quiz' && 'Initial Training: Knowledge Quiz'}
            {step === 'result' && `Quiz Result: ${quizPassed ? 'Passed' : 'Failed'}`}
          </h2>
          <button 
            onClick={handleCloseModal}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Only show the video and quiz for users who haven't completed training */}
          {step === 'video' && quizPassed === null && (
            <>
              <TrainingVideo onComplete={handleVideoComplete} />
              {userProfile?.training_video_watched === true && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleContinueToQuiz} className="text-white">
                    Continue to Quiz
                  </Button>
                </div>
              )}
            </>
          )}
          
          {step === 'quiz' && quizPassed === null && (
            <TrainingQuiz onComplete={handleQuizComplete} />
          )}
          
          {/* Always show result if we're at the result step */}
          {step === 'result' && (
            <div className="text-center py-6">
              {quizPassed ? (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-600">
                    Congratulations!
                  </h3>
                  <p className="text-lg mb-4">
                    You passed the training quiz successfully!
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                    <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                    <p className="text-sm text-gray-600">
                      You answered all questions correctly!
                    </p>
                  </div>
                  
                  <div className="border-t pt-6 mt-4">
                    <h4 className="text-xl font-semibold mb-2">Next Steps</h4>
                    <p className="mb-4">
                      Your training is complete! You can now schedule your interview.
                    </p>
                    <Button 
                      onClick={handleScheduleInterview}
                      className="px-6 py-2 rounded-full text-white font-medium mt-2 bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Schedule Interview
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <XCircle className="h-20 w-20 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">
                    Unfortunately
                  </h3>
                  <p className="text-lg mb-4">
                    You did not pass the training quiz.
                  </p>
                  <p className="text-md mb-6">
                    You cannot move forward in the application process.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                    <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                    <p className="text-sm text-gray-600">
                      You need to answer all questions correctly to pass.
                    </p>
                  </div>
                </>
              )}
              
              <button
                onClick={handleCloseModal}
                className={`px-6 py-2 rounded-full text-white font-medium mt-6 ${
                  quizPassed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Scheduling Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Your Interview</DialogTitle>
            <DialogDescription>
              Please select a date and time that works for you.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full h-[500px] border rounded-lg mt-4">
            <iframe 
              src="https://calendly.com/embedded-widget" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              title="Schedule Interview"
              className="rounded-lg"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingModal;
