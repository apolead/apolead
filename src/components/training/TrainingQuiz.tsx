
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // Index of the correct answer (0-based)
}

interface TrainingQuizProps {
  onComplete: (passed: boolean, score: number) => void;
}

const TrainingQuiz: React.FC<TrainingQuizProps> = ({ onComplete }) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(quizQuestions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestion] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const navigateToNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const navigateToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedOptions[index] === question.answer) {
        correctAnswers++;
      }
    });
    return {
      score: correctAnswers,
      total: quizQuestions.length,
      percentage: (correctAnswers / quizQuestions.length) * 100
    };
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    
    try {
      const { score, total, percentage } = calculateScore();
      const passed = percentage === 100; // Must get 100% to pass
      
      // Update user profile with quiz results
      await updateProfile({
        quiz_score: score,
        quiz_passed: passed
      });
      
      setShowResults(true);
      onComplete(passed, score);
      
      if (passed) {
        toast({
          title: "Quiz Passed!",
          description: `Congratulations! You scored ${score}/${total} (${percentage}%)`,
        });
      } else {
        toast({
          title: "Quiz Failed",
          description: `You scored ${score}/${total} (${percentage}%). You need 100% to pass.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz results",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allQuestionsAnswered = selectedOptions.every(option => option !== -1);
  const { score, total, percentage } = calculateScore();

  return (
    <div className="training-quiz-container" style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    }}>
      {!showResults ? (
        <>
          <div className="quiz-header" style={{
            textAlign: 'center',
            marginBottom: '25px'
          }}>
            <h3 style={{ fontSize: '22px', color: '#1e293b', marginBottom: '10px' }}>Call Center Basic Training Quiz</h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Complete this quiz to test your knowledge. You must score 100% to pass.
            </p>
            <div className="quiz-progress" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '15px',
              gap: '5px'
            }}>
              {quizQuestions.map((_, index) => (
                <div 
                  key={index}
                  className={`progress-dot ${currentQuestion === index ? 'active' : ''} ${selectedOptions[index] !== -1 ? 'answered' : ''}`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: currentQuestion === index 
                      ? '#4f46e5' 
                      : selectedOptions[index] !== -1 
                        ? 'rgba(79, 70, 229, 0.3)' 
                        : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setCurrentQuestion(index)}
                ></div>
              ))}
            </div>
          </div>

          <div className="question-container" style={{
            marginBottom: '25px'
          }}>
            <div className="question-number" style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '10px'
            }}>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </div>
            <div className="question-text" style={{
              fontSize: '18px',
              color: '#1e293b',
              marginBottom: '20px',
              fontWeight: 500
            }}>
              {quizQuestions[currentQuestion].question}
            </div>

            <div className="options-container" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <div 
                  key={index}
                  className={`option ${selectedOptions[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: selectedOptions[currentQuestion] === index ? '#4f46e5' : '#e2e8f0',
                    backgroundColor: selectedOptions[currentQuestion] === index ? 'rgba(79, 70, 229, 0.1)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div className="option-indicator" style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: selectedOptions[currentQuestion] === index ? '#4f46e5' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedOptions[currentQuestion] === index ? '#4f46e5' : 'white',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {selectedOptions[currentQuestion] === index && (
                      <i className="fas fa-check" style={{ fontSize: '10px' }}></i>
                    )}
                  </div>
                  <div className="option-text" style={{ fontSize: '16px', color: '#1e293b' }}>
                    {option}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="navigation-buttons" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px'
          }}>
            <button 
              onClick={navigateToPreviousQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: currentQuestion === 0 ? '#e2e8f0' : 'white',
                color: currentQuestion === 0 ? '#94a3b8' : '#1e293b',
                fontWeight: 500,
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: currentQuestion === 0 ? 'none' : '0 2px 5px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Previous
            </button>
            
            {currentQuestion < quizQuestions.length - 1 ? (
              <button 
                onClick={navigateToNextQuestion}
                disabled={selectedOptions[currentQuestion] === -1}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: selectedOptions[currentQuestion] === -1 ? '#e2e8f0' : 'white',
                  color: selectedOptions[currentQuestion] === -1 ? '#94a3b8' : '#1e293b',
                  fontWeight: 500,
                  cursor: selectedOptions[currentQuestion] === -1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: selectedOptions[currentQuestion] === -1 ? 'none' : '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                Next
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                onClick={handleSubmitQuiz}
                disabled={!allQuestionsAnswered || submitting}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: allQuestionsAnswered 
                    ? 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)' 
                    : '#e2e8f0',
                  color: allQuestionsAnswered ? 'white' : '#94a3b8',
                  fontWeight: 500,
                  cursor: allQuestionsAnswered && !submitting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: allQuestionsAnswered ? '0 4px 10px rgba(79,70,229,0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <i className="fas fa-check-circle"></i>
                  </>
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="results-container" style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div className="results-icon" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: percentage === 100 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 25px',
            boxShadow: percentage === 100 
              ? '0 8px 20px rgba(16,185,129,0.3)'
              : '0 8px 20px rgba(239,68,68,0.3)'
          }}>
            <i className={`fas ${percentage === 100 ? 'fa-check' : 'fa-times'}`}></i>
          </div>
          
          <h3 style={{ 
            fontSize: '24px', 
            color: percentage === 100 ? '#10B981' : '#EF4444',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            {percentage === 100 ? 'Quiz Passed!' : 'Quiz Failed'}
          </h3>
          
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '20px' }}>
            You scored {score} out of {total} ({percentage}%)
          </p>
          
          {percentage === 100 ? (
            <div className="success-message" style={{
              padding: '15px',
              backgroundColor: 'rgba(16,185,129,0.1)',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <p style={{ color: '#10B981', fontWeight: 500 }}>
                Congratulations! You can now proceed to the next step.
              </p>
            </div>
          ) : (
            <div className="failure-message" style={{
              padding: '15px',
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <p style={{ color: '#EF4444', fontWeight: 500 }}>
                You need to score 100% to pass. Please review the material and try again.
              </p>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: percentage === 100 
                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(90deg, #4f46e5 0%, #00c2cb 100%)',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '0 auto',
              boxShadow: percentage === 100 
                ? '0 4px 10px rgba(16,185,129,0.2)'
                : '0 4px 10px rgba(79,70,229,0.2)'
            }}
          >
            {percentage === 100 ? (
              <>
                <i className="fas fa-check-circle"></i>
                Continue
              </>
            ) : (
              <>
                <i className="fas fa-redo"></i>
                Try Again
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Quiz questions
const quizQuestions: QuizQuestion[] = [
  {
    question: "What is the primary goal of a call center agent?",
    options: [
      "Sell as many products as possible",
      "Provide excellent customer service and resolve issues",
      "Transfer every call to a supervisor",
      "End calls as quickly as possible"
    ],
    answer: 1 // B is the correct answer (index 1)
  },
  {
    question: "Which of the following is considered best practice when answering a call?",
    options: [
      "Greet the customer professionally and state your name",
      "Ask the customer to explain their problem immediately",
      "Keep the greeting as short as possible",
      "Skip introductions and go straight to the issue"
    ],
    answer: 0 // A is the correct answer (index 0)
  },
  {
    question: "How should you handle an angry or frustrated customer?",
    options: [
      "Interrupt them to correct their mistakes",
      "Stay calm, listen actively, and empathize",
      "Transfer them immediately to another agent",
      "Hang up if they start yelling"
    ],
    answer: 1 // B is the correct answer (index 1)
  },
  {
    question: "What is Active Listening?",
    options: [
      "Responding before the customer finishes speaking",
      "Allowing the customer to talk without interruption",
      "Listening attentively and summarizing their concerns",
      "Only listening for keywords related to their issue"
    ],
    answer: 2 // C is the correct answer (index 2)
  },
  {
    question: "If you don't know the answer to a customer's question, what should you do?",
    options: [
      "Guess based on past experiences",
      "Tell the customer you don't know and end the call",
      "Place the customer on hold and find the correct information",
      "Transfer them to another department immediately"
    ],
    answer: 2 // C is the correct answer (index 2)
  },
  {
    question: "What does AHT (Average Handle Time) measure?",
    options: [
      "The time an agent spends on a call, including talk time and after-call work",
      "The number of calls an agent answers per day",
      "The number of transfers made during a shift",
      "The percentage of satisfied customers"
    ],
    answer: 0 // A is the correct answer (index 0)
  },
  {
    question: "What is the best way to verify a customer's identity?",
    options: [
      "Ask for their full name only",
      "Request security information like account number or PIN",
      "Trust their voice and proceed with the request",
      "Ask personal questions like their date of birth"
    ],
    answer: 1 // B is the correct answer (index 1)
  },
  {
    question: "What should you do if a customer asks to speak to a supervisor?",
    options: [
      "Transfer them immediately without asking questions",
      "Politely ask for the reason and attempt to resolve their issue first",
      "Refuse and tell them you are the only available agent",
      "End the call if you don't have a supervisor available"
    ],
    answer: 1 // B is the correct answer (index 1)
  },
  {
    question: "What is an escalation in a call center?",
    options: [
      "When a call is transferred to a more experienced agent or supervisor",
      "When a customer gets angry and raises their voice",
      "When a customer requests a refund",
      "When an agent places a customer on hold"
    ],
    answer: 0 // A is the correct answer (index 0)
  },
  {
    question: "Why is it important to document call notes properly?",
    options: [
      "To provide a record for future reference and help other agents",
      "To fill out paperwork at the end of the day",
      "To remind yourself of what you discussed",
      "To keep customers from calling back"
    ],
    answer: 0 // A is the correct answer (index 0)
  }
];

export default TrainingQuiz;
