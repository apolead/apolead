import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrainingVideoProps {
  onComplete: () => void;
}

const TrainingVideo: React.FC<TrainingVideoProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Preparing training video...");
  const [maxAllowedTime, setMaxAllowedTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const bucketName = 'trainingvideo';
  const filePath = 'training_one.mp4';
  
  useEffect(() => {
    let mounted = true;
    
    async function fetchVideoUrl() {
      if (!mounted) return;
      
      try {
        setIsLoading(true);
        setVideoError(null);
        setLoadingMessage("Loading training video from Supabase...");
        
        console.log("TrainingVideo: Attempting to fetch video URL from Supabase storage");
        console.log(`TrainingVideo: Bucket: ${bucketName}, File path: ${filePath}`);
        
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .createSignedUrl(filePath, 60 * 60);
        
        if (error) {
          console.error("TrainingVideo: Error fetching signed URL:", error);
          throw error;
        }
        
        if (!data?.signedUrl) {
          console.error("TrainingVideo: No signed URL returned from Supabase");
          throw new Error("Could not generate a valid URL for the training video");
        }
        
        console.log("TrainingVideo: Successfully obtained signed URL:", data.signedUrl);
        setVideoUrl(data.signedUrl);
        
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 1000);
      } catch (err) {
        console.error("TrainingVideo: Exception in video initialization:", err);
        
        if (mounted) {
          setVideoError("There was an error loading the video. Please try refreshing the page or contact support.");
          setIsLoading(false);
        }
      }
    }

    fetchVideoUrl();
    
    return () => {
      mounted = false;
    };
  }, [bucketName, filePath]);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleMetadataLoaded = () => {
      if (videoElement) {
        console.log("TrainingVideo: Video metadata loaded, duration:", videoElement.duration);
        setMaxAllowedTime(videoElement.duration * 0.05);
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
      }
    };
  }, []);

  const handlePlay = () => {
    if (videoRef.current && videoUrl) {
      console.log("TrainingVideo: Attempting to play video from URL:", videoUrl);
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("TrainingVideo: Video playing successfully");
          })
          .catch(error => {
            console.error("TrainingVideo: Error playing video:", error);
            setVideoError(`There was an error playing the video: ${error.message}. Please try again.`);
            setIsPlaying(false);
          });
      }
    } else {
      console.error("TrainingVideo: Video reference or URL is missing", {
        videoRefExists: !!videoRef.current,
        videoUrl
      });
      setVideoError("Video cannot be played. Please refresh the page.");
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      const calculatedProgress = (currentTime / duration) * 100;
      setProgress(calculatedProgress);
      
      if (currentTime > maxAllowedTime) {
        setMaxAllowedTime(currentTime + (duration * 0.05));
      }
      
      if (calculatedProgress >= 95 && !videoCompleted) {
        console.log("TrainingVideo: Video reached 95% completion");
        setVideoCompleted(true);
        markVideoAsWatched();
      }
    }
  };
  
  const handleSeeking = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime > maxAllowedTime) {
        console.log("TrainingVideo: Prevented seeking ahead", {
          attempted: videoRef.current.currentTime, 
          maxAllowed: maxAllowedTime
        });
        videoRef.current.currentTime = maxAllowedTime;
        
        toast({
          title: "Can't skip ahead",
          description: "You need to watch the entire training video",
          variant: "destructive"
        });
      }
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.target as HTMLVideoElement;
    console.error("TrainingVideo: Video error event:", {
      error: e,
      videoElement: target,
      errorCode: target.error?.code,
      errorMessage: target.error?.message,
      networkState: target.networkState,
      readyState: target.readyState,
      currentSrc: target.currentSrc
    });
    
    let errorMessage = "There was an error with the video. Please refresh the page or contact support.";
    
    if (target.error) {
      switch (target.error.code) {
        case 1: // MEDIA_ERR_ABORTED
          errorMessage = "The video playback was aborted. Please try again.";
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMessage = "A network error occurred while loading the video. Please check your connection.";
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMessage = "The video could not be decoded. Please try a different browser.";
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMessage = "The video format is not supported by your browser.";
          break;
        default:
          errorMessage = `Video error: ${target.error.message}`;
      }
    }
    
    setVideoError(errorMessage);
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
      }
    } catch (error) {
      console.error("TrainingVideo: Error marking video as watched:", error);
    }
  };

  const handleVideoEnd = () => {
    console.log("TrainingVideo: Video ended");
    setIsPlaying(false);
    setVideoCompleted(true);
    onComplete();
  };

  const handleRetry = async () => {
    console.log("TrainingVideo: Retrying video load");
    setVideoError(null);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60);
        
      if (error) {
        console.error("TrainingVideo: Error refreshing signed URL:", error);
        throw error;
      }
      
      if (!data?.signedUrl) {
        throw new Error("Could not generate a valid URL for the training video");
      }
      
      console.log("TrainingVideo: Successfully refreshed signed URL:", data.signedUrl);
      setVideoUrl(data.signedUrl);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
        }
        
        setIsLoading(false);
        
        setTimeout(() => {
          handlePlay();
        }, 500);
      }, 1000);
    } catch (err) {
      console.error("TrainingVideo: Exception in video retry:", err);
      setVideoError("There was an error reloading the video. Please try refreshing the page.");
      setIsLoading(false);
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
            <div className="loading-text">{loadingMessage}</div>
          </div>
        ) : (
          <video 
            ref={videoRef}
            src={videoUrl || undefined}
            preload="auto"
            playsInline
            style={{ 
              width: '100%', 
              display: 'block',
              borderRadius: '12px'
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            onSeeking={handleSeeking}
          >
            Your browser does not support the video tag.
          </video>
        )}
        
        {!isLoading && !isPlaying && !videoCompleted && videoUrl && (
          <div className="video-overlay" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            cursor: 'pointer'
          }} onClick={handlePlay}>
            <div className="play-button" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #00c2cb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease',
            }}>
              <i className="fas fa-play" style={{ marginLeft: '5px' }}></i>
            </div>
          </div>
        )}
        
        {isPlaying && (
          <div className="video-controls" style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '10px 20px',
            borderRadius: '50px',
            zIndex: 10
          }}>
            <button onClick={handlePause} style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}>
              <i className="fas fa-pause"></i>
            </button>
            
            <div className="progress-container" style={{
              width: '200px',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div className="progress-fill" style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
                borderRadius: '3px',
                transition: 'width 0.2s ease'
              }}></div>
            </div>
          </div>
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
