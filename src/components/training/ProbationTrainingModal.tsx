
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import ProbationTrainingQuiz from './ProbationTrainingQuiz';

interface ProbationTrainingModule {
  id: string;
  title: string;
  description: string;
  video_url: string;
  module_order: number;
}

interface ProbationTrainingQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  question_order: number;
  module_id: string;
}

interface ProbationTrainingModalProps {
  isOpen: boolean;
  onClose: (passed?: boolean) => void;
}

const ProbationTrainingModal: React.FC<ProbationTrainingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<ProbationTrainingModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [questions, setQuestions] = useState<ProbationTrainingQuestion[]>([]);
  const [videoWatched, setVideoWatched] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [userProgress, setUserProgress] = useState<any>(null);

  // Fetch modules and questions
  useEffect(() => {
    const fetchModules = async () => {
      if (!isOpen || !user) return;

      setIsLoading(true);
      setErrorMessage('');

      try {
        // Check if user has already completed the training
        const { data: existingProgress } = await supabase
          .from('user_probation_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingProgress?.completed) {
          setUserProgress(existingProgress);
          setQuizCompleted(true);
          setQuizPassed(existingProgress.passed);
          setQuizScore(existingProgress.score || 0);
          setIsLoading(false);
          return;
        }

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('probation_training_modules')
          .select('*')
          .order('module_order', { ascending: true });

        if (modulesError) throw modulesError;
        if (!modulesData || modulesData.length === 0) {
          setErrorMessage('No training modules found.');
          setIsLoading(false);
          return;
        }

        setModules(modulesData as ProbationTrainingModule[]);

        // Fetch questions for the first module
        if (modulesData.length > 0) {
          const { data: questionsData, error: questionsError } = await supabase
            .from('probation_training_questions')
            .select('*')
            .eq('module_id', modulesData[0].id)
            .order('question_order', { ascending: true });

          if (questionsError) throw questionsError;
          if (questionsData) {
            setQuestions(questionsData as ProbationTrainingQuestion[]);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching training data:', error);
        setErrorMessage('Failed to load training content. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setVideoWatched(false);
      setShowQuiz(false);
      setCurrentModuleIndex(0);
    }
  }, [isOpen]);

  const handleVideoEnded = () => {
    setVideoWatched(true);
  };

  const handleNextModule = async () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextIndex = currentModuleIndex + 1;
      setCurrentModuleIndex(nextIndex);
      setVideoWatched(false);
      setShowQuiz(false);

      // Fetch questions for the next module
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('probation_training_questions')
          .select('*')
          .eq('module_id', modules[nextIndex].id)
          .order('question_order', { ascending: true });

        if (questionsError) throw questionsError;
        if (questionsData) {
          setQuestions(questionsData as ProbationTrainingQuestion[]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz questions. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // All modules completed
      setQuizCompleted(true);
    }

    // Update progress percentage
    const newProgress = Math.round(((currentModuleIndex + 1) / modules.length) * 100);
    setProgress(newProgress);
  };

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    setQuizScore(score);
    setQuizPassed(passed);
    setQuizCompleted(true);

    // Save results to database
    if (user) {
      try {
        // First, check if entry already exists
        const { data: existingProgress } = await supabase
          .from('user_probation_progress')
          .select('*')
          .eq('user_id', user.id);

        if (!existingProgress || existingProgress.length === 0) {
          // Create new progress record
          await supabase
            .from('user_probation_progress')
            .insert({
              user_id: user.id,
              completed: true,
              score: score,
              passed: passed,
              completed_at: new Date().toISOString()
            });
        } else {
          // Update existing record
          await supabase
            .from('user_probation_progress')
            .update({
              completed: true,
              score: score,
              passed: passed,
              completed_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        }

        // Update user_profiles
        await supabase
          .from('user_profiles')
          .update({
            probation_training_completed: true
          })
          .eq('user_id', user.id);

        setUserProgress({
          completed: true,
          score: score,
          passed: passed
        });

      } catch (error) {
        console.error('Error saving quiz results:', error);
        toast({
          title: "Error",
          description: "Failed to save your quiz results. Please contact support.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCloseModal = () => {
    onClose(quizPassed);
  };

  const getCurrentModule = () => {
    return modules[currentModuleIndex];
  };

  // Special handling for the introduction module
  const isIntroductionModule = modules[currentModuleIndex]?.title === 'Introduction Module';

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Probation Training</DialogTitle>
            <DialogDescription>
              Loading training content...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render error state
  if (errorMessage) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Probation Training</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <button 
              onClick={handleCloseModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If user has already completed the training
  if (quizCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training Completed</DialogTitle>
            <DialogDescription>
              {quizPassed 
                ? "Congratulations! You have successfully completed the probation training."
                : "You did not pass the training quiz. Please contact your supervisor for next steps."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {quizPassed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              Your Score: {quizScore}%
            </h3>
            <p className="mb-4 text-gray-600">
              {quizPassed 
                ? "You've successfully completed the probation training. You can now continue with the next steps in your onboarding process."
                : "Unfortunately, you did not achieve the minimum required score of 85%. Please contact your supervisor for guidance on next steps."}
            </p>
            <button 
              onClick={handleCloseModal}
              className={`px-6 py-2 rounded-md ${quizPassed ? 'bg-green-600' : 'bg-gray-600'} text-white`}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <DialogTitle>
            {modules[currentModuleIndex]?.title || "Probation Training"}
          </DialogTitle>
          <DialogDescription>
            {modules[currentModuleIndex]?.description || "Complete all training modules to continue."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
          <p className="text-xs text-right mt-1 text-gray-500">
            Module {currentModuleIndex + 1} of {modules.length}
          </p>
        </div>

        {!showQuiz ? (
          <>
            {/* Video section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Watch the training video:</h3>
              {modules[currentModuleIndex]?.video_url && (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    className="w-full h-[400px]"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(modules[currentModuleIndex].video_url)}?enablejsapi=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onEnded={handleVideoEnded}
                  ></iframe>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-end gap-4 mt-4">
              {isIntroductionModule ? (
                <button
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                  onClick={handleNextModule}
                >
                  Next Module
                </button>
              ) : (
                <>
                  {!videoWatched ? (
                    <button
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                      onClick={() => setVideoWatched(true)}
                    >
                      Mark Video as Watched
                    </button>
                  ) : (
                    <button
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                      onClick={startQuiz}
                    >
                      Take Quiz
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <ProbationTrainingQuiz
            questions={questions}
            onComplete={handleQuizComplete}
            onNext={handleNextModule}
            isLastModule={currentModuleIndex === modules.length - 1}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProbationTrainingModal;
