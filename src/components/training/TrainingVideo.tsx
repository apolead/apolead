
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        setIsLoading(true);
        // Use the correct bucket name "trainingvideo" and file name "2025-03-19-14-24-06.mp4" from your screenshot
        const { data, error } = await supabase.storage
          .from('trainingvideo')
          .createSignedUrl('2025-03-19-14-24-06.mp4', 3600); // URL valid for 1 hour
        
        if (error) {
          console.error("Error fetching video:", error);
          setVideoError("There was an error loading the training video. Please try again later.");
          setIsLoading(false);
          return;
        }

        if (data) {
          console.log("Video URL fetched successfully:", data.signedUrl);
          setVideoUrl(data.signedUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in video fetch:", err);
        setVideoError("There was an error loading the training video. Please try again later.");
        setIsLoading(false);
      }
    }

    fetchVideoUrl();
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing video:", error);
            setVideoError("There was an error playing the video. Please try again.");
            setIsPlaying(false);
          });
      }
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
      
      if (calculatedProgress >= 95 && !videoCompleted) {
        setVideoCompleted(true);
        markVideoAsWatched();
      }
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    setVideoError("There was an error with the video. Please refresh the page or contact support.");
    setIsLoading(false);
  };

  const markVideoAsWatched = async () => {
    try {
      if (user) {
        await updateProfile({ training_video_watched: true });
        toast({
          title: "Video completed",
          description: "You can now proceed to the quiz"
        });
      }
    } catch (error) {
      console.error("Error marking video as watched:", error);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setVideoCompleted(true);
    onComplete();
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
            {videoError}
          </div>
        )}
        
        {videoUrl ? (
          <video 
            ref={videoRef}
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
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : !videoError && (
          <div style={{
            width: '100%',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '12px'
          }}>
            <div className="loading">{isLoading ? "Loading video..." : "Video could not be loaded."}</div>
          </div>
        )}
        
        {!isPlaying && !videoCompleted && videoUrl && (
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
