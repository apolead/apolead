import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

interface TrainingQuizProps {
  onComplete: (passed: boolean, score: number) => void;
}

const TrainingQuiz: React.FC<TrainingQuizProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedQuestions = data.map(q => ({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) 
              ? (q.options as any[]).map(opt => String(opt)) 
              : [],
            correct_answer: q.correct_answer
          }));
          
          setQuestions(formattedQuestions);
        } else {
          setQuestions([
            {
              id: 'q1',
              question: 'What is the primary role of an AI conversation agent?',
              options: [
                'To replace human customer service representatives',
                'To assist users in finding information and solving problems',
                'To sell products to customers',
                'To collect user data'
              ],
              correct_answer: 1
            },
            {
              id: 'q2',
              question: 'How should you handle a user who is upset or frustrated?',
              options: [
                'Ignore their frustration and focus only on their question',
                'Tell them to calm down',
                'Acknowledge their feelings, apologize if appropriate, and try to help',
                'Transfer them to another agent'
              ],
              correct_answer: 2
            },
            {
              id: 'q3',
              question: 'What should you do if you don\'t know the answer to a user\'s question?',
              options: [
                'Make up an answer that sounds plausible',
                'Say "I don\'t know" and end the conversation',
                'Honestly acknowledge the limitation and offer alternative solutions or resources',
                'Ignore the question and change the subject'
              ],
              correct_answer: 2
            },
            {
              id: 'q4',
              question: 'What is an important ethical consideration when working as an AI conversation agent?',
              options: [
                'Always prioritize speed over accuracy',
                'Respect user privacy and maintain confidentiality',
                'Collect as much user information as possible',
                'Use technical language to sound more knowledgeable'
              ],
              correct_answer: 1
            },
            {
              id: 'q5',
              question: 'How can you ensure you\'re providing the best possible service?',
              options: [
                'Always giving the quickest answer',
                'Being friendly but not necessarily accurate',
                'Continuous learning, staying updated, and seeking feedback',
                'Working as many hours as possible without breaks'
              ],
              correct_answer: 2
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        setError("Failed to load quiz questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
    
    setAnswers({});
    setCurrentQuestionIndex(0);
    console.log('Initializing quiz with empty answers');
  }, []);
  
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
        <AlertDescription>No quiz questions are available. Please contact support.</AlertDescription>
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
    
    const passed = correctCount === questions.length;
    
    console.log('Quiz completed. Passed:', passed, 'Score:', scorePercentage);
    console.log('Answers submitted:', answers);
    
    onComplete(passed, scorePercentage);
  };
  
  const currentAnswer = answers[currentQuestion?.id] !== undefined 
    ? answers[currentQuestion.id].toString() 
    : undefined;
  
  console.log('Rendering question:', currentQuestionIndex, 'Current answer:', currentAnswer);
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Training Quiz</h3>
        <p className="text-sm text-gray-500">
          Please answer all questions to complete your training. You must answer all questions correctly to pass.
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

export default TrainingQuiz;
