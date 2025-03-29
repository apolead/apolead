
import React, { useState, useEffect } from 'react';
import TrainingVideo from './TrainingVideo';
import TrainingQuiz from './TrainingQuiz';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (passed: boolean) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'video' | 'quiz'>('video');
  const { userProfile, updateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If video was already watched, go to quiz
    if (userProfile?.training_video_watched) {
      setStep('quiz');
    } else {
      setStep('video');
    }
  }, [userProfile]);
  
  const handleVideoComplete = () => {
    setStep('quiz');
  };
  
  const handleQuizComplete = async (passed: boolean, score: number) => {
    try {
      // This will be called after the quiz is submitted and results are shown
      onComplete(passed);
    } catch (error) {
      console.error("Error completing training:", error);
      setError("There was an error completing your training. Please try again.");
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg">
          <h2 className="text-xl font-semibold flex items-center">
            Initial Training: {step === 'video' ? 'Training Video' : 'Knowledge Quiz'}
          </h2>
          <button 
            onClick={onClose}
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
          ) : (
            <TrainingQuiz onComplete={handleQuizComplete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;
