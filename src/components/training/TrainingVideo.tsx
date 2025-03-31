import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';

interface TrainingVideoProps {
  onComplete: () => void;
}

// Define the YouTube Player API types
interface YTPlayer {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YTPlayerOptions {
  videoId: string;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    disablekb?: number;
    rel?: number;
    fs?: number;
    modestbranding?: number;
    showinfo?: number;
    origin?: string;
  };
  events?: {
    onReady?: (event: any) => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
}

// Augment the window interface to include YouTube API
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const TrainingVideo: React.FC<TrainingVideoProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [youtubeApiScriptAdded, setYoutubeApiScriptAdded] = useState(false);
  
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // YouTube video ID from the provided URL
  const videoId = "DNv_QDiKho8";
  
  // Create a ref to hold the YouTube player instance
  const playerRef = useRef<YTPlayer | null>(null);
  // Create a ref to track if the component is mounted
  const isMountedRef = useRef(true);
  // Create a ref for the container element
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Create a ref for interval cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Create a ref for the completeButton 
  const completeButtonRef = useRef<HTMLElement | null>(null);
  
  // Check if component is unmounted
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      // Clean up on unmount
      isMountedRef.current = false;
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Clean up player if it exists
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error("Error destroying player on unmount:", error);
        }
      }
      
      // Remove YouTube API callback
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = undefined;
      }
      
      // Safely remove the complete button if it exists
      if (completeButtonRef.current && completeButtonRef.current.parentNode) {
        completeButtonRef.current.parentNode.removeChild(completeButtonRef.current);
        completeButtonRef.current = null;
      }
    };
  }, []);

  // Function to load the YouTube IFrame API
  useEffect(() => {
    console.log("TrainingVideo: Component mounted, loading YouTube API");
    
    const loadYouTubeAPI = () => {
      // If already loaded, initialize player directly
      if (window.YT && typeof window.YT.Player === 'function') {
        console.log("TrainingVideo: YouTube API already loaded");
        setApiLoaded(true);
        return;
      }
      
      // If script is already in process of loading, just wait for the callback
      if (youtubeApiScriptAdded) {
        console.log("TrainingVideo: YouTube API script already added, waiting for it to load");
        return;
      }
      
      // Set flag to prevent multiple script additions
      setYoutubeApiScriptAdded(true);
      
      // Create script element
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Add event listeners to track loading state
      tag.onload = () => {
        console.log("TrainingVideo: YouTube IFrame API script loaded");
        
        // Define callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
          console.log("TrainingVideo: onYouTubeIframeAPIReady called");
          if (isMountedRef.current) {
            setApiLoaded(true);
          }
        };
      };
      
      tag.onerror = (error) => {
        console.error("TrainingVideo: Error loading YouTube IFrame API:", error);
        if (isMountedRef.current) {
          setVideoError("Failed to load video player. Please refresh the page and try again.");
          setIsLoading(false);
          // Try fallback immediately on error
          useFallbackIframe();
        }
      };
      
      // Add the script to the document
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        // If there are no script tags, append to head
        document.head.appendChild(tag);
      }
    };
    
    loadYouTubeAPI();
  }, []);
  
  // Initialize player when API is loaded
  useEffect(() => {
    if (!apiLoaded || !isMountedRef.current) {
      return;
    }
    
    console.log("TrainingVideo: YouTube API loaded, creating player");
    
    // Make sure DOM is ready and player doesn't already exist
    if (playerRef.current) {
      console.log("TrainingVideo: Player already exists");
      return;
    }
    
    // Create player with a short delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      initializeYouTubePlayer();
    }, 500);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, [apiLoaded]);
  
  const initializeYouTubePlayer = () => {
    try {
      if (!isMountedRef.current) return;
      
      console.log("TrainingVideo: Creating YouTube player");
      
      // First check if we already have a container, if not, fallback
      if (!containerRef.current) {
        console.error("TrainingVideo: Container ref is not available");
        setVideoError("Video player container not found. Please refresh or try the fallback option.");
        setIsLoading(false);
        useFallbackIframe();
        return;
      }
      
      // We need to make sure there's a div for the player to attach to
      let playerContainer = document.getElementById('youtube-player');
      
      // Check if the element already exists and if it doesn't belong to our container
      if (playerContainer && containerRef.current && !containerRef.current.contains(playerContainer)) {
        // If it exists elsewhere, don't use it. Create a new one with a unique ID
        playerContainer = null;
      }
      
      if (!playerContainer && containerRef.current) {
        console.log("TrainingVideo: Creating player container");
        playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player';
        playerContainer.style.width = '100%';
        playerContainer.style.height = '315px';
        
        // Clear any existing content
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerContainer);
      }
      
      console.log("TrainingVideo: Creating YouTube player with video ID:", videoId);
      
      // Check if YT object and Player constructor are available
      if (!window.YT || typeof window.YT.Player !== 'function') {
        console.error("TrainingVideo: YouTube API not available");
        setVideoError("YouTube player API is not loaded properly. Using fallback player.");
        setIsLoading(false);
        useFallbackIframe();
        return;
      }
      
      if (!isMountedRef.current) return;
      
      // Create the player instance
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          controls: 1,
          disablekb: 0,
          showinfo: 1,
          fs: 1,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            if (!isMountedRef.current) return;
            
            console.log("TrainingVideo: Player ready event received");
            setPlayerReady(true);
            setIsLoading(false);
            
            // Get video duration
            try {
              const duration = event.target.getDuration();
              setVideoDuration(duration);
              console.log("TrainingVideo: Video duration:", duration);
            } catch (error) {
              console.error("TrainingVideo: Error getting video duration:", error);
            }
          },
          onStateChange: (event) => {
            if (!isMountedRef.current) return;
            
            // When video ends (state: 0)
            if (event.data === 0) {
              console.log("TrainingVideo: Video ended");
              setVideoCompleted(true);
              markVideoAsWatched();
            }
            
            // Start tracking progress when video is playing (state: 1)
            if (event.data === 1) {
              console.log("TrainingVideo: Video is playing");
              
              // Clean up any existing interval
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              
              // Track video progress to prevent skipping
              progressIntervalRef.current = setInterval(() => {
                if (!isMountedRef.current || !playerRef.current) {
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                  }
                  return;
                }
                
                try {
                  const currentTime = playerRef.current.getCurrentTime();
                  
                  // Log progress every 10 seconds
                  if (Math.floor(currentTime) % 10 === 0) {
                    console.log(`TrainingVideo: Progress - ${Math.floor(currentTime)}s / ${Math.floor(videoDuration)}s`);
                  }
                  
                  // If the user tries to skip ahead significantly (more than 30s)
                  const expectedMaxTime = watchTime + 35; // Allow some buffer
                  if (currentTime > expectedMaxTime && videoDuration > 0) {
                    console.log(`TrainingVideo: Attempting to skip ahead detected. Current: ${currentTime}, Expected: ~${watchTime}`);
                    // Move them back to where they should be
                    playerRef.current.seekTo(watchTime, true);
                    toast({
                      title: "Please watch the entire video",
                      description: "You cannot skip ahead. The video will play from your last position."
                    });
                  }
                  
                  // Update watch time AFTER the skip check
                  setWatchTime(currentTime);
                } catch (error) {
                  console.error("TrainingVideo: Error tracking progress:", error);
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                  }
                }
              }, 1000);
            }
            
            // Pause or end state - clear interval
            if (event.data === 2 || event.data === 0) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
            }
          },
          onError: (event) => {
            console.error("TrainingVideo: YouTube player error:", event);
            if (!isMountedRef.current) return;
            
            let errorMessage = "An error occurred with the video player.";
            
            // YouTube error codes: https://developers.google.com/youtube/iframe_api_reference#onError
            switch (event.data) {
              case 2:
                errorMessage = "Invalid video ID. Please contact support.";
                break;
              case 5:
                errorMessage = "The requested content cannot be played. Please try again later.";
                break;
              case 100:
                errorMessage = "The video has been removed or is private.";
                break;
              case 101:
              case 150:
                errorMessage = "The video owner doesn't allow it to be played in embedded players.";
                break;
              default:
                errorMessage = "There was an error playing the video. Please try again.";
            }
            
            setVideoError(errorMessage);
            setIsLoading(false);
            useFallbackIframe();
          }
        }
      });
    } catch (error) {
      console.error("TrainingVideo: Exception initializing YouTube player:", error);
      if (isMountedRef.current) {
        setVideoError(`Failed to initialize video player: ${error.message}`);
        setIsLoading(false);
        useFallbackIframe();
      }
    }
  };
  
  const markVideoAsWatched = async () => {
    try {
      if (user) {
        console.log("TrainingVideo: Marking video as watched for user:", user.id);
        await updateProfile({ training_video_watched: true });
        toast({
          title: "Video completed",
          description: "You can now proceed to the quiz"
        });
        onComplete();
      } else {
        console.warn("TrainingVideo: No user available to mark video as watched");
        // Still allow completion if user isn't available for some reason
        onComplete();
      }
    } catch (error) {
      console.error("TrainingVideo: Error marking video as watched:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRetry = () => {
    console.log("TrainingVideo: Retrying video load");
    setVideoError(null);
    setIsLoading(true);
    
    // Clean up the complete button if it exists
    if (completeButtonRef.current && completeButtonRef.current.parentNode) {
      completeButtonRef.current.parentNode.removeChild(completeButtonRef.current);
      completeButtonRef.current = null;
    }
    
    // Destroy and clean up the player if it exists
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (error) {
        console.error("TrainingVideo: Error destroying player on retry:", error);
      }
    }
    
    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Try to initialize the player again
    initializeYouTubePlayer();
  };

  // Function to use a direct iframe as fallback
  const useFallbackIframe = () => {
    if (!isMountedRef.current) return;
    
    console.log("TrainingVideo: Using fallback iframe");
    
    if (!containerRef.current) {
      console.error("TrainingVideo: Container ref still not available for fallback");
      return;
    }
    
    // Clear the container
    containerRef.current.innerHTML = '';
    
    // Create and append the iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`;
    iframe.width = '100%';
    iframe.height = '315px';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.id = 'youtube-iframe-fallback';
    iframe.style.borderRadius = '8px';
    
    containerRef.current.appendChild(iframe);
    setIsLoading(false);
    
    // Set a message to let user know they need to watch the video
    toast({
      title: "Video loaded",
      description: "Please watch the entire video before proceeding to the quiz."
    });
    
    // We can't track progress with a basic iframe, so add a button to mark as watched
    // But delay it to ensure they at least spend some time watching
    setTimeout(() => {
      if (!containerRef.current || !isMountedRef.current) return;
      
      // If we already have created a button, don't create another one
      if (completeButtonRef.current) return;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.textAlign = 'center';
      buttonContainer.style.marginTop = '15px';
      
      const completeButton = document.createElement('button');
      completeButton.innerText = "Mark Video as Watched";
      completeButton.className = "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors";
      
      // Store reference to the button container so we can safely remove it
      completeButtonRef.current = buttonContainer;
      
      completeButton.onclick = () => {
        if (!isMountedRef.current) return;
        setVideoCompleted(true);
        markVideoAsWatched();
      };
      
      buttonContainer.appendChild(completeButton);
      
      // Find a safe parent to add the button to
      if (containerRef.current.parentNode) {
        containerRef.current.parentNode.appendChild(buttonContainer);
      }
    }, 60000); // Only show after 1 minute
  };

  // Insert a direct iframe as fallback if player doesn't initialize after 10 seconds
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (isLoading && !videoError) {
      const fallbackTimer = setTimeout(() => {
        if (isLoading && !playerReady && isMountedRef.current) {
          console.log("TrainingVideo: Using fallback iframe after timeout");
          useFallbackIframe();
        }
      }, 10000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isLoading, playerReady]);

  return (
    <div className="training-video-container">
      <div className="max-w-2xl mx-auto">
        {videoError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Video Error</AlertTitle>
            <AlertDescription>
              <p>{videoError}</p>
              <button 
                onClick={handleRetry}
                className="mt-2 inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={16} className="mr-1" />
                Try Again
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-gray-100">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading training video...</p>
            </div>
          )}
          
          {/* Always render the container div so it's available for the player */}
          <div 
            ref={containerRef}
            className="w-full h-full"
            style={{ display: isLoading ? 'none' : 'block' }}
          ></div>
        </div>
        
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Call Center Training Basics</h3>
          <p className="text-gray-600 text-sm">
            Watch this training video to learn the fundamentals of providing excellent customer service 
            in a call center environment.
            <br/>You must complete watching the video to proceed to the quiz.
          </p>
          
          {videoCompleted && (
            <button
              onClick={onComplete}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-md 
                        hover:from-green-600 hover:to-green-700 transition-colors shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              Continue to Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingVideo;
