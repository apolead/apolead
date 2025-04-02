
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

const Onboarding = () => {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        // Check if user has already completed onboarding
        if (userProfile?.onboarding_completed) {
          setOnboardingCompleted(true);
          
          // Redirect to dashboard if onboarding is already completed
          toast({
            title: "Onboarding already completed",
            description: "You've already completed the onboarding process."
          });
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          
          return;
        }

        // Fetch onboarding questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('onboarding_questions')
          .select('*')
          .order('created_at', { ascending: true });

        if (questionsError) {
          throw questionsError;
        }

        setQuestions(questionsData || []);
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
        toast({
          title: "Error",
          description: "Failed to load onboarding questions. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, userProfile, navigate, toast]);

  const handleSubmitOnboarding = async (responses, uploadedFiles) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if all answers are correct (all must be the correct value for a 100% score)
      const allCorrect = responses.every(response => response.is_correct);
      
      if (!allCorrect) {
        toast({
          title: "Onboarding Failed",
          description: "You must answer all questions correctly to complete onboarding.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Upload files and get URLs
      const fileUrls = {};
      
      for (const [key, file] of Object.entries(uploadedFiles)) {
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from(key === 'govIdImage' ? 'government_ids' : 
                  key === 'speedTest' ? 'speed_tests' : 'system_settings')
            .upload(fileName, file);
            
          if (error) {
            throw error;
          }
          
          const { data: urlData } = supabase.storage
            .from(key === 'govIdImage' ? 'government_ids' : 
                  key === 'speedTest' ? 'speed_tests' : 'system_settings')
            .getPublicUrl(fileName);
            
          fileUrls[key] = urlData.publicUrl;
        }
      }
      
      // Save responses to database
      for (const response of responses) {
        await supabase
          .from('onboarding_responses')
          .insert({
            user_id: user.id,
            question_id: response.question_id,
            selected_answer: response.selected_answer,
            is_correct: response.is_correct
          });
      }
      
      // Extract profile data from responses
      const profileData = {};
      
      // Map question responses to profile fields based on your questions
      for (const response of responses) {
        const question = questions.find(q => q.id === response.question_id);
        if (!question) continue;
        
        if (question.question.includes('quiet place')) {
          profileData.has_quiet_place = response.selected_answer === 0; // "Yes" is index 0
        } else if (question.question.includes('headset')) {
          profileData.has_headset = response.selected_answer === 0; // "Yes" is index 0
        } else if (question.question.includes('training')) {
          profileData.complete_training = response.selected_answer === 0; // "Yes" is index 0
        } else if (question.question.includes('Discord')) {
          profileData.login_discord = response.selected_answer === 0; // "Yes" is index 0
        } else if (question.question.includes('emails')) {
          profileData.check_emails = response.selected_answer === 0; // "Yes" is index 0
        }
      }
      
      // Add file URLs to profile data
      if (fileUrls.govIdImage) profileData.gov_id_image = fileUrls.govIdImage;
      if (fileUrls.speedTest) profileData.speed_test = fileUrls.speedTest;
      if (fileUrls.systemSettings) profileData.system_settings = fileUrls.systemSettings;
      
      // Update onboarding status in profile
      profileData.onboarding_completed = true;
      profileData.onboarding_score = 100; // 100% if all answers are correct
      
      // Update user profile
      await updateProfile(profileData);
      
      // Update RPC function to set onboarding status
      await supabase.rpc('update_onboarding_status', {
        p_user_id: user.id,
        p_score: 100 // 100% if all answers are correct
      });
      
      setOnboardingCompleted(true);
      
      toast({
        title: "Onboarding Completed",
        description: "You have successfully completed the onboarding process!"
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (onboardingCompleted) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mt-4 mb-2">Onboarding Completed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for completing the onboarding process. You will be redirected to the dashboard shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Onboarding</h1>
      <p className="text-gray-600 mb-8 text-center">
        Before you can access your training and start working, please complete this onboarding process. 
        You must answer all questions correctly (100% score) to proceed.
      </p>
      
      {questions.length > 0 ? (
        <OnboardingForm 
          questions={questions} 
          onSubmit={handleSubmitOnboarding} 
          isLoading={loading}
        />
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p>No onboarding questions found. Please contact support.</p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
