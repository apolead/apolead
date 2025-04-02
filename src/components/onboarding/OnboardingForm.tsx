
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

const OnboardingForm = ({ questions, onSubmit, isLoading }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({
    govIdImage: null,
    speedTest: null,
    systemSettings: null
  });
  const [errors, setErrors] = useState({});

  const handleAnswerChange = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
    
    // Clear error for this question if it exists
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
    
    // Clear error for this file type if it exists
    if (errors[fileType]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fileType];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if all questions have answers
    questions.forEach(question => {
      if (selectedAnswers[question.id] === undefined) {
        newErrors[question.id] = 'Please select an answer';
      }
    });
    
    // Check if required files are uploaded
    if (!uploadedFiles.govIdImage) {
      newErrors.govIdImage = 'Please upload a government ID image';
    }
    
    if (!uploadedFiles.speedTest) {
      newErrors.speedTest = 'Please upload a speed test screenshot';
    }
    
    if (!uploadedFiles.systemSettings) {
      newErrors.systemSettings = 'Please upload system settings screenshot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare responses array with is_correct flag
    const responses = questions.map(question => ({
      question_id: question.id,
      selected_answer: selectedAnswers[question.id],
      is_correct: selectedAnswers[question.id] === question.correct_answer
    }));
    
    onSubmit(responses, uploadedFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Required Questions</h2>
        <p className="text-gray-600 mb-6">
          All questions must be answered correctly (100% score) to complete onboarding.
        </p>
        
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium mb-3">
                {index + 1}. {question.question}
              </h3>
              
              <RadioGroup
                value={selectedAnswers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                className="space-y-2"
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                    <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              
              {errors[question.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[question.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* File Uploads Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Required Documents</h2>
        <p className="text-gray-600 mb-6">
          Please upload the following documents to complete your onboarding.
        </p>
        
        <div className="space-y-6">
          {/* Government ID Upload */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Government ID</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <input 
                type="file" 
                id="govIdImage" 
                accept="image/*,.pdf" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'govIdImage')} 
                disabled={isLoading}
              />
              <label htmlFor="govIdImage" className="cursor-pointer">
                {uploadedFiles.govIdImage ? (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">{uploadedFiles.govIdImage.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-500 mb-1">
                      Click to upload your government ID
                    </p>
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
            {errors.govIdImage && (
              <p className="text-red-500 text-sm mt-1">{errors.govIdImage}</p>
            )}
          </div>
          
          {/* Speed Test Upload */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Internet Speed Test</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <input 
                type="file" 
                id="speedTest" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'speedTest')} 
                disabled={isLoading}
              />
              <label htmlFor="speedTest" className="cursor-pointer">
                {uploadedFiles.speedTest ? (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">{uploadedFiles.speedTest.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-500 mb-1">
                      Upload a screenshot of your internet speed test
                    </p>
                    <p className="text-xs text-gray-500">Go to speedtest.net and take a screenshot of your results</p>
                  </>
                )}
              </label>
            </div>
            {errors.speedTest && (
              <p className="text-red-500 text-sm mt-1">{errors.speedTest}</p>
            )}
          </div>
          
          {/* System Settings Upload */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Computer System Settings</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <input 
                type="file" 
                id="systemSettings" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'systemSettings')} 
                disabled={isLoading}
              />
              <label htmlFor="systemSettings" className="cursor-pointer">
                {uploadedFiles.systemSettings ? (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">{uploadedFiles.systemSettings.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-500 mb-1">
                      Upload a screenshot of your system information
                    </p>
                    <p className="text-xs text-gray-500">Take a screenshot showing your CPU and RAM information</p>
                  </>
                )}
              </label>
            </div>
            {errors.systemSettings && (
              <p className="text-red-500 text-sm mt-1">{errors.systemSettings}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Submit Section */}
      <div className="flex justify-center">
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Complete Onboarding'
          )}
        </Button>
      </div>
    </form>
  );
};

export default OnboardingForm;
