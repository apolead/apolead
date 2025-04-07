
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IModuleQuestionsTable } from '@/types/supabase';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  question_order: number;
}

interface ProbationTrainingQuizProps {
  moduleId: string;
  onComplete: (passed: boolean, score: number) => void;
}

const ProbationTrainingQuiz: React.FC<ProbationTrainingQuizProps> = ({ moduleId, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Fetching module questions for module:", moduleId);
        const { data, error } = await supabase
          .from('module_questions')
          .select('*')
          .eq('module_id', moduleId)
          .order('question_order', { ascending: true }) as { data: IModuleQuestionsTable[] | null; error: Error | null };
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Received questions from database:", data);
          const formattedQuestions = data.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) 
              ? (q.options as any[]).map(opt => String(opt)) 
              : [],
            correct_answer: q.correct_answer,
            question_order: q.question_order
          }));
          
          setQuestions(formattedQuestions);
        } else {
          setError("No questions found for this module. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching module questions:", error);
        setError("Failed to load quiz questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
    setAnswers({});
    setCurrentQuestionIndex(0);
  }, [moduleId]);
  
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
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (questions.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No quiz questions are available for this module. Please contact support.</AlertDescription>
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
    const passed = scorePercentage >= 85; // 85% passing threshold
    
    console.log('Module quiz completed. Passed:', passed, 'Score:', scorePercentage);
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
          Please answer all questions to complete this module. You need 85% to pass.
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
          {currentQuestion.options.map((option, optIndex) => (
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
