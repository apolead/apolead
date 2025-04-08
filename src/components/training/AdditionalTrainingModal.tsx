import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useAdditionalTrainingData } from '@/hooks/useAdditionalTrainingData';
import AdditionalTrainingVideo from './AdditionalTrainingVideo';
import AdditionalTrainingQuiz from './AdditionalTrainingQuiz';
import { ProbationTrainingModule, ProbationTrainingQuestion } from '@/types/probation-training';

interface AdditionalTrainingModalProps {
  isOpen: boolean;
  onClose: (score?: number, passed?: boolean) => void;
}

const AdditionalTrainingModal: React.FC<AdditionalTrainingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'video' | 'quiz'>('video');
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [moduleQuestions, setModuleQuestions] = useState<ProbationTrainingQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { userProfile } = useAuth();
  const { modules, isLoading, loadingError } = useAdditionalTrainingData();

  useEffect(() => {
    if (modules && modules.length > 0) {
      // Sort modules by module_order
      const sortedModules = [...modules].sort((a, b) => a.module_order - b.module_order);
      if (!isLoading && modules.length > 0 && currentModuleIndex >= modules.length) {
        setCurrentModuleIndex(0);
      }
    }
  }, [modules, currentModuleIndex, isLoading]);

  useEffect(() => {
    if (modules && modules.length > 0 && modules[currentModuleIndex]) {
      const currentModule = modules[currentModuleIndex];
      if (currentModule.questions) {
        setModuleQuestions(currentModule.questions);
      }
    }
  }, [modules, currentModuleIndex]);
  
  const handleVideoComplete = () => {
    if (!modules || modules.length === 0) return;
    
    const currentModule = modules[currentModuleIndex];
    
    if (!currentModule) {
      setError("Module not found. Please try again.");
      return;
    }
    
    const updatedCompletedModules = { ...completedModules };
    updatedCompletedModules[currentModule.id] = true;
    setCompletedModules(updatedCompletedModules);
    
    // If this module has quiz questions, show the quiz
    if (moduleQuestions && moduleQuestions.length > 0) {
      setCurrentStep('quiz');
    } else {
      // If no questions, proceed to next module
      handleNextModule();
    }
  };
  
  const handleQuizComplete = (score: number) => {
    if (!modules || modules.length === 0) return;
    
    const currentModule = modules[currentModuleIndex];
    
    if (!currentModule) {
      setError("Module not found. Please try again.");
      return;
    }
    
    // Store the score for this module
    const updatedQuizScores = { ...quizScores };
    updatedQuizScores[currentModule.id] = score;
    setQuizScores(updatedQuizScores);
    
    // Reset to video for next module
    setCurrentStep('video');
    
    // If this is the last module, calculate overall score and close
    if (currentModuleIndex === modules.length - 1) {
      calculateOverallScore();
    } else {
      // Otherwise, move to next module
      handleNextModule();
    }
  };
  
  const calculateOverallScore = () => {
    if (!modules || modules.length === 0) return;
    
    let totalScore = 0;
    let moduleCount = 0;
    
    for (const moduleId in quizScores) {
      totalScore += quizScores[moduleId];
      moduleCount++;
    }
    
    const overallScore = Math.round(totalScore / moduleCount);
    const passed = overallScore >= 70; // Assuming 70% is passing
    
    // Close modal and pass back the score and passed status
    onClose(overallScore, passed);
  };
  
  const handleNextModule = () => {
    if (!modules) return;
    
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentStep('video');
    } else {
      // If this was the last module, calculate overall score and close
      calculateOverallScore();
    }
  };
  
  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentStep('video');
    }
  };
  
  if (!isOpen) return null;
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading training content...</p>
        </div>
      </div>
    );
  }
  
  if (loadingError || !modules || modules.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-center mb-4 text-5xl">⚠️</div>
          <h3 className="text-xl font-semibold text-center mb-2">Failed to load training content</h3>
          <p className="text-gray-600 mb-6 text-center">
            {loadingError || "Unable to load the training modules. Please try again later."}
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => onClose()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const currentModule = modules[currentModuleIndex];
  const totalModules = modules.length;
  const isLastModule = currentModuleIndex === totalModules - 1;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl mx-4">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {currentModule ? currentModule.title : "Additional Training"}
            </h2>
            <div className="text-sm px-3 py-1 bg-white/20 rounded-full">
              Module {currentModuleIndex + 1} of {totalModules}
            </div>
          </div>
          
          <button 
            onClick={() => onClose()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${((currentModuleIndex) / (totalModules - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>Getting started</span>
              <span>Final module</span>
            </div>
          </div>
          
          {currentStep === 'video' && currentModule && (
            <AdditionalTrainingVideo 
              videoUrl={currentModule.video_url}
              onComplete={handleVideoComplete}
              hasQuiz={moduleQuestions && moduleQuestions.length > 0}
              isLastModule={isLastModule}
              moduleNumber={currentModuleIndex + 1}
            />
          )}
          
          {currentStep === 'quiz' && moduleQuestions && (
            <AdditionalTrainingQuiz 
              questions={moduleQuestions}
              onComplete={handleQuizComplete}
              moduleTitle={currentModule ? currentModule.title : ""}
            />
          )}
        </div>
        
        <div className="border-t p-4 flex justify-between">
          <button
            onClick={handlePreviousModule}
            disabled={currentModuleIndex === 0}
            className={`flex items-center ${
              currentModuleIndex === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous Module
          </button>
          
          <div className="text-sm text-gray-500">
            {currentModule && completedModules[currentModule.id] && (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Module {currentModuleIndex + 1} in progress
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalTrainingModal;
