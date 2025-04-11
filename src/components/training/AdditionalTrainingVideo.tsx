
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
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
  const maxRetries = 5; // Increased from 3 to 5
  // Track transition state to prevent multiple clicks
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Track completion attempts
  const [completionAttempts, setCompletionAttempts] = useState(0);
  const maxCompletionAttempts = 3;
  // Track if a retry is in progress to avoid overlapping retries
  const retryInProgressRef = useRef<boolean>(false);
  
  // Clean up function to safely remove video iframe
  const cleanupVideoPlayer = () => {
    try {
      if (!isMountedRef.current) return;
      
      if (videoRef.current && videoRef.current.parentNode) {
        // Use a different approach that's less prone to DOM manipulation issues
        if (containerRef.current) {
          // Create a placeholder div for the iframe
          const placeholder = document.createElement('div');
          placeholder.style.width = '100%';
          placeholder.style.height = '100%';
          
          // Replace the iframe temporarily with the placeholder
          containerRef.current.appendChild(placeholder);
          if (videoRef.current.parentNode) {
            videoRef.current.parentNode.removeChild(videoRef.current);
          }
          
          // Create a new iframe
          const newIframe = document.createElement('iframe');
          newIframe.className = "w-full h-full";
          newIframe.title = "Training Video";
          newIframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          newIframe.frameBorder = "0";
          newIframe.setAttribute("allowFullScreen", "true");
          
          // Replace the placeholder with the new iframe after a short delay
          setTimeout(() => {
            if (isMountedRef.current && placeholder.parentNode) {
              placeholder.parentNode.replaceChild(newIframe, placeholder);
              if (getYouTubeEmbedUrl(videoUrl)) {
                newIframe.src = getYouTubeEmbedUrl(videoUrl);
              }
              videoRef.current = newIframe;
            }
          }, 100);
        }
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
    
    try {
      // If video ref exists, set its src to trigger reload
      if (videoRef.current) {
        videoRef.current.src = getYouTubeEmbedUrl(videoUrl);
      }
    } catch (err) {
      console.error("Error setting video src:", err);
    }
    
    // Use timeout to simulate loading and then enable completion
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false);
        setCanComplete(true);
      }
    }, 1500);
    
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
      // Clear any ongoing retry state
      retryInProgressRef.current = false;
    };
  }, [isCompleted, videoUrl, retryCount]); // Added retryCount as dependency to trigger reload
  
  // Robust completion handler with retries
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
          // Wrap the completion logic in a retry mechanism
          const attemptCompletion = () => {
            try {
              // Use a safe approach to execute the callback
              setTimeout(() => {
                try {
                  if (isMountedRef.current && !retryInProgressRef.current) {
                    onComplete();
                  }
                } catch (innerErr) {
                  console.error("Inner completion error:", innerErr);
                  handleCompletionRetry();
                }
              }, 100);
            } catch (err) {
              console.error("Outer completion error:", err);
              handleCompletionRetry();
            }
          };
          
          attemptCompletion();
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
      console.error("Error during handleComplete:", err);
      handleCompletionRetry();
    }
  };
  
  const handleCompletionRetry = () => {
    // Avoid multiple overlapping retries
    if (retryInProgressRef.current) return;
    
    retryInProgressRef.current = true;
    const currentAttempt = completionAttempts + 1;
    setCompletionAttempts(currentAttempt);
    
    if (currentAttempt < maxCompletionAttempts) {
      // Show informative toast
      toast({
        title: "Retry in progress",
        description: `Retrying to save progress (attempt ${currentAttempt})...`,
        duration: 3000,
      });
      
      // Try again after a delay
      setTimeout(() => {
        if (!isMountedRef.current) {
          retryInProgressRef.current = false;
          return;
        }
        
        try {
          onComplete();
          // Reset the transitioning state if successful
          setIsTransitioning(false);
        } catch (retryErr) {
          console.error("Error during completion retry:", retryErr);
          
          // If still failing, show error
          if (currentAttempt >= maxCompletionAttempts - 1) {
            setError("There was an issue completing this module. Please try again.");
            toast({
              title: "Module Transition Error",
              description: "There was an issue moving to the next module. Please try again.",
              variant: "destructive",
            });
            setIsTransitioning(false);
          }
        } finally {
          retryInProgressRef.current = false;
        }
      }, 1000 * currentAttempt); // Increasing delay for each retry
    } else {
      // Reset for next attempt after showing error
      setError("There was an issue completing this module. Please try again.");
      toast({
        title: "Module Transition Error",
        description: "There was an issue moving to the next module. Please try again.",
        variant: "destructive",
      });
      setCompletionAttempts(0);
      setIsTransitioning(false);
      retryInProgressRef.current = false;
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
      toast({
        title: "Retrying...",
        description: `Attempting to complete module (try ${retryCount + 1})`,
        duration: 2000,
      });
      
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
      }, 800 * (retryCount + 1)); // Increase delay with each retry
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
      // and add retry mechanism for final continuation
      const attemptContinuation = () => {
        setTimeout(() => {
          try {
            if (isMountedRef.current) {
              onComplete();
            }
          } catch (err) {
            console.error("Error during final continuation:", err);
            
            if (retryCount < maxRetries) {
              setRetryCount(prev => prev + 1);
              toast({
                title: "Retrying...",
                description: `Attempting to complete training (try ${retryCount + 1})`,
                duration: 2000,
              });
              
              setTimeout(attemptContinuation, 1000);
            } else {
              setError("Could not complete training. Please try again.");
              setShowScorePopup(true);
              setIsTransitioning(false);
            }
          }
        }, 150);
      };
      
      attemptContinuation();
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
      
      setTimeout(() => {
        if (isMountedRef.current) {
          cleanupVideoPlayer();
          loadVideo();
        }
      }, 1000); // Wait a bit before retrying
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
  
  // Extract video ID from URL to use in embed with more robust handling
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      if (match && match[2].length === 11) {
        // Add additional parameters to improve stability
        return `https://www.youtube.com/embed/${match[2]}?autoplay=0&modestbranding=1&rel=0&enablejsapi=1`;
      }
      
      // If it doesn't match YouTube format but looks like a URL, return it
      if (url.match(/^https?:\/\//)) {
        return url;
      }
      
      // Default fallback
      console.error("Could not parse video URL:", url);
      return "about:blank";
    } catch (err) {
      console.error("Error parsing video URL:", err);
      return "about:blank"; // Safer fallback
    }
  };
  
  // Function to retry loading content manually
  const handleRetryLoading = () => {
    setRetryCount(0);
    setError(null);
    setLoading(true);
    
    // Clear and recreate the video player
    cleanupVideoPlayer();
    
    // Schedule video loading
    setTimeout(() => {
      if (isMountedRef.current) {
        loadVideo();
      }
    }, 300);
    
    toast({
      title: "Reloading content",
      description: "Attempting to reload training content...",
    });
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
          {isTransitioning ? 
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></span>
              Processing...
            </span>
            : 'Continue'}
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
        
        <div className="space-x-2 flex">
          <Button
            onClick={handleRetryLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            title="Retry loading video content if you're experiencing issues"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">Reload</span>
          </Button>
          
          <Button 
            onClick={handleComplete}
            className="bg-blue-500 text-white hover:bg-blue-600"
            variant="default"
            disabled={isTransitioning}
          >
            {isTransitioning ? 
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></span>
                Processing...
              </span>
              : getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdditionalTrainingVideo;
