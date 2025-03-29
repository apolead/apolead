
import React, { useState, useEffect } from 'react';
import TrainingVideo from './TrainingVideo';
import TrainingQuiz from './TrainingQuiz';
import { useAuth } from '@/hooks/useAuth';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (passed: boolean) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'video' | 'quiz'>('video');
  const { userProfile, updateProfile } = useAuth();
  
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
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal" style={{
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 1,
      transition: 'opacity 0.3s ease'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease'
      }}>
        <div className="modal-header" style={{
          padding: '20px 25px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #4169E1, #00CED1)',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-book-reader" style={{ marginRight: '10px' }}></i> 
            Initial Training: {step === 'video' ? 'Training Video' : 'Knowledge Quiz'}
          </h2>
          <span 
            className="close-modal" 
            onClick={onClose}
            style={{ 
              fontSize: '24px', 
              cursor: 'pointer', 
              color: 'white', 
              opacity: 0.8, 
              transition: 'opacity 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}
          >
            &times;
          </span>
        </div>
        
        <div className="modal-body" style={{ padding: '30px' }}>
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
