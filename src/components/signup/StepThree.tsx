
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const StepThree = ({ userData, updateUserData, prevStep, handleSubmit }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(userData.availableDays || []);
  const [dayHours, setDayHours] = useState(userData.dayHours || {});
  
  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];
  
  const handleDayToggle = (day) => {
    let updatedDays;
    if (selectedDays.includes(day)) {
      updatedDays = selectedDays.filter(d => d !== day);
      // Remove hours for this day
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
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (selectedDays.length === 0) {
      setErrorMessage('Please select at least one day of availability');
      return;
    }
    
    if (!userData.meetObligation || !userData.loginDiscord || !userData.checkEmails || 
        !userData.solveProblems || !userData.completeTraining) {
      setErrorMessage('Please answer all the commitment questions');
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
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" fill="#4F46E5" />
          <rect x="22" width="20" height="20" fill="#4F46E5" />
          <rect y="22" width="20" height="20" fill="#4F46E5" />
          <rect x="22" y="22" width="20" height="20" fill="#4F46E5" />
        </svg>
      </div>
      
      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "100%" }}></div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Availability & Commitments</h2>
      <p className="text-gray-600 mb-8">Please tell us about your availability and commitment to the position.</p>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Hours & Availability</h3>
          
          <div className="space-y-5">
            <p className="text-sm text-gray-600">While you can set your schedule during our hours of operation, we require 15 hours per week.</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Can you meet this obligation three weeks out of every four?</label>
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.meetObligation === true ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => toggleYesNo('meetObligation', true)}
                >
                  YES
                </button>
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.meetObligation === false ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
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
                    className={`w-full py-1.5 border border-indigo-600 rounded text-sm ${selectedDays.includes(day.id) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
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
                      <input
                        type="text"
                        value={dayHours[day] || ''}
                        onChange={(e) => handleHoursChange(day, e.target.value)}
                        className="flex-1 h-9 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 9:00 AM - 12:00 PM"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-4">We operate on a light staffing model and the expectation is that our Contractors (you!) are paying attention and driving your own performance.</p>
          
          <h3 className="text-lg font-medium mb-4">Will you be able to:</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login to Discord everyday that you work?</label>
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.loginDiscord === true ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => toggleYesNo('loginDiscord', true)}
                >
                  YES
                </button>
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.loginDiscord === false ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
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
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.checkEmails === true ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => toggleYesNo('checkEmails', true)}
                >
                  YES
                </button>
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.checkEmails === false ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
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
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.solveProblems === true ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => toggleYesNo('solveProblems', true)}
                >
                  YES
                </button>
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.solveProblems === false ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
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
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.completeTraining === true ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => toggleYesNo('completeTraining', true)}
                >
                  YES
                </button>
                <button 
                  type="button" 
                  className={`w-20 py-1.5 border border-indigo-600 rounded text-sm ${userData.completeTraining === false ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => toggleYesNo('completeTraining', false)}
                >
                  NO
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-4">At Apolead, we believe in fostering a positive, results-oriented atmosphere where employees are empowered to succeed.</p>
          
          <label htmlFor="personal-statement" className="block text-sm font-medium text-gray-700 mb-2">Briefly tell us what this means to you:</label>
          <Textarea
            id="personal-statement"
            rows={4}
            value={userData.personalStatement || ''}
            onChange={(e) => updateUserData({ personalStatement: e.target.value })}
            className="w-full resize-vertical"
            placeholder="Share your thoughts here..."
          />
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
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StepThree;
