
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // YouTube video ID from the provided URL
  const videoId = "WYJEoLDhI2I";
  
  // Create a ref to hold the YouTube player instance
  const playerRef = React.useRef<YTPlayer | null>(null);
  
  // Function to load the YouTube IFrame API
  useEffect(() => {
    console.log("TrainingVideo: Component mounted, loading YouTube API");
    
    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve, reject) => {
        // If already loaded, resolve immediately
        if (window.YT && window.YT.Player) {
          console.log("TrainingVideo: YouTube API already loaded");
          setApiLoaded(true);
          resolve();
          return;
        }
        
        // Create script element
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        
        // Add event listeners to track loading state
        tag.onload = () => {
          console.log("TrainingVideo: YouTube IFrame API script loaded");
          
          // Define callback for when API is ready
          window.onYouTubeIframeAPIReady = () => {
            console.log("TrainingVideo: onYouTubeIframeAPIReady called");
            setApiLoaded(true);
            resolve();
          };
        };
        
        tag.onerror = (error) => {
          console.error("TrainingVideo: Error loading YouTube IFrame API:", error);
          setVideoError("Failed to load video player. Please refresh the page and try again.");
          setIsLoading(false);
          reject(error);
        };
        
        // Add the script to the document
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      });
    };
    
    loadYouTubeAPI().catch(error => {
      console.error("TrainingVideo: Failed to load YouTube API:", error);
    });
    
    // Clean up function
    return () => {
      window.onYouTubeIframeAPIReady = undefined;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error("TrainingVideo: Error destroying player on unmount:", error);
        }
      }
    };
  }, []);
  
  // Initialize player when API is loaded
  useEffect(() => {
    if (!apiLoaded) {
      return;
    }
    
    console.log("TrainingVideo: YouTube API loaded, creating player");
    setIsLoading(true);
    
    // Use a small timeout to ensure DOM is ready
    const initTimer = setTimeout(() => {
      try {
        // Check if the container element exists
        const container = document.getElementById('youtube-player');
        if (!container) {
          console.error("TrainingVideo: Player container not found");
          setVideoError("Video player container not found. Please refresh the page.");
          setIsLoading(false);
          return;
        }
        
        console.log("TrainingVideo: Creating YouTube player with video ID:", videoId);
        
        // Ensure we only create the player once
        if (playerRef.current) {
          console.log("TrainingVideo: Player already exists, destroying previous instance");
          playerRef.current.destroy();
          playerRef.current = null;
        }
        
        // Create the player instance
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            // Auto play is disabled to give user control
            autoplay: 0,
            // Hide related videos when the video finishes
            rel: 0,
            // Show video controls
            controls: 1,
            // Disable keyboard controls
            disablekb: 0,
            // Show video info
            showinfo: 1,
            // Allow full screen
            fs: 1,
            // Set modest branding
            modestbranding: 1,
            // Set playback origin
            origin: window.location.origin,
            // Prevent seeking ahead 
            start: 0
          },
          events: {
            onReady: (event) => {
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
              // When video ends (state: 0)
              if (event.data === 0) {
                console.log("TrainingVideo: Video ended");
                setVideoCompleted(true);
                markVideoAsWatched();
              }
              
              // Start tracking progress when video is playing (state: 1)
              if (event.data === 1) {
                console.log("TrainingVideo: Video is playing");
                
                // Track video progress to prevent skipping
                const progressInterval = setInterval(() => {
                  if (playerRef.current) {
                    try {
                      const currentTime = playerRef.current.getCurrentTime();
                      setWatchTime(currentTime);
                      
                      // Log progress every 10 seconds
                      if (Math.floor(currentTime) % 10 === 0) {
                        console.log(`TrainingVideo: Progress - ${Math.floor(currentTime)}s / ${Math.floor(videoDuration)}s`);
                      }
                    } catch (error) {
                      console.error("TrainingVideo: Error tracking progress:", error);
                      clearInterval(progressInterval);
                    }
                  } else {
                    clearInterval(progressInterval);
                  }
                }, 1000);
                
                // Clean up interval when video pauses or ends
                return () => clearInterval(progressInterval);
              }
            },
            onError: (event) => {
              console.error("TrainingVideo: YouTube player error:", event);
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
            }
          }
        });
      } catch (error) {
        console.error("TrainingVideo: Exception initializing YouTube player:", error);
        setVideoError("Failed to initialize video player. Please refresh the page.");
        setIsLoading(false);
      }
    }, 500);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, [apiLoaded, videoId]);
  
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
      }
    } catch (error) {
      console.error("TrainingVideo: Error marking video as watched:", error);
    }
  };
  
  const handleRetry = () => {
    console.log("TrainingVideo: Retrying video load");
    setVideoError(null);
    setIsLoading(true);
    setApiLoaded(false);
    
    // Destroy and clean up the player if it exists
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (error) {
        console.error("TrainingVideo: Error destroying player on retry:", error);
      }
    }
    
    // Reload the API
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onload = () => {
      console.log("TrainingVideo: YouTube API reloaded");
      setApiLoaded(true);
    };
    script.onerror = () => {
      setVideoError("Failed to reload the video player. Please refresh the page.");
      setIsLoading(false);
    };
    
    // Remove any existing script first
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
  };

  // Insert a direct iframe as fallback if player doesn't initialize after 10 seconds
  useEffect(() => {
    if (isLoading && !videoError) {
      const fallbackTimer = setTimeout(() => {
        if (isLoading && !playerReady) {
          console.log("TrainingVideo: Using fallback iframe after timeout");
          
          // Create a direct iframe element
          const container = document.getElementById('youtube-player');
          if (container) {
            // Clear the container
            container.innerHTML = '';
            
            // Create and append the iframe
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.id = 'youtube-iframe-fallback';
            
            container.appendChild(iframe);
            setIsLoading(false);
            
            // Set a message to let user know they need to watch the video
            toast({
              title: "Video loaded",
              description: "Please watch the entire video before proceeding to the quiz."
            });
          }
        }
      }, 10000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isLoading, playerReady, videoId, toast]);

  return (
    <div className="training-video-container">
      <div className="video-wrapper" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {videoError && (
          <div className="video-error" style={{
            padding: '20px',
            backgroundColor: '#FEE2E2',
            color: '#EF4444',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <p>{videoError}</p>
            <button 
              onClick={handleRetry}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div style={{
            width: '100%',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            flexDirection: 'column'
          }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid #e0e0e0',
              borderTopColor: '#4f46e5',
              animation: 'spin 1s linear infinite',
              marginBottom: '10px'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="loading-text">Loading training video...</div>
          </div>
        ) : (
          // YouTube player container
          <div 
            id="youtube-player" 
            style={{ 
              width: '100%', 
              height: '315px',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          ></div>
        )}
      </div>
      
      <div className="video-description" style={{
        textAlign: 'center',
        marginTop: '25px',
        color: '#64748b'
      }}>
        <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '10px' }}>Call Center Training Basics</h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
          Watch this training video to learn the fundamentals of providing excellent customer service in a call center environment.
          <br/>You must complete watching the video to proceed to the quiz.
        </p>
        
        {videoCompleted && (
          <button
            onClick={onComplete}
            className="continue-button"
            style={{
              marginTop: '25px',
              padding: '12px 24px',
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(16,185,129,0.2)',
              width: '200px',
              margin: '25px auto 0'
            }}
          >
            <i className="fas fa-arrow-right"></i>
            Continue to Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default TrainingVideo;
