
import React, { useState } from 'react';
import { CheckCircle, ChevronRight, AlertTriangle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

interface ProbationTrainingQuizProps {
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  onNext: () => void;
  isLastModule: boolean;
}

const ProbationTrainingQuiz: React.FC<ProbationTrainingQuizProps> = ({
  questions,
  onComplete,
  onNext,
  isLastModule
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    
    questions.forEach(question => {
      // Skip the "Select all that apply" question which has a negative correct_answer value
      if (question.correct_answer < 0) return;
      
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const totalQuestions = questions.filter(q => q.correct_answer >= 0).length;
    const calculatedScore = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 100) 
      : 0;
    
    setScore(calculatedScore);
    setShowResults(true);
    
    // A score of 85% or higher is considered passing
    const passed = calculatedScore >= 85;
    onComplete(calculatedScore, passed);
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="text-center p-8">No questions available for this module.</div>;
  }

  if (showResults) {
    const passed = score >= 85;
    
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-3">
            {passed ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {passed ? "Congratulations!" : "Quiz Results"}
          </h2>
          <p className="text-lg font-medium mb-1">
            Your score: {score}%
          </p>
          <p className="text-gray-500">
            {passed 
              ? "You've passed this module's quiz!" 
              : "You need at least 85% to pass."}
          </p>
        </div>

        {isLastModule ? (
          <div className="text-center">
            <p className="mb-4">
              {passed 
                ? "You've completed all training modules! You can now proceed with the next steps." 
                : "Unfortunately, you did not achieve the minimum required score. Please contact your supervisor for guidance."}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={onNext}
              disabled={!passed}
              className={`px-6 py-2 rounded-md ${passed ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} text-white`}
            >
              {passed ? "Next Module" : "Quiz Not Passed"}
            </button>
            {!passed && (
              <p className="mt-2 text-sm text-red-500">
                You need to score at least 85% to continue to the next module.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  const isMultiSelectQuestion = currentQuestion.correct_answer < 0;

  return (
    <div className="p-2">
      <h3 className="text-lg font-medium mb-6">Question {currentQuestionIndex + 1} of {questions.length}</h3>
      
      <div className="mb-8">
        <p className="text-lg mb-4">{currentQuestion.question}</p>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                answers[currentQuestion.id] === index
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleAnswer(currentQuestion.id, index)}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                  answers[currentQuestion.id] === index
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'border-gray-400'
                } mr-3`}>
                  {answers[currentQuestion.id] === index && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isMultiSelectQuestion && (
        <p className="text-sm text-gray-600 italic mb-4">
          Note: This question may have multiple correct answers. Select all that apply.
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNextQuestion}
          disabled={answers[currentQuestion.id] === undefined}
          className={`flex items-center px-6 py-2 rounded-md ${
            answers[currentQuestion.id] === undefined
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next Question
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            'Submit Quiz'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProbationTrainingQuiz;
