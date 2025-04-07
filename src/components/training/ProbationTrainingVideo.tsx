
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, FastForward } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProbationTrainingVideoProps {
  videoUrl: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

const ProbationTrainingVideo: React.FC<ProbationTrainingVideoProps> = ({ 
  videoUrl, 
  onComplete,
  isCompleted = false
}) => {
  const [canComplete, setCanComplete] = useState(isCompleted);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // If the video is already marked as completed, allow completion
    if (isCompleted) {
      setCanComplete(true);
      setLoading(false);
    }
    
    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    // For this simplified version, we'll allow completion after 1 minute 
    // In a real implementation, you'd want to use the YouTube API to track actual watch progress
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setCanComplete(true);
      }, 60000); // 60 seconds before enabling complete button
      
      return () => {
        clearTimeout(timer);
        clearTimeout(loadTimer);
      };
    }
    
    return () => clearTimeout(loadTimer);
  }, [isCompleted]);
  
  const handleComplete = () => {
    if (canComplete) {
      onComplete();
    } else {
      setError("Please watch more of the video before completing.");
      setTimeout(() => setError(null), 3000);
    }
  };
  
  const handleError = () => {
    setError("There was an issue loading the video. Please try again later.");
    setLoading(false);
  };
  
  // Extract video ID from URL to use in embed
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&modestbranding=1&rel=0`
      : url; // Return original if not a valid YouTube URL
  };
  
  return (
    <div className="space-y-4">
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
          onLoad={() => setLoading(false)}
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
          {canComplete ? (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Ready to continue
            </span>
          ) : (
            <span className="text-amber-600 flex items-center gap-1">
              <FastForward className="h-4 w-4" />
              Please watch the video before continuing
            </span>
          )}
        </div>
        
        <Button 
          onClick={handleComplete}
          disabled={!canComplete && !isCompleted}
          className="text-white"
        >
          {isCompleted ? "Continue to Quiz" : "Mark as Completed"}
        </Button>
      </div>
    </div>
  );
};

export default ProbationTrainingVideo;
