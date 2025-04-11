
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdditionalTrainingVideoProps {
  videoUrl: string;
  onComplete: () => void;
  isCompleted?: boolean;
  isPending?: boolean;
  hasQuiz?: boolean;
  moduleNumber?: number;
  totalModules?: number;
}

const AdditionalTrainingVideo: React.FC<AdditionalTrainingVideoProps> = ({ 
  videoUrl, 
  onComplete,
  isCompleted = false,
  isPending = false,
  hasQuiz = true,
  moduleNumber = 1,
  totalModules = 8
}) => {
  const [canComplete, setCanComplete] = useState(true); // Set to true by default
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const videoRef = useRef<HTMLIFrameElement | null>(null);
  const isMountedRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Set mounted flag to true
    isMountedRef.current = true;
    
    // If the video is already marked as completed, allow completion
    if (isCompleted) {
      setCanComplete(true);
    }
    
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false);
        // Always enable completion
        setCanComplete(true);
      }
    }, 2000);
    
    // Cleanup function to run when component unmounts
    return () => {
      isMountedRef.current = false;
      clearTimeout(loadTimer);
    };
  }, [isCompleted]);
  
  const handleComplete = () => {
    if (!isMountedRef.current) return;
    
    if (canComplete) {
      // For the final module, show score popup
      if (moduleNumber === totalModules) {
        setShowScorePopup(true);
      } else {
        onComplete();
      }
    } else {
      setError("Please watch more of the video before continuing.");
      
      // Use the mounted ref to safely clear the timeout
      if (isMountedRef.current) {
        const errorTimer = setTimeout(() => {
          if (isMountedRef.current) {
            setError(null);
          }
        }, 3000);
        
        // Cleanup the timeout if component unmounts before timeout completes
        return () => clearTimeout(errorTimer);
      }
    }
  };
  
  const handleContinueAfterScore = () => {
    if (!isMountedRef.current) return;
    
    setShowScorePopup(false);
    onComplete();
  };
  
  const handleError = () => {
    if (!isMountedRef.current) return;
    
    setError("There was an issue loading the video. Please try again later.");
    setLoading(false);
  };
  
  // Extract video ID from URL to use in embed
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      return (match && match[2].length === 11)
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&modestbranding=1&rel=0&enablejsapi=1&origin=${window.location.origin}`
        : url; // Return original if not a valid YouTube URL
    } catch (err) {
      console.error("Error parsing YouTube URL:", err);
      return url;
    }
  };
  
  // Determine button text based on whether this module has a quiz and is the last module
  const getButtonText = () => {
    if (isCompleted) {
      if (moduleNumber === totalModules) {
        return "Submit";
      }
      return "Next Module";
    }
    if (moduleNumber === totalModules) {
      return hasQuiz ? "Submit" : "Submit";
    }
    return hasQuiz ? "Start Quiz" : "Next Module";
  };
  
  if (showScorePopup) {
    return (
      <div className="space-y-4 p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Module Completed!</h2>
        <p className="text-xl font-medium">Your Score: 100%</p>
        <p className="text-gray-600">You've successfully completed this training module.</p>
        <Button 
          onClick={handleContinueAfterScore}
          className="bg-blue-500 text-white hover:bg-blue-600 mt-4"
        >
          Continue
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4" id="training-video-container">
      <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        <iframe
          ref={videoRef}
          className="w-full h-full"
          src={getYouTubeEmbedUrl(videoUrl)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={handleError}
          onLoad={() => {
            if (isMountedRef.current) {
              setLoading(false);
            }
          }}
          title="Training Video"
        ></iframe>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center pt-2">
        <div className="text-sm text-gray-500">
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Ready to continue
          </span>
        </div>
        
        <Button 
          onClick={handleComplete}
          className="bg-blue-500 text-white hover:bg-blue-600"
          variant="default"
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default AdditionalTrainingVideo;
