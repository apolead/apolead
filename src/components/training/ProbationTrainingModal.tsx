
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProbationTrainingVideo from './ProbationTrainingVideo';
import ProbationTrainingQuiz from './ProbationTrainingQuiz';
import { TrainingModule, UserModuleProgress } from '@/types/training';

interface ProbationTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProbationTrainingModal: React.FC<ProbationTrainingModalProps> = ({ isOpen, onClose }) => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleProgress, setModuleProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'video' | 'quiz' | 'result'>('video');
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [completed, setCompleted] = useState(false);
  const [allModulesCompleted, setAllModulesCompleted] = useState(false);
  
  const { user, userProfile, updateProfile } = useAuth();
  
  // Fetch all training modules
  useEffect(() => {
    const fetchModules = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('training_modules')
          .select('*')
          .order('module_order', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setModules(data as TrainingModule[]);
          
          // Check user's progress for each module
          if (user) {
            const { data: progressData, error: progressError } = await supabase
              .from('user_module_progress')
              .select('*')
              .eq('user_id', user.id);
            
            if (progressError) throw progressError;
            
            const progress: Record<string, boolean> = {};
            if (progressData) {
              progressData.forEach((item: any) => {
                progress[item.module_id] = item.passed;
              });
            }
            
            setModuleProgress(progress);
            
            // Find the first uncompleted module
            const firstUncompleted = data.findIndex(module => 
              !progress[module.id] && module.has_quiz
            );
            
            if (firstUncompleted !== -1) {
              setCurrentModuleIndex(firstUncompleted);
            }
            
            // Check if all required modules are completed
            const allCompleted = data.every(module => 
              !module.has_quiz || progress[module.id]
            );
            
            setAllModulesCompleted(allCompleted);
            
            if (allCompleted && !userProfile?.probation_training_completed) {
              // Update user profile if all modules are completed
              try {
                await updateProfile({
                  probation_training_completed: true
                });
                
                setCompleted(true);
              } catch (err) {
                console.error("Error updating profile:", err);
              }
            } else {
              setCompleted(userProfile?.probation_training_completed || false);
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching modules:", err);
        setError(err.message || "Failed to load training modules");
      } finally {
        setLoading(false);
      }
    };
    
    fetchModules();
  }, [isOpen, user, userProfile]);
  
  const handleVideoComplete = () => {
    setStep('quiz');
  };
  
  const handleQuizComplete = async (passed: boolean, score: number) => {
    try {
      setQuizPassed(passed);
      setQuizScore(score);
      
      const currentModule = modules[currentModuleIndex];
      
      // Save progress to database
      if (user && currentModule) {
        const { error } = await supabase
          .from('user_module_progress')
          .upsert({
            user_id: user.id,
            module_id: currentModule.id,
            completed: true,
            score,
            passed,
            completed_at: new Date().toISOString()
          }, { onConflict: 'user_id,module_id' });
        
        if (error) throw error;
        
        // Update local progress state
        setModuleProgress(prev => ({
          ...prev,
          [currentModule.id]: passed
        }));
      }
      
      setStep('result');
      
      // Check if all modules are now completed
      if (passed) {
        const updatedProgress = {...moduleProgress, [currentModule.id]: true};
        const allComplete = modules.every(module => 
          !module.has_quiz || updatedProgress[module.id]
        );
        
        if (allComplete && !completed) {
          // Update user profile when all modules are completed
          await updateProfile({
            probation_training_completed: true
          });
          
          setCompleted(true);
          setAllModulesCompleted(true);
          
          toast({
            title: "Training Completed",
            description: "You have successfully completed all required training modules!"
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving quiz results:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz results",
        variant: "destructive"
      });
    }
  };
  
  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setStep('video');
      setQuizPassed(null);
      setQuizScore(0);
    } else {
      // All modules completed
      onClose();
    }
  };
  
  const handleRetryQuiz = () => {
    setStep('quiz');
    setQuizPassed(null);
    setQuizScore(0);
  };
  
  const currentModule = modules[currentModuleIndex] || {
    id: '',
    title: 'Loading...',
    description: '',
    video_url: '',
    has_quiz: true,
    module_order: 0
  };
  
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (completed && allModulesCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-10">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-2xl mb-4">Training Completed!</DialogTitle>
            <p className="text-lg mb-6">
              You have successfully completed all required training modules.
            </p>
            <Button onClick={onClose} className="px-6 bg-green-600 hover:bg-green-700 text-white">
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
            (quizPassed === true) 
              ? 'bg-gradient-to-r from-green-600 to-green-500' 
              : (quizPassed === false)
                ? 'bg-gradient-to-r from-red-600 to-red-500'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
          } text-white rounded-t-lg -mt-4 -mx-4`}>
            <DialogTitle className="text-white">
              {step === 'video' && `Module ${currentModuleIndex + 1}: ${currentModule.title}`}
              {step === 'quiz' && `Module ${currentModuleIndex + 1}: Quiz`}
              {step === 'result' && `Quiz Result: ${quizPassed ? 'Passed' : 'Failed'}`}
            </DialogTitle>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="pt-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
              {modules.map((module, index) => (
                <div 
                  key={module.id} 
                  className={`min-w-[100px] px-3 py-1 rounded-full text-xs font-medium ${
                    moduleProgress[module.id] 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : index === currentModuleIndex
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  Module {index + 1}
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {step === 'video' && (
              <ProbationTrainingVideo 
                videoUrl={currentModule.video_url}
                title={currentModule.title}
                onComplete={currentModule.has_quiz ? handleVideoComplete : handleNextModule}
              />
            )}
            
            {step === 'quiz' && currentModule.has_quiz && (
              <ProbationTrainingQuiz 
                moduleId={currentModule.id}
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
                      Module Completed!
                    </h3>
                    <p className="text-lg mb-4">
                      You passed this module's quiz successfully.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                      <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                      <p className="text-sm text-gray-600">
                        Required: 85% or higher
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleNextModule}
                      className="px-6 py-2 rounded-full text-white font-medium mt-2 bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      {currentModuleIndex < modules.length - 1 ? 'Continue to Next Module' : 'Complete Training'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <XCircle className="h-20 w-20 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-red-600">
                      Not Quite There Yet
                    </h3>
                    <p className="text-lg mb-4">
                      Unfortunately, you did not pass this module's quiz.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                      <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                      <p className="text-sm text-gray-600">
                        Required: 85% or higher
                      </p>
                    </div>
                    
                    <p className="mb-6 text-gray-600">
                      You cannot move on to the next module until you pass this quiz.
                      Please review the video and try again.
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setStep('video')}
                        variant="outline"
                        className="rounded-full"
                      >
                        Review Video
                      </Button>
                      <Button 
                        onClick={handleRetryQuiz}
                        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Try Quiz Again
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProbationTrainingModal;
