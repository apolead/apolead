
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

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
  const videoRef = useRef<HTMLIFrameElement>(null);
  // Add a ref to track component mount state
  const isMountedRef = useRef<boolean>(true);
  // Track video container element
  const containerRef = useRef<HTMLDivElement>(null);
  // Add retry mechanism state
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Clean up function to safely remove video iframe
  const cleanupVideoPlayer = () => {
    try {
      if (videoRef.current && videoRef.current.parentNode) {
        // Create a clone without event listeners to safely replace the original
        const clone = videoRef.current.cloneNode(false);
        if (videoRef.current.parentNode) {
          videoRef.current.parentNode.replaceChild(clone, videoRef.current);
        }
      }
    } catch (err) {
      console.error("Error cleaning up video player:", err);
    }
  };
  
  // Function to load/reload the video with retry mechanism
  const loadVideo = () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    // Use timeout to simulate loading and then enable completion
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false);
        setCanComplete(true);
      }
    }, 2000);
    
    return loadTimer;
  };
  
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // If the video is already marked as completed, allow completion
    if (isCompleted) {
      setCanComplete(true);
    }
    
    const loadTimer = loadVideo();
    
    // Cleanup function
    return () => {
      clearTimeout(loadTimer);
      isMountedRef.current = false;
      cleanupVideoPlayer();
    };
  }, [isCompleted, videoUrl, retryCount]); // Added retryCount as dependency to trigger reload
  
  const handleComplete = () => {
    if (!isMountedRef.current) return;
    
    if (canComplete) {
      // For the final module, show score popup
      if (moduleNumber === totalModules) {
        setShowScorePopup(true);
      } else {
        try {
          // Clean up video player before completing
          cleanupVideoPlayer();
          onComplete();
        } catch (err) {
          console.error("Error during module completion:", err);
          
          // Instead of showing error to user, retry the operation
          if (retryCount < maxRetries) {
            console.log(`Retrying module completion (attempt ${retryCount + 1})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              if (isMountedRef.current) {
                try {
                  cleanupVideoPlayer();
                  onComplete();
                } catch (retryErr) {
                  console.error("Error during retry attempt:", retryErr);
                }
              }
            }, 1000);
          } else {
            // Only after max retries, show error to user
            setError("There was an issue completing this module. Please try again.");
            toast({
              title: "Module Transition Error",
              description: "There was an issue moving to the next module. Please try again.",
              variant: "destructive",
            });
            setTimeout(() => {
              if (isMountedRef.current) {
                setError(null);
                // Reset retry counter after showing error
                setRetryCount(0);
              }
            }, 3000);
          }
        }
      }
    } else {
      setError("Please watch more of the video before continuing.");
      setTimeout(() => {
        if (isMountedRef.current) {
          setError(null);
        }
      }, 3000);
    }
  };
  
  const handleContinueAfterScore = () => {
    if (!isMountedRef.current) return;
    
    try {
      setShowScorePopup(false);
      // Clean up video player before continuing
      cleanupVideoPlayer();
      onComplete();
    } catch (err) {
      console.error("Error during score continuation:", err);
      // Auto-retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying score continuation (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (isMountedRef.current) {
            handleContinueAfterScore();
          }
        }, 1000);
      }
    }
  };
  
  const handleError = () => {
    if (!isMountedRef.current) return;
    
    console.error("Video loading error encountered");
    
    // Instead of showing error, retry loading automatically
    if (retryCount < maxRetries) {
      console.log(`Retrying video load (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
    } else {
      setError("There was an issue loading the video. Please try again later.");
      setLoading(false);
      // Reset retry counter after showing error
      setTimeout(() => {
        if (isMountedRef.current) {
          setRetryCount(0);
        }
      }, 5000);
    }
  };
  
  // Extract video ID from URL to use in embed
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      return (match && match[2].length === 11)
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&modestbranding=1&rel=0`
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
      <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden" ref={containerRef}>
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
