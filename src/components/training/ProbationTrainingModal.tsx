import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProbationTrainingQuiz from './ProbationTrainingQuiz';
import { supabase } from '@/integrations/supabase/client';
import { ProbationTrainingModule, ProbationTrainingQuestion, UserProbationProgress } from '@/types/supabase';

interface ProbationTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (passed: boolean) => void;
}

const ProbationTrainingModal: React.FC<ProbationTrainingModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete = () => {} 
}) => {
  const [step, setStep] = useState<'intro' | 'module' | 'quiz' | 'result'>('intro');
  const { user, userProfile, updateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<ProbationTrainingModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [allQuestions, setAllQuestions] = useState<ProbationTrainingQuestion[]>([]);
  const [currentModuleQuestions, setCurrentModuleQuestions] = useState<ProbationTrainingQuestion[]>([]);
  const [userProgress, setUserProgress] = useState<UserProbationProgress | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Check for existing progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_probation_progress')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') {
        console.error("Error loading user progress:", progressError);
      }
      
      if (progressData) {
        setUserProgress(progressData as UserProbationProgress);
        if (progressData.completed) {
          setQuizPassed(progressData.passed);
          setQuizScore(progressData.score || 0);
          setStep('result');
          setLoading(false);
          return;
        }
      }
      
      // Load all modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('probation_training_modules')
        .select('*')
        .order('module_order', { ascending: true });
      
      if (modulesError) {
        throw modulesError;
      }
      
      if (!modulesData || modulesData.length === 0) {
        throw new Error("No training modules found");
      }
      
      setModules(modulesData as ProbationTrainingModule[]);
      
      // Load all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('probation_training_questions')
        .select('*')
        .order('question_order', { ascending: true });
      
      if (questionsError) {
        throw questionsError;
      }
      
      if (!questionsData || questionsData.length === 0) {
        throw new Error("No training questions found");
      }
      
      const typedQuestions = questionsData as unknown as ProbationTrainingQuestion[];
      setAllQuestions(typedQuestions);
      
      // Set questions for the first module
      const firstModule = modulesData[0];
      const firstModuleQuestions = typedQuestions.filter(q => q.module_id === firstModule.id);
      setCurrentModuleQuestions(firstModuleQuestions);
      
      setLoading(false);
    } catch (err: any) {
      console.error("Error loading training data:", err);
      setError(err.message || "Failed to load training data");
      setLoading(false);
    }
  };

  const handleModuleComplete = () => {
    // If we're at the last module, move to the quiz
    if (currentModuleIndex >= modules.length - 1) {
      setStep('quiz');
    } else {
      // Otherwise, move to the next module
      const nextModuleIndex = currentModuleIndex + 1;
      setCurrentModuleIndex(nextModuleIndex);
      
      // Update the questions for the new module
      const nextModule = modules[nextModuleIndex];
      const nextModuleQuestions = allQuestions.filter(q => q.module_id === nextModule.id);
      setCurrentModuleQuestions(nextModuleQuestions);
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    try {
      setQuizPassed(passed);
      setQuizScore(score);
      
      // Check if we already have a progress record
      if (userProgress) {
        // Update existing record
        await supabase
          .from('user_probation_progress')
          .update({
            completed: true,
            score,
            passed,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);
      } else {
        // Create new record
        await supabase
          .from('user_probation_progress')
          .insert({
            user_id: user?.id,
            completed: true,
            score,
            passed,
            completed_at: new Date().toISOString()
          });
      }
      
      // Update user profile
      await updateProfile({
        probation_training_completed: true
      });
      
      setStep('result');
      
      // Call onComplete with the result of the quiz
      onComplete(passed);
    } catch (error: any) {
      console.error("Error completing training:", error);
      setError("There was an error saving your quiz results. Please try again.");
    }
  };

  const handleCloseModal = () => {
    onClose();
  };
  
  const renderModuleContent = () => {
    if (modules.length === 0 || currentModuleIndex >= modules.length) {
      return <div>No module content available</div>;
    }
    
    const currentModule = modules[currentModuleIndex];
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{currentModule.title}</h2>
        
        {currentModule.description && (
          <p className="text-gray-600">{currentModule.description}</p>
        )}
        
        <div className="relative pt-[56.25%] mt-4 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(currentModule.video_url)}`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentModule.title}
          />
        </div>
        
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            className="hover:bg-gray-100"
          >
            Close
          </Button>
          
          <Button
            onClick={handleModuleComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentModuleIndex >= modules.length - 1 ? 'Continue to Quiz' : 'Next Module'}
          </Button>
        </div>
      </div>
    );
  };
  
  // Helper function to extract YouTube video ID
  const getYoutubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };
  
  if (!isOpen) return null;
  
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading training content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
          (quizPassed === true) 
            ? 'bg-gradient-to-r from-green-600 to-green-500' 
            : (quizPassed === false)
              ? 'bg-gradient-to-r from-red-600 to-red-500'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500'
        } text-white rounded-t-lg`}>
          <h2 className="text-xl font-semibold flex items-center">
            {step === 'intro' && 'ReadyMode AI Dialer Training'}
            {step === 'module' && `Module ${currentModuleIndex + 1}: ${modules[currentModuleIndex]?.title || 'Training'}`}
            {step === 'quiz' && 'Training Knowledge Quiz'}
            {step === 'result' && `Quiz Result: ${quizPassed ? 'Passed' : 'Failed'}`}
          </h2>
          <button 
            onClick={handleCloseModal}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {step === 'intro' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold mb-4">ReadyMode AI Dialer Training</h1>
              
              <p className="text-gray-700 mb-4">
                Welcome to the ReadyMode AI Dialer training program! This training will help you understand how to effectively use the ReadyMode platform to connect with leads efficiently.
              </p>
              
              <p className="text-gray-700 mb-4">
                Throughout this training series, we'll cover everything from basic navigation to advanced features. We'll explore how to manage leads, schedule callbacks, transfer calls, and much more.
              </p>
              
              <p className="text-gray-700 mb-4">
                Each video module focuses on a different aspect of the ReadyMode system, and there will be a quiz at the end to help reinforce what you've learned.
              </p>
              
              <p className="text-gray-700 mb-4">
                <strong>Important:</strong> You must score at least 85% on the quiz to complete this training.
              </p>
              
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => setStep('module')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Training
                </Button>
              </div>
            </div>
          )}
          
          {step === 'module' && renderModuleContent()}
          
          {step === 'quiz' && (
            <ProbationTrainingQuiz 
              questions={allQuestions} 
              onComplete={handleQuizComplete}
            />
          )}
          
          {step === 'result' && (
            <div className="text-center py-6">
              {quizPassed ? (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-600">
                    Congratulations!
                  </h3>
                  <p className="text-lg mb-4">
                    You passed the training quiz successfully!
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                    <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                    <p className="text-sm text-gray-600">
                      You passed with a score of {quizScore}%, which meets the required 85% threshold.
                    </p>
                  </div>
                  
                  <div className="border-t pt-6 mt-4">
                    <h4 className="text-xl font-semibold mb-2">Next Steps</h4>
                    <p className="mb-4">
                      Your probation training is complete! You have now learned the fundamentals of the ReadyMode platform.
                    </p>
                    <Button 
                      onClick={handleCloseModal}
                      className="px-6 py-2 rounded-full text-white font-medium mt-2 bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <XCircle className="h-20 w-20 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">
                    Unfortunately
                  </h3>
                  <p className="text-lg mb-4">
                    You did not pass the probation training quiz.
                  </p>
                  <p className="text-md mb-6">
                    Please speak with your supervisor about next steps.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                    <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                    <p className="text-sm text-gray-600">
                      You need to score at least 85% to pass.
                    </p>
                  </div>
                  <Button
                    onClick={handleCloseModal}
                    className="px-6 py-2 rounded-full text-white font-medium mt-6 bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProbationTrainingModal;
