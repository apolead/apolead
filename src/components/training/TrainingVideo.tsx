
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TrainingVideoProps {
  onComplete: () => void;
}

const TrainingVideo: React.FC<TrainingVideoProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // YouTube video ID from the provided URL
  const videoId = "WYJEoLDhI2I";
  
  // Create a ref to hold the YouTube player instance
  const playerRef = React.useRef<YT.Player | null>(null);
  
  // Function to load the YouTube IFrame API
  useEffect(() => {
    // Only load the script once
    if (window.YT) {
      setPlayerReady(true);
      return;
    }
    
    console.log("TrainingVideo: Loading YouTube IFrame API");
    
    // Create script element
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    
    // Add event listeners to track loading state
    tag.onload = () => {
      console.log("TrainingVideo: YouTube IFrame API loaded successfully");
      
      // The API will call this function when the video player is ready
      window.onYouTubeIframeAPIReady = () => {
        console.log("TrainingVideo: YouTube player is ready to be initialized");
        setPlayerReady(true);
      };
    };
    
    tag.onerror = (error) => {
      console.error("TrainingVideo: Error loading YouTube IFrame API:", error);
      setVideoError("Failed to load video player. Please check your internet connection and try again.");
      setIsLoading(false);
    };
    
    // Add the script to the document
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    return () => {
      // Clean up event handler when component unmounts
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);
  
  // Initialize the YouTube player once the API is ready
  useEffect(() => {
    if (!playerReady || !window.YT || !window.YT.Player) {
      return;
    }
    
    console.log("TrainingVideo: Initializing YouTube player for video ID:", videoId);
    setIsLoading(true);
    
    try {
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
        },
        events: {
          onReady: (event) => {
            console.log("TrainingVideo: YouTube player ready event received");
            setIsLoading(false);
          },
          onStateChange: (event) => {
            // When video ends (state: 0)
            if (event.data === 0) {
              console.log("TrainingVideo: Video ended");
              setVideoCompleted(true);
              markVideoAsWatched();
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
    
    return () => {
      // Clean up the player when the component unmounts
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error("TrainingVideo: Error destroying YouTube player:", error);
        }
      }
    };
  }, [playerReady, videoId]);
  
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
    
    // Destroy and recreate the player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
        
        // Reinitialize the player after a short delay
        setTimeout(() => {
          if (window.YT && window.YT.Player) {
            playerRef.current = new window.YT.Player('youtube-player', {
              videoId: videoId,
              playerVars: {
                autoplay: 0,
                rel: 0,
                controls: 1,
                modestbranding: 1,
              },
              events: {
                onReady: () => setIsLoading(false),
                onStateChange: (event) => {
                  if (event.data === 0) {
                    setVideoCompleted(true);
                    markVideoAsWatched();
                  }
                },
                onError: (event) => {
                  setVideoError("There was an error playing the video. Please try again.");
                  setIsLoading(false);
                }
              }
            });
          } else {
            setVideoError("Video player failed to initialize. Please refresh the page.");
            setIsLoading(false);
          }
        }, 1000);
      } catch (error) {
        console.error("TrainingVideo: Error during retry:", error);
        setVideoError("Failed to reload the video. Please refresh the page.");
        setIsLoading(false);
      }
    } else {
      // If there's no player instance, just set loading to false
      setIsLoading(false);
      setVideoError("Video player not available. Please refresh the page.");
    }
  };

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

// Add TypeScript interface for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
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
      ) => {
        destroy: () => void;
        playVideo: () => void;
        pauseVideo: () => void;
        stopVideo: () => void;
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        getCurrentTime: () => number;
        getDuration: () => number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default TrainingVideo;
