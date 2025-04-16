import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Play, Search, Clock, Star, Link as LinkIcon, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Add TypeScript declaration for YouTube player ended callback
declare global {
  interface Window {
    onYouTubePlayerEnded: () => void;
  }
}

const AdditionalTraining: React.FC = () => {
  const {
    userProfile,
    updateProfile
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({
    id: '',
    title: '',
    watchStatusColumn: ''
  });
  const videoFrameRef = useRef<HTMLIFrameElement>(null);
  
  const trainingVideos = [
    {
      id: 'vVHWer0EYjo',
      title: 'Sales Training',
      thumbnail: 'https://img.youtube.com/vi/vVHWer0EYjo/maxresdefault.jpg',
      tags: [
        { name: 'Sales', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
        { name: 'Training', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
        { name: 'Techniques', bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
      ],
      description: 'Learn essential sales techniques to improve your conversion rates and close more deals effectively.',
      duration: '4 minutes',
      rating: 5,
      url: 'https://youtu.be/vVHWer0EYjo',
      watchStatusColumn: 'sales_training_watched'
    },
    {
      id: 'vkbnMJg1kSc',
      title: 'USA Credit Score',
      thumbnail: 'https://img.youtube.com/vi/vkbnMJg1kSc/maxresdefault.jpg',
      tags: [
        { name: 'Credit', bgColor: 'bg-red-100', textColor: 'text-red-800' },
        { name: 'USA', bgColor: 'bg-green-100', textColor: 'text-green-800' },
        { name: 'Finance', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
      ],
      description: 'Understand how the US credit scoring system works and learn strategies to help clients improve their credit scores.',
      duration: '3 minutes',
      rating: 5,
      url: 'https://youtu.be/vkbnMJg1kSc',
      watchStatusColumn: 'usa_credit_score_watched'
    }
  ];

  const openVideoModal = (video: {
    id: string;
    title: string;
    watchStatusColumn: string;
  }) => {
    setCurrentVideo(video);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    if (videoFrameRef.current) {
      videoFrameRef.current.src = '';
    }
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleVideoWatched = async () => {
    if (!userProfile) return;

    try {
      await updateProfile({
        [currentVideo.watchStatusColumn]: true
      });

      toast({
        title: "Video Marked as Watched",
        description: `You've completed the ${currentVideo.title} video.`
      });
    } catch (error) {
      console.error('Error updating video watch status:', error);
      toast({
        title: "Error",
        description: "Could not update video status.",
        variant: "destructive"
      });
    }
  };

  const filteredVideos = trainingVideos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to detect video ended event from YouTube iframe API
  const setupYouTubeEventListener = () => {
    // Create a global callback function for YouTube API to call
    window.onYouTubePlayerEnded = () => {
      handleVideoWatched();
    };
  };

  useEffect(() => {
    // Set up the event listener when the component mounts
    setupYouTubeEventListener();
  }, [currentVideo]); // Re-setup when current video changes

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar activeItem="additional-training" />
      <main className="flex-1">
        <div className="welcome-container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Thanks for signing up, <span className="text-indigo-600">{userProfile?.first_name || 'Agent'}</span>!
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Access your professional training resources below to maximize conversion.
            </p>
          </div>
          
          <div className="search-container bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center">
              <div className="pl-4 pr-2 text-gray-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search videos by keyword or objective..." 
                className="w-full py-3 px-2 focus:outline-none text-gray-700 border-none" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-r-lg transition">
                Search
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Training Videos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.map((video, index) => (
                <div 
                  key={index} 
                  className="video-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition transform hover:-translate-y-1" 
                  onClick={() => openVideoModal({
                    id: video.id,
                    title: video.title,
                    watchStatusColumn: video.watchStatusColumn
                  })}
                >
                  <div className="video-thumbnail relative overflow-hidden pt-[56.25%]">
                    <img src={video.thumbnail} alt={video.title} className="absolute top-0 left-0 w-full h-full object-cover" />
                    <div className="play-button absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 w-14 h-14 rounded-full flex items-center justify-center text-white transition">
                      <Play size={24} />
                    </div>
                    {userProfile && userProfile[video.watchStatusColumn as keyof typeof userProfile] === true && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Watched
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {video.tags.map((tag, tagIndex) => <span key={tagIndex} className={`${tag.bgColor} ${tag.textColor} text-xs px-2 py-1 rounded-full`}>
                          {tag.name}
                        </span>)}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-lg">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        <span>{video.duration}</span>
                      </div>
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 truncate">
                      <LinkIcon size={12} className="inline mr-1" />
                      <a href={video.url} target="_blank" className="hover:underline" onClick={e => e.stopPropagation()}>
                        {video.url}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-black">
            <button 
              className="absolute -top-10 right-0 text-white text-3xl focus:outline-none" 
              onClick={closeVideoModal}
            >
              <X size={24} />
            </button>
            <div className="relative pb-[56.25%] h-0">
              <iframe 
                ref={videoFrameRef} 
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`} 
                title={currentVideo.title} 
                className="absolute top-0 left-0 w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                onLoad={() => {
                  if (videoFrameRef.current) {
                    // Add an event listener for when the video ends
                    videoFrameRef.current.addEventListener('load', () => {
                      // Using postMessage to communicate with the YouTube iframe
                      const iframe = videoFrameRef.current;
                      if (iframe?.contentWindow) {
                        iframe.contentWindow.postMessage('{"event":"listening"}', '*');
                      }
                    });
                  }
                }}
              />
            </div>
            <div className="mt-4 flex justify-between items-center p-4 bg-white rounded-b">
              <span className="text-gray-700 font-medium">{currentVideo.title}</span>
              <button 
                onClick={handleVideoWatched}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Mark as Watched
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add event listener for YouTube iframe API messages */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.event === 'onStateChange' && data.info === 0) {
                // Video ended (state 0)
                if (window.onYouTubePlayerEnded) {
                  window.onYouTubePlayerEnded();
                }
              }
            } catch (e) {
              // Not a JSON message or other error, ignore
            }
          });
        `
      }} />
    </div>
  );
};

export default AdditionalTraining;
