
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import TrainingModal from '@/components/training/TrainingModal';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useToast } from '@/hooks/use-toast';

function Dashboard() {
  const { user, userProfile, updateProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If user has not completed training, show the modal
    if (userProfile && !userProfile.training_video_watched) {
      setShowModal(true);
    }
  }, [userProfile]);

  const handleScheduleInterview = async () => {
    const interviewLink = "https://calendly.com/apolead/agent-interview";
    window.open(interviewLink, "_blank");
    
    try {
      // Update the user profile to mark scheduling as complete
      await updateProfile({
        interview_scheduled: true
      });
      
      toast({
        title: "Interview Scheduled",
        description: "Thank you for scheduling your interview. We look forward to speaking with you!",
      });
    } catch (error) {
      console.error("Error updating interview status:", error);
      toast({
        title: "Error",
        description: "Could not update your interview status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoComplete = async () => {
    try {
      // Update user profile to mark training complete
      await updateProfile({
        training_video_watched: true
      });
      
      setShowModal(false);
      
      toast({
        title: "Training Complete",
        description: "Congratulations on completing the training video!",
      });
    } catch (error) {
      console.error("Error updating training status:", error);
      toast({
        title: "Error",
        description: "Could not update your training status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activePage="dashboard" />
      
      <div className="flex-1 p-8 ml-[240px]">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-semibold">
            Welcome <span className="text-indigo-600 relative after:content-[''] after:absolute after:w-full after:h-[3px] after:bg-gradient-to-r after:from-indigo-600 after:to-cyan-400 after:bottom-[-5px] after:left-0 after:rounded-md">{userProfile?.first_name}</span>
          </h1>
          
          <div className="flex items-center">
            <div className="flex gap-4 mr-5">
              <button className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center shadow-sm hover:translate-y-[-3px] transition-all hover:shadow-md text-gray-500 hover:text-indigo-600">
                <i className="fas fa-search"></i>
              </button>
              <button className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center shadow-sm hover:translate-y-[-3px] transition-all hover:shadow-md text-gray-500 hover:text-indigo-600 relative">
                <i className="fas fa-bell"></i>
                <span className="absolute top-[10px] right-[10px] w-[8px] h-[8px] bg-red-500 border-2 border-white rounded-full"></span>
              </button>
              <button className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center shadow-sm hover:translate-y-[-3px] transition-all hover:shadow-md text-gray-500 hover:text-indigo-600">
                <i className="fas fa-cog"></i>
              </button>
            </div>
            
            <div className="flex items-center bg-white px-[15px] py-[8px] rounded-[50px] shadow-sm hover:shadow-md transition-all hover:translate-y-[-3px] cursor-pointer">
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-r from-indigo-600 to-cyan-400 text-white flex items-center justify-center font-semibold text-[16px] mr-[10px]">
                {userProfile && `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="font-medium text-gray-800">
                {userProfile?.first_name} {userProfile?.last_name}
              </div>
              <i className="fas fa-chevron-down text-gray-500 ml-2"></i>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-clipboard-list text-xl text-indigo-600"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Complete Your Application</h3>
            <p className="text-gray-500 text-sm mb-4">Fill out all required information to complete your application process.</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-indigo-600">
                {userProfile?.application_status === 'pending' ? '75% Complete' : userProfile?.application_status === 'approved' ? 'Approved' : 'Under Review'}
              </span>
              <i className="fas fa-arrow-right text-indigo-600"></i>
            </div>
            <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full" style={{ width: userProfile?.application_status === 'pending' ? '75%' : '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="bg-purple-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-video text-xl text-purple-600"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Training Video</h3>
            <p className="text-gray-500 text-sm mb-4">Watch the required training video to learn about our platform and systems.</p>
            {userProfile?.training_video_watched ? (
              <span className="bg-green-100 text-green-800 text-xs font-medium py-1 px-3 rounded-full">Completed</span>
            ) : (
              <button 
                onClick={() => setShowModal(true)}
                className="text-purple-600 font-medium text-sm flex items-center"
              >
                Watch Now <i className="fas fa-play-circle ml-2"></i>
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-calendar-alt text-xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Schedule Interview</h3>
            <p className="text-gray-500 text-sm mb-4">Book a time slot for your qualification interview with our team.</p>
            <button 
              onClick={handleScheduleInterview}
              className="text-blue-600 font-medium text-sm flex items-center"
            >
              Schedule Now <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="mb-5 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Application Status</h3>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              userProfile?.application_status === 'approved' ? 'bg-green-100 text-green-800' :
              userProfile?.application_status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {userProfile?.application_status === 'approved' ? 'Approved' :
               userProfile?.application_status === 'rejected' ? 'Rejected' :
               'Pending Review'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Application Submitted</span>
                  <span className="text-sm text-green-600"><i className="fas fa-check"></i> Complete</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Training Video</span>
                  <span className="text-sm">
                    {userProfile?.training_video_watched ? (
                      <span className="text-green-600"><i className="fas fa-check"></i> Complete</span>
                    ) : (
                      <span className="text-yellow-600"><i className="fas fa-clock"></i> Pending</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Qualification Quiz</span>
                  <span className="text-sm">
                    {userProfile?.quiz_passed ? (
                      <span className="text-green-600"><i className="fas fa-check"></i> Passed</span>
                    ) : (
                      <span className="text-yellow-600"><i className="fas fa-clock"></i> Pending</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Interview</span>
                  <span className="text-sm text-yellow-600"><i className="fas fa-clock"></i> Pending</span>
                </div>
              </div>
            </div>
            <div className="md:w-[1px] md:h-32 w-full h-[1px] bg-gray-200 md:mx-8"></div>
            <div className="flex-1">
              <h4 className="text-lg font-medium mb-3">Next Steps</h4>
              <ul className="space-y-3">
                {!userProfile?.training_video_watched && (
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <i className="fas fa-play text-xs"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Watch the training video</p>
                      <p className="text-xs text-gray-500">Complete the required training video</p>
                    </div>
                  </li>
                )}
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <i className="fas fa-calendar text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Schedule your interview</p>
                    <p className="text-xs text-gray-500">Book a time slot with our team</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <i className="fas fa-clipboard-check text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Complete the qualification quiz</p>
                    <p className="text-xs text-gray-500">Pass the quiz to proceed with your application</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TrainingModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)} 
          onComplete={handleVideoComplete}
        />
      )}
    </div>
  );
}

export default Dashboard;
