
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, ChevronRight } from 'lucide-react';
import { ProbationTrainingQuestion } from '@/types/probation-training';

interface ProbationTrainingQuizProps {
  questions: ProbationTrainingQuestion[];
  onComplete: (passed: boolean, score: number) => void;
}

const ProbationTrainingQuiz: React.FC<ProbationTrainingQuizProps> = ({ 
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
    const passed = scorePercentage >= 70; // Passing score is 70%
    
    console.log('Quiz completed. Passed:', passed, 'Score:', scorePercentage);
    console.log('Answers submitted:', answers);
    
    onComplete(passed, scorePercentage);
  };
  
  const currentAnswer = answers[currentQuestion?.id] !== undefined 
    ? answers[currentQuestion.id].toString() 
    : undefined;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Module Quiz</h3>
        <p className="text-sm text-gray-500">
          Please answer all questions to complete this training module. You must score at least 70% to pass.
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
                      ? 'bg-blue-500' 
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
          className="px-6 text-white"
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

export default ProbationTrainingQuiz;
