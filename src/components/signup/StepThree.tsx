
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

const StepThree = ({ userData, updateUserData, prevStep, handleSubmit, isSubmitting }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(userData.availableDays || []);
  const [dayHours, setDayHours] = useState(userData.dayHours || {});
  
  useEffect(() => {
    const commitmentFields = ['meetObligation', 'loginDiscord', 'checkEmails', 'solveProblems', 'completeTraining'];
    let updates = {};
    let hasUpdates = false;
    
    commitmentFields.forEach(field => {
      if (userData[field] === undefined || userData[field] === null) {
        updates[field] = null;
        hasUpdates = true;
      }
    });
    
    if (hasUpdates) {
      updateUserData(updates);
    }
  }, []);
  
  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  const hoursOptions = [
    { value: "< 1", label: "Less than 1 hour" },
    { value: "1-5", label: "1-5 hours" },
    { value: "5-10", label: "5-10 hours" },
    { value: "> 10", label: "More than 10 hours" }
  ];
  
  const handleDayToggle = (day) => {
    let updatedDays;
    if (selectedDays.includes(day)) {
      updatedDays = selectedDays.filter(d => d !== day);
      const updatedHours = {...dayHours};
      delete updatedHours[day];
      setDayHours(updatedHours);
      updateUserData({ dayHours: updatedHours });
    } else {
      updatedDays = [...selectedDays, day];
    }
    setSelectedDays(updatedDays);
    updateUserData({ availableDays: updatedDays });
  };
  
  const handleHoursChange = (day, value) => {
    const updatedHours = {...dayHours, [day]: value};
    setDayHours(updatedHours);
    updateUserData({ dayHours: updatedHours });
  };
  
  const toggleYesNo = (field, value) => {
    updateUserData({ [field]: value });
  };
  
  const getMissingCommitments = () => {
    const commitments = [
      { field: 'meetObligation', label: 'Meeting the 15 hours per week obligation' },
      { field: 'loginDiscord', label: 'Login to Discord everyday' },
      { field: 'checkEmails', label: 'Check company emails every day' },
      { field: 'solveProblems', label: 'Proactively solve problems' },
      { field: 'completeTraining', label: 'Complete required training' }
    ];
    
    return commitments
      .filter(commitment => userData[commitment.field] !== true && userData[commitment.field] !== false)
      .map(commitment => commitment.label);
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (selectedDays.length === 0) {
      setErrorMessage('Please select at least one day of availability');
      return;
    }
    
    const missingHours = selectedDays.filter(day => !dayHours[day]);
    if (missingHours.length > 0) {
      setErrorMessage(`Please select hours for: ${missingHours.join(', ')}`);
      return;
    }
    
    const missingCommitments = getMissingCommitments();
    if (missingCommitments.length > 0) {
      setErrorMessage(`Please answer these commitment questions: ${missingCommitments.join(', ')}`);
      return;
    }
    
    if (!userData.personalStatement || !userData.personalStatement.trim()) {
      setErrorMessage('Please provide a personal statement');
      return;
    }
    
    if (!userData.acceptedTerms) {
      setErrorMessage('You must accept the terms and conditions to continue');
      return;
    }
    
    setLoading(true);
    
    try {
      await handleSubmit();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('There was an error submitting your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>

          <h2 className="text-2xl font-bold mb-6">Step 3 of 4: Availability & Commitments</h2>
          <p className="text-white/80 mb-6">Please tell us about your availability and commitment to the position.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Why we need this information</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To match you with appropriate shifts</li>
              <li>To understand your work preferences</li>
              <li>To ensure you can meet our requirements</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>All information is securely stored and protected in accordance with data protection regulations.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "100%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Availability & Commitments</h2>
        <p className="text-gray-600 mb-6">Please tell us about your availability and commitment to the position.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <ScrollArea className="h-[calc(100vh-240px)] pr-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Hours & Availability</h3>
              
              <div className="space-y-5">
                <p className="text-sm text-gray-600">While you can set your schedule during our hours of operation, we require 15 hours per week.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Can you meet this obligation three weeks out of every four?</label>
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.meetObligation === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`}
                      onClick={() => toggleYesNo('meetObligation', true)}
                    >
                      YES
                    </button>
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.meetObligation === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`}
                      onClick={() => toggleYesNo('meetObligation', false)}
                    >
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">What days will you plan to work?</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {daysOfWeek.map(day => (
                      <button 
                        key={day.id}
                        type="button" 
                        className={`w-full py-1.5 border rounded text-sm ${selectedDays.includes(day.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`}
                        onClick={() => handleDayToggle(day.id)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedDays.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Hours planned per day:</h4>
                    <div className="space-y-3">
                      {selectedDays.map(day => (
                        <div key={`hours-${day}`} className="flex items-center mb-2">
                          <span className="w-24 text-sm text-gray-700 capitalize">{day}:</span>
                          <Select
                            value={dayHours[day] || ""}
                            onValueChange={(value) => handleHoursChange(day, value)}
                          >
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder="Select hours" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {hoursOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Commitments</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Login to Discord everyday that you work?</label>
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.loginDiscord === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`}
                      onClick={() => toggleYesNo('loginDiscord', true)}
                    >
                      YES
                    </button>
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.loginDiscord === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`}
                      onClick={() => toggleYesNo('loginDiscord', false)}
                    >
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check company emails every day?</label>
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.checkEmails === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`}
                      onClick={() => toggleYesNo('checkEmails', true)}
                    >
                      YES
                    </button>
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.checkEmails === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`}
                      onClick={() => toggleYesNo('checkEmails', false)}
                    >
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proactively solve your own problems and help others solve theirs?</label>
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.solveProblems === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`}
                      onClick={() => toggleYesNo('solveProblems', true)}
                    >
                      YES
                    </button>
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.solveProblems === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`}
                      onClick={() => toggleYesNo('solveProblems', false)}
                    >
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complete required training on your own?</label>
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.completeTraining === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`}
                      onClick={() => toggleYesNo('completeTraining', true)}
                    >
                      YES
                    </button>
                    <button 
                      type="button" 
                      className={`w-20 py-1.5 border rounded text-sm ${userData.completeTraining === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`}
                      onClick={() => toggleYesNo('completeTraining', false)}
                    >
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="personal-statement" className="block text-sm font-medium text-gray-700 mb-2">
                    At Apolead, we believe in fostering a positive, results-oriented atmosphere.
                    <br />Briefly tell us what this means to you:
                  </label>
                  <Textarea
                    id="personal-statement"
                    rows={4}
                    value={userData.personalStatement || ''}
                    onChange={(e) => updateUserData({ personalStatement: e.target.value })}
                    className="w-full resize-vertical"
                    placeholder="Share your thoughts here..."
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="terms"
                    checked={userData.acceptedTerms}
                    onCheckedChange={(checked) => updateUserData({ acceptedTerms: checked })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    Terms and Conditions
                  </label>
                  <p className="text-gray-500">
                    I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and{' '}
                    <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>. I understand that my personal data will be processed as described.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between py-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Back
              </Button>
              
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-[#00c2cb] text-white"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default StepThree;
