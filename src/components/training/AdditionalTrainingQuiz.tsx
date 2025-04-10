
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, ChevronRight } from 'lucide-react';
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
  
  if (questions.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No quiz questions are available for this module.</AlertDescription>
      </Alert>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
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
  };
  
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
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-6 rounded-full ${
                  index < currentQuestionIndex 
                    ? 'bg-green-500' 
                    : index === currentQuestionIndex 
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
          {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, optIndex) => (
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
          disabled={answers[currentQuestion.id] === undefined}
          className="px-6 text-white bg-[#4f46e5] hover:bg-[#4338ca]"
        >
          {isLastQuestion ? (
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
