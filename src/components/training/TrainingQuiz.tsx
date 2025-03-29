
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, ChevronRight } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TrainingQuizProps {
  onComplete: (passed: boolean, score: number) => void;
}

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary role of an AI conversation agent?',
    options: [
      'To replace human customer service representatives',
      'To assist users in finding information and solving problems',
      'To sell products to customers',
      'To collect user data'
    ],
    correctAnswer: 1
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
    correctAnswer: 2
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
    correctAnswer: 2
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
    correctAnswer: 1
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
    correctAnswer: 2
  }
];

const TrainingQuiz: React.FC<TrainingQuizProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
  const handleChange = (answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };
  
  const handleNext = () => {
    if (!answers[currentQuestion.id] && answers[currentQuestion.id] !== 0) {
      setError("Please select an answer before continuing.");
      return;
    }
    
    setError(null);
    
    if (isLastQuestion) {
      // Submit the quiz
      handleSubmit();
    } else {
      // Go to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    
    // Pass only if ALL questions are answered correctly
    const passed = correctCount === questions.length;
    
    // Call the onComplete callback with the result
    onComplete(passed, scorePercentage);
  };
  
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
          value={answers[currentQuestion.id]?.toString()} 
          onValueChange={(value) => handleChange(parseInt(value))}
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
          disabled={!(answers[currentQuestion.id] !== undefined)}
          className="px-6"
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
