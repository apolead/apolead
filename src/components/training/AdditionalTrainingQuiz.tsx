
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, ChevronRight, RefreshCw } from 'lucide-react';
import { ProbationTrainingQuestion } from '@/types/probation-training';

interface AdditionalTrainingQuizProps {
  questions: ProbationTrainingQuestion[];
  onComplete: (score: number) => void;
}

const AdditionalTrainingQuiz: React.FC<AdditionalTrainingQuizProps> = ({ 
  questions, 
  onComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Safety check for questions array
  useEffect(() => {
    // Reset answers when questions change
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitting(false);
  }, [questions]);
  
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No quiz questions are available for this module. Please try refreshing the page.</AlertDescription>
      </Alert>
    );
  }
  
  // Extra safety check to ensure currentQuestionIndex is within bounds
  const safeCurrentIndex = Math.min(currentQuestionIndex, questions.length - 1);
  const currentQuestion = questions[safeCurrentIndex];
  
  // Make sure the current question is valid
  if (!currentQuestion || typeof currentQuestion !== 'object') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an issue loading the current question. Please try refreshing the page.
        </AlertDescription>
        <div className="mt-4">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Page
          </Button>
        </div>
      </Alert>
    );
  }
  
  const totalQuestions = questions.length;
  const isLastQuestion = safeCurrentIndex === totalQuestions - 1;
  
  const handleChange = (value: string) => {
    console.log('Answer selected:', value, 'for question:', currentQuestion.id);
    const answerIndex = parseInt(value, 10);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };
  
  const handleNext = () => {
    if (answers[currentQuestion.id] === undefined) {
      setError("Please select an answer before continuing.");
      return;
    }
    
    setError(null);
    
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleSubmit = () => {
    try {
      setIsSubmitting(true);
      
      let correctCount = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correct_answer) {
          correctCount++;
        }
      });
      
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      console.log('Quiz completed. Score:', scorePercentage);
      console.log('Answers submitted:', answers);
      
      // We're not determining pass/fail per module anymore
      onComplete(scorePercentage);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("There was an error submitting your quiz. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  // Make sure options exist and are valid
  const safeOptions = Array.isArray(currentQuestion.options) ? currentQuestion.options : [];
  
  const currentAnswer = answers[currentQuestion?.id] !== undefined 
    ? answers[currentQuestion.id].toString() 
    : undefined;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Removed the duplicate "Module Quiz" heading since it's already in AdditionalTrainingModal.tsx */}
        <p className="text-sm text-gray-500">
          Please answer all questions to complete this training module.
        </p>
        
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">
            Question {safeCurrentIndex + 1} of {totalQuestions}
          </p>
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-6 rounded-full ${
                  index < safeCurrentIndex 
                    ? 'bg-green-500' 
                    : index === safeCurrentIndex 
                      ? 'bg-purple-600' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="p-4 border rounded-lg bg-gray-50">
        <h4 className="font-medium mb-4 text-lg">
          {currentQuestion.question}
        </h4>
        <RadioGroup 
          value={currentAnswer} 
          onValueChange={handleChange}
          className="space-y-3"
        >
          {safeOptions.map((option, optIndex) => (
            <div key={optIndex} className="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-100">
              <RadioGroupItem 
                value={optIndex.toString()} 
                id={`${currentQuestion.id}-${optIndex}`} 
                className="mt-1"
              />
              <Label 
                htmlFor={`${currentQuestion.id}-${optIndex}`}
                className="text-sm font-normal w-full cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button 
          type="button" 
          onClick={handleNext}
          disabled={answers[currentQuestion.id] === undefined || isSubmitting}
          className="px-6 text-white bg-[#4f46e5] hover:bg-[#4338ca]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></span>
              Submitting...
            </span>
          ) : isLastQuestion ? (
            'Submit Quiz'
          ) : (
            <>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdditionalTrainingQuiz;
