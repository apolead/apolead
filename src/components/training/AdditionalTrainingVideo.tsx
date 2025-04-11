
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
  // Track transition state to prevent multiple clicks
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Clean up function to safely remove video iframe
  const cleanupVideoPlayer = () => {
    try {
      if (!isMountedRef.current) return;
      
      if (videoRef.current && videoRef.current.parentNode) {
        // Instead of direct DOM manipulation, use safer approach
        const parentNode = videoRef.current.parentNode;
        const originalSrc = videoRef.current.src;
        
        // Create a clean iframe without the event listeners
        const newIframe = document.createElement('iframe');
        newIframe.className = videoRef.current.className;
        newIframe.title = videoRef.current.title;
        newIframe.allow = videoRef.current.allow;
        newIframe.frameBorder = videoRef.current.frameBorder;
        newIframe.allowFullscreen = videoRef.current.allowFullscreen;
        
        // Only set src after attaching to prevent premature loading
        parentNode.insertBefore(newIframe, videoRef.current);
        parentNode.removeChild(videoRef.current);
        
        // Now set the src
        setTimeout(() => {
          if (isMountedRef.current && newIframe) {
            newIframe.src = originalSrc;
          }
        }, 50);
        
        // Update the ref to point to the new iframe
        videoRef.current = newIframe;
      }
    } catch (err) {
      console.error("Error cleaning up video player:", err);
      // Don't throw an error, just log it
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
      setLoading(false);
    }
    
    const loadTimer = loadVideo();
    
    // Cleanup function
    return () => {
      clearTimeout(loadTimer);
      isMountedRef.current = false;
      // Don't perform DOM operations in the cleanup phase
      // as they can cause React errors
    };
  }, [isCompleted, videoUrl, retryCount]); // Added retryCount as dependency to trigger reload
  
  const handleComplete = () => {
    if (!isMountedRef.current || isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      
      if (canComplete) {
        // For the final module, show score popup
        if (moduleNumber === totalModules) {
          setShowScorePopup(true);
          setIsTransitioning(false);
        } else {
          try {
            // Don't manipulate DOM directly just before state updates
            // this can cause React reconciliation issues
            setTimeout(() => {
              try {
                if (isMountedRef.current) {
                  onComplete();
                }
              } catch (innerErr) {
                handleTransitionError(innerErr);
              }
            }, 50);
          } catch (err) {
            handleTransitionError(err);
          }
        }
      } else {
        setError("Please watch more of the video before continuing.");
        setIsTransitioning(false);
        setTimeout(() => {
          if (isMountedRef.current) {
            setError(null);
          }
        }, 3000);
      }
    } catch (err) {
      handleTransitionError(err);
    }
  };
  
  const handleTransitionError = (err: any) => {
    console.error("Error during module transition:", err);
    
    // Reset transition state
    setIsTransitioning(false);
    
    // Implement retry mechanism
    if (retryCount < maxRetries) {
      console.log(`Retrying module completion (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        if (isMountedRef.current) {
          try {
            onComplete();
          } catch (retryErr) {
            console.error("Error during retry attempt:", retryErr);
            // If still failing after a retry, show error after a small delay
            if (retryCount >= maxRetries - 1) {
              showTransitionError();
            }
          }
        }
      }, 800);
    } else {
      showTransitionError();
    }
  };
  
  const showTransitionError = () => {
    if (!isMountedRef.current) return;
    
    setError("There was an issue completing this module. Please try again.");
    toast({
      title: "Module Transition Error",
      description: "There was an issue moving to the next module. Please try again.",
      variant: "destructive",
    });
    
    // Reset state after showing error
    setTimeout(() => {
      if (isMountedRef.current) {
        setError(null);
        setRetryCount(0);
        setIsTransitioning(false);
      }
    }, 3000);
  };
  
  const handleContinueAfterScore = () => {
    if (!isMountedRef.current || isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      setShowScorePopup(false);
      
      // Use setTimeout to ensure state updates complete before transition
      setTimeout(() => {
        try {
          if (isMountedRef.current) {
            onComplete();
          }
        } catch (err) {
          handleTransitionError(err);
        }
      }, 50);
    } catch (err) {
      handleTransitionError(err);
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
          disabled={isTransitioning}
        >
          {isTransitioning ? 'Processing...' : 'Continue'}
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
          disabled={isTransitioning}
        >
          {isTransitioning ? 'Processing...' : getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default AdditionalTrainingVideo;
