
import React, { useState, useEffect } from 'react';
import TrainingVideo from './TrainingVideo';
import TrainingQuiz from './TrainingQuiz';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { toast } from 'sonner';

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
  
  useEffect(() => {
    // If video was already watched, go to quiz
    if (userProfile?.training_video_watched) {
      // If quiz was already taken and passed, show result
      if (userProfile?.quiz_passed) {
        setStep('result');
        setQuizPassed(true);
        setQuizScore(userProfile.quiz_score || 0);
      } else {
        setStep('quiz');
      }
    } else {
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
      
      // Show toast notification
      if (passed) {
        toast.success("Congratulations! You passed the quiz!");
      } else {
        toast.error("You didn't pass the quiz. Please review the material and try again later.");
      }
    } catch (error) {
      console.error("Error completing training:", error);
      setError("There was an error saving your quiz results. Please try again.");
    }
  };
  
  const handleCloseModal = () => {
    // Only allow closing if they've passed or we're not on the result screen
    if (quizPassed || step !== 'result') {
      onClose();
    } else {
      toast.error("You must pass the quiz to proceed.");
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg">
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
          
          {step === 'video' ? (
            <TrainingVideo onComplete={handleVideoComplete} />
          ) : step === 'quiz' ? (
            <TrainingQuiz onComplete={handleQuizComplete} />
          ) : (
            <div className="text-center py-6">
              <h3 className={`text-2xl font-bold mb-4 ${quizPassed ? 'text-green-600' : 'text-red-600'}`}>
                {quizPassed ? 'Congratulations!' : 'Quiz Failed'}
              </h3>
              <p className="text-lg mb-4">
                {quizPassed 
                  ? 'You passed the training quiz successfully!' 
                  : 'You did not pass the training quiz. Please review the materials and try again later.'}
              </p>
              <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                <p className="text-sm text-gray-600">
                  {quizPassed 
                    ? 'You answered all questions correctly!' 
                    : 'You need to answer all questions correctly to pass.'}
                </p>
              </div>
              
              {quizPassed && (
                <div className="border-t pt-6 mt-4">
                  <h4 className="text-xl font-semibold mb-2">Next Steps</h4>
                  <p className="mb-4">
                    Your training is complete! We'll be in touch soon to schedule your interview.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCloseModal}
                className={`px-6 py-2 rounded-full text-white font-medium ${
                  quizPassed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {quizPassed ? 'Continue' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;
