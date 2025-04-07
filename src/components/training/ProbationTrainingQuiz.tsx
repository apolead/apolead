
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProbationTrainingQuestion } from '@/types/supabase';

interface ProbationTrainingQuizProps {
  questions: ProbationTrainingQuestion[];
  onComplete: (score: number, passed: boolean) => void;
}

const ProbationTrainingQuiz: React.FC<ProbationTrainingQuizProps> = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showError, setShowError] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  // Make sure questions are sorted by question_order
  const sortedQuestions = [...questions].sort((a, b) => a.question_order - b.question_order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  
  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
    setShowError(false);
  };
  
  const handleNext = () => {
    if (answers[currentQuestionIndex] === undefined) {
      setShowError(true);
      return;
    }
    
    setShowError(false);
    
    if (currentQuestionIndex < sortedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const isMultiSelectQuestion = (question: ProbationTrainingQuestion): boolean => {
    // Special case for "What views are available in the Callback Calendar? (Select all that apply)"
    return question.correct_answer === -1;
  };
  
  const handleSubmit = () => {
    if (answers[currentQuestionIndex] === undefined) {
      setShowError(true);
      return;
    }
    
    // Calculate the score
    let correctAnswers = 0;
    
    answers.forEach((answer, index) => {
      const question = sortedQuestions[index];
      
      if (isMultiSelectQuestion(question)) {
        // Special handling for multi-select question
        // For the "What views are available in the Callback Calendar?" question, 
        // the correct answers are options 0, 1, and 2
        if (answer === 0 || answer === 1 || answer === 2) {
          correctAnswers++;
        }
      } else if (answer === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / sortedQuestions.length) * 100);
    const passed = score >= 85; // 85% or higher to pass
    
    setQuizSubmitted(true);
    onComplete(score, passed);
  };
  
  if (!currentQuestion) {
    return <div>Loading questions...</div>;
  }
  
  return (
    <div className="w-full">
      {!quizSubmitted ? (
        <div className="space-y-6">
          <div className="flex justify-between mb-4">
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {sortedQuestions.length}
            </div>
            <div className="text-sm font-medium">
              {Math.round(((currentQuestionIndex + 1) / sortedQuestions.length) * 100)}% Complete
            </div>
          </div>
          
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 ease-in-out"
              style={{ width: `${((currentQuestionIndex + 1) / sortedQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
            
            {showError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select an answer before continuing.
                </AlertDescription>
              </Alert>
            )}
            
            <RadioGroup
              value={answers[currentQuestionIndex]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
              className="mt-4 space-y-3"
            >
              {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 rounded-md border hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {currentQuestionIndex < sortedQuestions.length - 1 ? (
              <Button onClick={handleNext} className="ml-auto">
                Next Question <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto bg-green-600 hover:bg-green-700">
                Submit Quiz <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Quiz Submitted</h3>
          <p className="text-gray-600 mb-6">Your responses have been recorded.</p>
        </div>
      )}
    </div>
  );
};

export default ProbationTrainingQuiz;
