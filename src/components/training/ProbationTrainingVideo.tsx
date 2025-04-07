
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface ProbationTrainingVideoProps {
  videoUrl: string;
  onComplete: () => void;
  title: string;
}

const ProbationTrainingVideo: React.FC<ProbationTrainingVideoProps> = ({ videoUrl, onComplete, title }) => {
  const [videoWatched, setVideoWatched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  
  const videoId = extractVideoId(videoUrl);
  
  // Allow marking as watched after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoWatched(true);
    }, 15000); // 15 seconds minimum for demo purposes
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!videoId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid Video URL</AlertTitle>
        <AlertDescription>
          The video link provided is not valid. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
          <iframe 
            width="100%" 
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
        
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          
          <div className="mt-6">
            {videoWatched ? (
              <Button
                onClick={onComplete}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Continue to Quiz
              </Button>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Please watch the video before proceeding...
              </p>
            )}
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> 
              Open in YouTube
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProbationTrainingVideo;
