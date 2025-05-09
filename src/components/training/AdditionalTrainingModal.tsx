import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';

interface AdditionalTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdditionalTrainingModal: React.FC<AdditionalTrainingModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, refreshUserProfile } = useAuth();
  const [modules, setModules] = useState<ProbationTrainingModule[]>([]);
  const [currentModule, setCurrentModule] = useState<ProbationTrainingModule | null>(null);
  const [questions, setQuestions] = useState<ProbationTrainingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleTransitioning, setModuleTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<Record<string, UserProbationProgress>>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [modulesCompleted, setModulesCompleted] = useState<number>(0);
  const [totalModules, setTotalModules] = useState<number>(0);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [questionsLoadRetries, setQuestionsLoadRetries] = useState<number>(0);
  
  const isLoadingRef = useRef(false);
  const questionsCache = useRef<Record<string, ProbationTrainingQuestion[]>>({});
  const profileUpdateInProgress = useRef(false);
  const profileRefreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastProfileRefresh = useRef<number>(0);
  
  const REFRESH_THROTTLE_MS = 2000;
  const MAX_CONCURRENT_REQUESTS = 2;
  const activeRequests = useRef<number>(0);
  
  useEffect(() => {
    if (isOpen && user) {
      loadModulesAndProgress();
    }
    
    return () => {
      if (profileRefreshTimeout.current) {
        clearTimeout(profileRefreshTimeout.current);
      }
    };
  }, [isOpen, user]);
  
  const throttledRefreshProfile = useCallback(async () => {
    if (profileUpdateInProgress.current) {
      console.log('Profile update already in progress, skipping refresh');
      return;
    }
    
    const now = Date.now();
    if (now - lastProfileRefresh.current < REFRESH_THROTTLE_MS) {
      console.log('Throttling profile refresh');
      if (!profileRefreshTimeout.current) {
        profileRefreshTimeout.current = setTimeout(() => {
          lastProfileRefresh.current = Date.now();
          refreshUserProfile().catch(console.error);
          profileRefreshTimeout.current = null;
        }, REFRESH_THROTTLE_MS);
      }
      return;
    }
    
    lastProfileRefresh.current = now;
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, [refreshUserProfile]);
  
  const executeWithConcurrencyLimit = async (fn: () => Promise<any>) => {
    if (activeRequests.current >= MAX_CONCURRENT_REQUESTS) {
      console.log(`Reached max concurrent requests (${MAX_CONCURRENT_REQUESTS}), queuing`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return executeWithConcurrencyLimit(fn);
    }
    
    activeRequests.current += 1;
    try {
      return await fn();
    } finally {
      activeRequests.current -= 1;
    }
  };
  
  const loadModulesAndProgress = async () => {
    if (isLoadingRef.current) {
      console.log('Already loading modules and progress, skipping duplicate request');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      const progressData = await executeWithConcurrencyLimit(async () => {
        const { data, error } = await supabase
          .from('user_probation_progress')
          .select('*')
          .eq('user_id', user?.id);
          
        if (error) throw error;
        return data;
      });
      
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
      
      const modulesData = await executeWithConcurrencyLimit(async () => {
        const { data, error } = await supabase
          .from('probation_training_modules')
          .select('*')
          .order('module_order', { ascending: true });
          
        if (error) throw error;
        return data;
      });
      
      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as ProbationTrainingModule[]);
        setTotalModules(modulesData.length);
        setModulesCompleted(completedCount);
        
        if (scoreCount > 0) {
          const calculatedAvgScore = Math.round(totalScore / scoreCount);
          setOverallScore(calculatedAvgScore);
        }
        
        const firstIncompleteModule = modulesData.find((module: ProbationTrainingModule) => 
          !progressMap[module.id] || !progressMap[module.id].completed
        ) || modulesData[0];
        
        setCurrentModule(firstIncompleteModule as ProbationTrainingModule);
        
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
      setShowQuiz(false);
      setShowResultScreen(false);
      isLoadingRef.current = false;
    }
  };

  const loadQuestionsForModule = async (moduleId: string, retryCount = 0): Promise<boolean> => {
    if (questionsCache.current[moduleId]) {
      console.log("Using cached questions for module:", moduleId);
      setQuestions(questionsCache.current[moduleId]);
      return true;
    }
    
    try {
      console.log("Loading questions for module:", moduleId);
      
      const { data, error } = await executeWithConcurrencyLimit(async () => {
        return await supabase
          .from('probation_training_questions')
          .select('*')
          .eq('module_id', moduleId)
          .order('question_order', { ascending: true });
      });
      
      if (error) throw error;
      
      if (data) {
        console.log("Received questions:", data);
        const formattedQuestions = data.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : []
        }));
        
        questionsCache.current[moduleId] = formattedQuestions as ProbationTrainingQuestion[];
        setQuestions(formattedQuestions as ProbationTrainingQuestion[]);
        setQuestionsLoadRetries(0);
        return true;
      } else {
        console.log("No questions found for this module");
        questionsCache.current[moduleId] = [];
        setQuestions([]);
        return true;
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      
      if (retryCount < 3) {
        setQuestionsLoadRetries(retryCount + 1);
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return loadQuestionsForModule(moduleId, retryCount + 1);
      }
      
      setError("Failed to load quiz questions. Please try again later.");
      return false;
    }
  };
  
  const handleVideoComplete = async () => {
    if (!user?.id || !currentModule) return;
    
    try {
      if (!userProgress[currentModule.id]) {
        const { error } = await executeWithConcurrencyLimit(async () => {
          return await supabase
            .from('user_probation_progress')
            .insert({
              user_id: user.id,
              module_id: currentModule.id,
              completed: false
            });
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
      
      if (questions.length === 0) {
        await handleModuleAutoComplete();
      } else {
        setShowQuiz(true);
        setTimeout(() => {
          document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error("Error updating video progress:", error);
      setError("Failed to save your progress. Please try again.");
    }
  };

  const handleModuleAutoComplete = async () => {
    if (!user?.id || !currentModule) return;
    
    try {
      const { error } = await executeWithConcurrencyLimit(async () => {
        return await supabase
          .from('user_probation_progress')
          .update({
            passed: null,
            score: 100,
            completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('module_id', currentModule.id);
      });
      
      if (error) throw error;
      
      setUserProgress(prev => ({
        ...prev,
        [currentModule.id]: {
          ...prev[currentModule.id],
          user_id: user.id,
          module_id: currentModule.id,
          passed: null,
          score: 100,
          completed: true
        }
      }));
      
      const updatedProgressMap = {
        ...userProgress,
        [currentModule.id]: {
          user_id: user.id,
          module_id: currentModule.id,
          passed: null,
          score: 100,
          completed: true
        }
      };
      
      updateOverallScore(updatedProgressMap);
      
      setTimeout(() => {
        handleNextModule();
      }, 300);
    } catch (error) {
      console.error("Error auto-completing module:", error);
      setError("Failed to complete this module. Please try again.");
    }
  };
  
  const updateOverallScore = (progressMap: Record<string, UserProbationProgress>) => {
    let totalScore = 0;
    let scoreCount = 0;
    let completedCount = 0;
    
    Object.values(progressMap).forEach(progress => {
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
      const calculatedAvgScore = Math.round(totalScore / scoreCount);
      setOverallScore(calculatedAvgScore);
      
      if (completedCount === modules.length && modules.length > 0) {
        const allPassed = calculatedAvgScore >= 85;
        
        if (profileUpdateInProgress.current) {
          console.log('Profile update already in progress, skipping');
          return;
        }
        
        profileUpdateInProgress.current = true;
        updateProfile({
          probation_training_completed: true,
          probation_training_passed: allPassed
        })
        .then(() => {
          console.log("Training status updated successfully:", 
            {passed: allPassed, score: calculatedAvgScore});
            
          throttledRefreshProfile()
            .finally(() => {
              profileUpdateInProgress.current = false;
            });
        })
        .catch(error => {
          profileUpdateInProgress.current = false;
          console.error("Error updating training status:", error);
          setError("Failed to save your progress. Please try again.");
          
          toast({
            title: "Error saving progress",
            description: "There was a problem saving your training progress. Your completion may not be recorded.",
            variant: "destructive",
          });
        });
      }
    }
  };
  
  const handleQuizComplete = async (score: number) => {
    if (!user?.id || !currentModule) return;
    
    try {
      setQuizScore(score);
      
      const progress = userProgress[currentModule.id];
      
      if (progress) {
        const { error } = await executeWithConcurrencyLimit(async () => {
          return await supabase
            .from('user_probation_progress')
            .update({
              passed: null,
              score,
              completed: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('module_id', currentModule.id);
        });
        
        if (error) throw error;
      } else {
        const { error } = await executeWithConcurrencyLimit(async () => {
          return await supabase
            .from('user_probation_progress')
            .insert({
              user_id: user.id,
              module_id: currentModule.id,
              passed: null,
              score,
              completed: true
            });
        });
        
        if (error) throw error;
      }
      
      const updatedProgressMap = {
        ...userProgress,
        [currentModule.id]: {
          ...userProgress[currentModule.id],
          user_id: user.id,
          module_id: currentModule.id,
          passed: null,
          score,
          completed: true
        }
      };
      
      setUserProgress(updatedProgressMap);
      updateOverallScore(updatedProgressMap);
      
      setTimeout(() => {
        setShowResultScreen(true);
      }, 300);
    } catch (error) {
      console.error("Error saving quiz results:", error);
      setError("Failed to save your quiz results. Please try again.");
      
      toast({
        title: "Error saving quiz results",
        description: "There was a problem saving your quiz results. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectModule = async (module: ProbationTrainingModule) => {
    if (moduleTransitioning) return;
    
    const moduleIndex = modules.findIndex(m => m.id === module.id);
    const previousModules = modules.slice(0, moduleIndex);
    const allPreviousCompleted = previousModules.every(m => isModuleCompleted(m.id));
    
    if (!allPreviousCompleted && moduleIndex > 0) {
      toast({
        title: "Module Locked",
        description: "Please complete previous modules first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setError(null);
      setModuleTransitioning(true);
      setCurrentModule(module);
      setQuizScore(0);
      setShowQuiz(false);
      setShowResultScreen(false);
      
      const moduleProgress = userProgress[module.id];
      if (moduleProgress && moduleProgress.completed) {
        setQuizScore(moduleProgress.score || 0);
        setShowResultScreen(true);
      }
      
      let questionsLoaded = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!questionsLoaded && retryCount < maxRetries) {
        questionsLoaded = await loadQuestionsForModule(module.id, retryCount);
        if (!questionsLoaded) {
          console.log(`Retry ${retryCount + 1} loading questions for module ${module.id}`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!questionsLoaded) {
        setError("Failed to load quiz questions after multiple attempts. Please try again.");
      }
    } catch (error) {
      console.error("Error selecting module:", error);
      setError("Failed to load the selected module. Please try again.");
    } finally {
      setModuleTransitioning(false);
    }
  };
  
  const handleCloseModal = () => {
    throttledRefreshProfile()
      .then(() => {
        console.log("User profile refreshed on modal close");
        onClose();
      })
      .catch(error => {
        console.error("Error refreshing user profile on modal close:", error);
        onClose();
      });
  };
  
  const handleNextModule = async () => {
    if (!currentModule || moduleTransitioning) return;
    
    try {
      setModuleTransitioning(true);
      setError(null);
      
      const currentIndex = modules.findIndex(m => m.id === currentModule.id);
      if (currentIndex < modules.length - 1) {
        const nextModule = modules[currentIndex + 1];
        
        await new Promise(resolve => setTimeout(resolve, 500));
        await handleSelectModule(nextModule);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error navigating to next module:", error);
      setError("Failed to load the next module. Please try again.");
    } finally {
      setModuleTransitioning(false);
    }
  };
  
  const handleRetryLoadQuestions = async () => {
    if (!currentModule) return;
    setError(null);
    setModuleTransitioning(true);
    
    try {
      const success = await loadQuestionsForModule(currentModule.id, questionsLoadRetries);
      if (!success && questionsLoadRetries >= 3) {
        setError("Failed to load questions after multiple attempts. Please try again later.");
      }
    } catch (error) {
      console.error("Error retrying question load:", error);
      setError("Failed to load quiz questions. Please try again later.");
    } finally {
      setModuleTransitioning(false);
    }
  };
  
  const isModuleCompleted = (moduleId: string) => {
    return userProgress[moduleId]?.completed === true;
  };
  
  const isCurrentModuleInProgress = (moduleId: string) => {
    return currentModule?.id === moduleId && !isModuleCompleted(moduleId);
  };

  const renderModuleList = () => {
    return (
      <div className="mb-6 overflow-y-auto max-h-[calc(70vh-4rem)]">
        <h3 className="text-lg font-medium mb-3">ReadyMode Training Modules</h3>
        <div className="grid grid-cols-1 gap-2">
          {modules.map((module, index) => (
            <div 
              key={module.id}
              onClick={() => handleSelectModule(module)}
              className={`
                p-3 rounded-lg cursor-pointer flex items-center justify-between
                ${currentModule?.id === module.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}
                ${isModuleCompleted(module.id) ? 'border-l-4 border-l-green-500' : ''}
                ${isCurrentModuleInProgress(module.id) ? 'border-l-4 border-l-yellow-400' : ''}
                ${!isModuleCompleted(module.id) && !isCurrentModuleInProgress(module.id) ? 'border-l-4 border-l-yellow-300' : ''}
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
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Completed
                    </span>
                  </div>
                )}
              </div>
              {isModuleCompleted(module.id) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                isCurrentModuleInProgress(module.id) && 
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
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
                ? "Congratulations! You've completed the ReadyMode training program." 
                : "You need 90% overall to complete the training program."}
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
        <div className="flex flex-col items-center py-8">
          <Alert variant="destructive" className="mb-4 max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={handleRetryLoadQuestions} 
            variant="outline" 
            className="mt-4"
            disabled={moduleTransitioning}
          >
            {moduleTransitioning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></span>
                Retrying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Loading Content
              </span>
            )}
          </Button>
          <Button 
            onClick={() => setError(null)} 
            variant="ghost" 
            className="mt-2"
          >
            Go Back to Modules
          </Button>
        </div>
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
        <div className="w-full md:w-1/4 overflow-y-auto">
          {renderModuleList()}
        </div>
        
        <div className="w-full md:w-3/4">
          {moduleTransitioning ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
              <p className="text-sm text-gray-500">Loading module content...</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(70vh-2rem)]">
              <div className="mb-4">
                <h2 className="text-xl font-bold">{currentModule.title}</h2>
                {currentModule.description && (
                  <p className="text-gray-600 mt-1">{currentModule.description}</p>
                )}
              </div>
              
              <AdditionalTrainingVideo 
                videoUrl={currentModule.video_url}
                onComplete={handleVideoComplete}
                isCompleted={userProgress[currentModule.id]?.completed === true}
                isPending={isCurrentModuleInProgress(currentModule.id)}
              />
              
              {showQuiz && !showResultScreen && questions.length > 0 && (
                <div className="mt-8" id="quiz-section">
                  <h3 className="text-lg font-medium mb-4">Module Quiz</h3>
                  <AdditionalTrainingQuiz
                    questions={questions}
                    onComplete={handleQuizComplete}
                  />
                </div>
              )}
              
              {showResultScreen && (
                <div className="text-center py-6 mt-8">
                  <div className="flex justify-center mb-6">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-600">
                    Module Completed
                  </h3>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleNextModule}
                      disabled={moduleTransitioning}
                      className="px-6 py-2 rounded-full text-white font-medium bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      {moduleTransitioning ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></span>
                          Loading Next Module...
                        </span>
                      ) : (
                        "Continue to Next Module"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ReadyMode Training</DialogTitle>
        </DialogHeader>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalTrainingModal;
