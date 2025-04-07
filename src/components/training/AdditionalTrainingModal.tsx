
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdditionalTrainingVideo from './AdditionalTrainingVideo';
import AdditionalTrainingQuiz from './AdditionalTrainingQuiz';
import { 
  ProbationTrainingModule, 
  ProbationTrainingQuestion, 
  UserProbationProgress 
} from '@/types/probation-training';

interface AdditionalTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdditionalTrainingModal: React.FC<AdditionalTrainingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<ProbationTrainingModule[]>([]);
  const [currentModule, setCurrentModule] = useState<ProbationTrainingModule | null>(null);
  const [questions, setQuestions] = useState<ProbationTrainingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'video' | 'quiz' | 'result'>('video');
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<Record<string, UserProbationProgress>>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [modulesCompleted, setModulesCompleted] = useState<number>(0);
  const [totalModules, setTotalModules] = useState<number>(0);
  
  useEffect(() => {
    if (isOpen && user) {
      loadModulesAndProgress();
    }
  }, [isOpen, user]);
  
  const loadModulesAndProgress = async () => {
    try {
      setLoading(true);
      
      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_probation_progress')
        .select('*')
        .eq('user_id', user?.id);
      
      if (progressError) throw progressError;
      
      const progressMap: Record<string, UserProbationProgress> = {};
      let completedCount = 0;
      let totalScore = 0;
      let scoreCount = 0;
      
      if (progressData) {
        progressData.forEach((progress: UserProbationProgress) => {
          progressMap[progress.module_id] = progress;
          if (progress.completed) {
            completedCount++;
          }
          if (progress.score !== null) {
            totalScore += progress.score;
            scoreCount++;
          }
        });
      }
      
      setUserProgress(progressMap);
      
      // Load training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('probation_training_modules')
        .select('*')
        .order('module_order', { ascending: true });
      
      if (modulesError) throw modulesError;
      
      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as ProbationTrainingModule[]);
        setTotalModules(modulesData.length);
        setModulesCompleted(completedCount);
        
        if (scoreCount > 0) {
          const avgScore = Math.round(totalScore / scoreCount);
          setOverallScore(avgScore);
        }
        
        // Find the first incomplete module or the first module if none started
        const firstIncompleteModule = modulesData.find((module: ProbationTrainingModule) => 
          !progressMap[module.id] || !progressMap[module.id].completed
        ) || modulesData[0];
        
        setCurrentModule(firstIncompleteModule as ProbationTrainingModule);
        
        // Load questions for this module
        if (firstIncompleteModule) {
          await loadQuestionsForModule(firstIncompleteModule.id);
        }
      } else {
        setError("No training modules available. Please check back later.");
      }
    } catch (error) {
      console.error("Error loading additional training data:", error);
      setError("Failed to load training content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForModule = async (moduleId: string) => {
    try {
      console.log("Loading questions for module:", moduleId);
      const { data, error } = await supabase
        .from('probation_training_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('question_order', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        console.log("Received questions:", data);
        const formattedQuestions = data.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : []
        }));
        setQuestions(formattedQuestions as ProbationTrainingQuestion[]);
      } else {
        console.log("No questions found for this module");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      setError("Failed to load quiz questions. Please try again later.");
    }
  };
  
  const handleVideoComplete = async () => {
    if (!user?.id || !currentModule) return;
    
    try {
      // If we don't have progress for this module yet, create it
      if (!userProgress[currentModule.id]) {
        const { error } = await supabase
          .from('user_probation_progress')
          .insert({
            user_id: user.id,
            module_id: currentModule.id,
            completed: false
          });
        
        if (error) throw error;
        
        setUserProgress(prev => ({
          ...prev,
          [currentModule.id]: {
            user_id: user.id,
            module_id: currentModule.id,
            completed: false,
            passed: null,
            score: null
          }
        }));
      }
      
      setStep('quiz');
    } catch (error) {
      console.error("Error updating video progress:", error);
      setError("Failed to save your progress. Please try again.");
    }
  };
  
  const handleQuizComplete = async (passed: boolean, score: number) => {
    if (!user?.id || !currentModule) return;
    
    try {
      setQuizPassed(passed);
      setQuizScore(score);
      
      const progress = userProgress[currentModule.id];
      
      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_probation_progress')
          .update({
            passed,
            score,
            completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('module_id', currentModule.id);
        
        if (error) throw error;
      } else {
        // Create new progress entry
        const { error } = await supabase
          .from('user_probation_progress')
          .insert({
            user_id: user.id,
            module_id: currentModule.id,
            passed,
            score,
            completed: true
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [currentModule.id]: {
          ...prev[currentModule.id],
          user_id: user.id,
          module_id: currentModule.id,
          passed,
          score,
          completed: true
        }
      }));
      
      // Update overall score and completed modules
      let totalScore = 0;
      let scoreCount = 0;
      let completedCount = 0;
      
      const updatedProgress = {
        ...userProgress,
        [currentModule.id]: {
          user_id: user.id,
          module_id: currentModule.id,
          passed,
          score,
          completed: true
        }
      };
      
      Object.values(updatedProgress).forEach(progress => {
        if (progress.completed) {
          completedCount++;
        }
        if (progress.score !== null) {
          totalScore += progress.score;
          scoreCount++;
        }
      });
      
      setModulesCompleted(completedCount);
      
      if (scoreCount > 0) {
        const avgScore = Math.round(totalScore / scoreCount);
        setOverallScore(avgScore);
      }
      
      setStep('result');
      
      // Update the user's overall training status if all modules are completed
      if (completedCount === modules.length) {
        const allPassed = avgScore >= 90;
        
        await supabase
          .from('user_profiles')
          .update({
            probation_training_completed: true,
            probation_training_passed: allPassed
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
      setError("Failed to save your quiz results. Please try again.");
    }
  };
  
  const handleSelectModule = (module: ProbationTrainingModule) => {
    setCurrentModule(module);
    setQuizPassed(null);
    setQuizScore(0);
    
    // If the module is already completed, go to the result screen
    const moduleProgress = userProgress[module.id];
    if (moduleProgress && moduleProgress.completed) {
      setQuizPassed(moduleProgress.passed || false);
      setQuizScore(moduleProgress.score || 0);
      setStep('result');
    } else {
      setStep('video');
    }
    
    // Load questions for this module
    loadQuestionsForModule(module.id);
  };
  
  const handleCloseModal = () => {
    onClose();
  };
  
  const handleNextModule = () => {
    if (!currentModule) return;
    
    const currentIndex = modules.findIndex(m => m.id === currentModule.id);
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      handleSelectModule(nextModule);
    } else {
      // All modules completed
      onClose();
    }
  };
  
  const isModuleCompleted = (moduleId: string) => {
    return userProgress[moduleId]?.completed === true;
  };
  
  const isModulePassed = (moduleId: string) => {
    return userProgress[moduleId]?.passed === true;
  };
  
  const renderModuleList = () => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Training Modules</h3>
        <div className="grid grid-cols-1 gap-2">
          {modules.map((module, index) => (
            <div 
              key={module.id}
              onClick={() => handleSelectModule(module)}
              className={`
                p-3 rounded-lg cursor-pointer flex items-center justify-between
                ${currentModule?.id === module.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}
                ${isModuleCompleted(module.id) && isModulePassed(module.id) ? 'border-l-4 border-l-green-500' : ''}
                ${isModuleCompleted(module.id) && !isModulePassed(module.id) ? 'border-l-4 border-l-red-500' : ''}
              `}
            >
              <div>
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  <span className="font-medium">{module.title}</span>
                </div>
                {isModuleCompleted(module.id) && (
                  <div className="ml-8 text-sm mt-1">
                    {isModulePassed(module.id) ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Passed with {userProgress[module.id]?.score}%
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Failed with {userProgress[module.id]?.score}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              {isModuleCompleted(module.id) ? (
                isModulePassed(module.id) ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              ) : (
                currentModule?.id === module.id && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
        
        {modulesCompleted === modules.length && overallScore > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${overallScore >= 90 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h4 className="text-sm font-medium">Overall Training Score</h4>
            <div className={`text-lg font-bold ${overallScore >= 90 ? 'text-green-600' : 'text-red-500'}`}>
              {overallScore}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overallScore >= 90 
                ? "Congratulations! You've passed the training program." 
                : "You need 90% overall to unlock the next step."}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  const renderModalContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!currentModule) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No training module found.</AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          {renderModuleList()}
        </div>
        
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h2 className="text-xl font-bold">{currentModule.title}</h2>
            {currentModule.description && (
              <p className="text-gray-600 mt-1">{currentModule.description}</p>
            )}
          </div>
          
          {step === 'video' && (
            <AdditionalTrainingVideo 
              videoUrl={currentModule.video_url}
              onComplete={handleVideoComplete}
              isCompleted={userProgress[currentModule.id]?.completed === true}
            />
          )}
          
          {step === 'quiz' && questions.length > 0 && (
            <AdditionalTrainingQuiz
              questions={questions}
              onComplete={handleQuizComplete}
            />
          )}
          
          {step === 'quiz' && questions.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Questions Available</h3>
              <p className="text-gray-600">
                There are no quiz questions available for this module.
              </p>
              <Button 
                onClick={handleNextModule}
                className="mt-4"
              >
                Continue to Next Module
              </Button>
            </div>
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
                    You passed this training module successfully!
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                    <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                    <p className="text-sm text-gray-600">
                      You've completed this module and can move to the next one.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleNextModule}
                      className="px-6 py-2 rounded-full text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Continue to Next Module
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <XCircle className="h-20 w-20 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">
                    Module Not Passed
                  </h3>
                  <p className="text-lg mb-4">
                    You did not pass this training module.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
                    <p className="text-lg">Your score: <span className="font-bold">{quizScore}%</span></p>
                    <p className="text-sm text-gray-600">
                      You need at least 70% to pass this module.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => setStep('video')}
                      className="px-6 py-2 rounded-full text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Additional Training</DialogTitle>
        </DialogHeader>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalTrainingModal;
