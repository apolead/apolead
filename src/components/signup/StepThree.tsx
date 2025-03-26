
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const StepThree = ({ userData, updateUserData, prevStep, handleSubmit }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];
  
  const timeSlots = [
    { id: 'morning', label: 'Morning (6am - 12pm)' },
    { id: 'afternoon', label: 'Afternoon (12pm - 6pm)' },
    { id: 'evening', label: 'Evening (6pm - 12am)' },
    { id: 'night', label: 'Night (12am - 6am)' },
  ];
  
  const toggleAvailability = (day, timeSlot) => {
    const availabilityKey = `${day}_${timeSlot}`;
    const currentAvailability = [...userData.availableHours];
    
    if (currentAvailability.includes(availabilityKey)) {
      // Remove if already selected
      const updatedAvailability = currentAvailability.filter(item => item !== availabilityKey);
      updateUserData({ availableHours: updatedAvailability });
    } else {
      // Add if not already selected
      updateUserData({ availableHours: [...currentAvailability, availabilityKey] });
    }
  };
  
  const isTimeSlotSelected = (day, timeSlot) => {
    const availabilityKey = `${day}_${timeSlot}`;
    return userData.availableHours.includes(availabilityKey);
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (userData.availableHours.length === 0) {
      setErrorMessage('Please select at least one availability time slot');
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
      
      <h2 className="text-2xl font-bold mb-6">Availability & Terms</h2>
      <p className="text-gray-600 mb-8">Almost there! Let us know when you're available to work and review our terms and conditions.</p>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Select Your Availability</h3>
          <p className="text-sm text-gray-600 mb-4">Please indicate which times you're available to work. Select as many as apply.</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  {timeSlots.map(slot => (
                    <th 
                      key={slot.id}
                      className="py-2 px-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map(day => (
                  <tr key={day.id} className="border-t border-gray-200">
                    <td className="py-3 px-3 text-sm font-medium text-gray-900">
                      {day.label}
                    </td>
                    {timeSlots.map(slot => (
                      <td key={`${day.id}-${slot.id}`} className="py-3 px-3">
                        <div 
                          className={`cursor-pointer h-6 w-6 rounded-md flex items-center justify-center border ${
                            isTimeSlotSelected(day.id, slot.id) 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-gray-300 bg-white'
                          }`}
                          onClick={() => toggleAvailability(day.id, slot.id)}
                        >
                          {isTimeSlotSelected(day.id, slot.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Workspace Requirements</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Do you have a quiet place to work from?</h4>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="quietPlace" 
                    value="yes" 
                    checked={userData.hasQuietPlace === true}
                    onChange={() => updateUserData({ hasQuietPlace: true })}
                    className="w-5 h-5 cursor-pointer text-indigo-600"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="quietPlace" 
                    value="no" 
                    checked={userData.hasQuietPlace === false}
                    onChange={() => updateUserData({ hasQuietPlace: false })}
                    className="w-5 h-5 cursor-pointer text-indigo-600"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
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
