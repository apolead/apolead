import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const OnboardingModal = ({
  isOpen,
  onClose,
  user,
  initialUserData
}) => {
  const [currentTab, setCurrentTab] = useState('personalDetails');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const { updateProfile } = useAuth();
  
  const [userData, setUserData] = useState({
    firstName: initialUserData?.first_name || '',
    lastName: initialUserData?.last_name || '',
    email: initialUserData?.email || user?.email || '',
    birthDay: initialUserData?.birth_day || '',
    govIdNumber: initialUserData?.gov_id_number || '',
    govIdImage: null,
    govIdImageUrl: initialUserData?.gov_id_image || '',
    cpuType: initialUserData?.cpu_type || '',
    ramAmount: initialUserData?.ram_amount || '',
    hasHeadset: initialUserData?.has_headset ?? null,
    hasQuietPlace: initialUserData?.has_quiet_place ?? null,
    speedTest: null,
    speedTestUrl: initialUserData?.speed_test || '',
    systemSettings: null,
    systemSettingsUrl: initialUserData?.system_settings || '',
    meetObligation: initialUserData?.meet_obligation ?? null,
    loginDiscord: initialUserData?.login_discord ?? null,
    checkEmails: initialUserData?.check_emails ?? null,
    solveProblems: initialUserData?.solve_problems ?? null,
    completeTraining: initialUserData?.complete_training ?? null,
    personalStatement: initialUserData?.personal_statement || '',
    availableDays: initialUserData?.available_days || [],
    dayHours: initialUserData?.day_hours || {},
    acceptedTerms: initialUserData?.accepted_terms || false
  });

  const handleChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUserData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validatePersonalDetails = () => {
    if (!userData.firstName || !userData.firstName.trim()) {
      setErrorMessage('Please enter your first name');
      return false;
    }
    if (!userData.lastName || !userData.lastName.trim()) {
      setErrorMessage('Please enter your last name');
      return false;
    }
    if (!userData.birthDay) {
      setErrorMessage('Please enter your birth date');
      return false;
    }
    if (!userData.govIdNumber || !userData.govIdNumber.trim()) {
      setErrorMessage('Please enter your government ID number');
      return false;
    }
    if (!userData.govIdImage && !userData.govIdImageUrl) {
      setErrorMessage('Please upload a picture of your government ID');
      return false;
    }
    return true;
  };

  const validateSystemRequirements = () => {
    if (!userData.cpuType || !userData.cpuType.trim()) {
      setErrorMessage('Please enter your CPU type');
      return false;
    }
    if (!userData.ramAmount || !userData.ramAmount.trim()) {
      setErrorMessage('Please enter your RAM amount');
      return false;
    }
    if (userData.hasHeadset === null) {
      setErrorMessage('Please indicate whether you have a headset');
      return false;
    }
    if (userData.hasQuietPlace === null) {
      setErrorMessage('Please indicate whether you have a quiet place to work');
      return false;
    }
    if (!userData.speedTest && !userData.speedTestUrl) {
      setErrorMessage('Please upload a screenshot of your speed test results');
      return false;
    }
    if (!userData.systemSettings && !userData.systemSettingsUrl) {
      setErrorMessage('Please upload a screenshot of your system settings');
      return false;
    }
    return true;
  };

  const validateCommitments = () => {
    const commitments = ['meetObligation', 'loginDiscord', 'checkEmails', 'solveProblems', 'completeTraining'];
    for (const commitment of commitments) {
      if (userData[commitment] !== true && userData[commitment] !== false) {
        setErrorMessage(`Please answer all commitment questions`);
        return false;
      }
    }
    if (!userData.personalStatement || !userData.personalStatement.trim()) {
      setErrorMessage('Please provide a personal statement');
      return false;
    }
    if (!userData.acceptedTerms) {
      setErrorMessage('You must accept the terms and conditions to continue');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setErrorMessage('');
    if (currentTab === 'personalDetails') {
      if (validatePersonalDetails()) {
        setCurrentTab('systemRequirements');
      }
    } else if (currentTab === 'systemRequirements') {
      if (validateSystemRequirements()) {
        setCurrentTab('commitments');
      }
    }
  };

  const handleBack = () => {
    if (currentTab === 'systemRequirements') {
      setCurrentTab('personalDetails');
    } else if (currentTab === 'commitments') {
      setCurrentTab('systemRequirements');
    }
  };

  const uploadFile = async (file, bucket, path) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!validateCommitments()) {
      return;
    }
    setIsSubmitting(true);
    try {
      let govIdImageUrl = userData.govIdImageUrl;
      let speedTestUrl = userData.speedTestUrl;
      let systemSettingsUrl = userData.systemSettingsUrl;
      
      if (userData.govIdImage) {
        govIdImageUrl = await uploadFile(userData.govIdImage, 'user-documents', 'gov-ids');
      }
      
      if (userData.speedTest) {
        speedTestUrl = await uploadFile(userData.speedTest, 'user-documents', 'speed-tests');
      }
      
      if (userData.systemSettings) {
        systemSettingsUrl = await uploadFile(userData.systemSettings, 'user-documents', 'system-settings');
      }

      const hasCompletedBasicInfo = userData.firstName && 
                                   userData.lastName && 
                                   userData.birthDay && 
                                   userData.govIdNumber && 
                                   (govIdImageUrl || userData.govIdImageUrl);
                                   
      const hasAnsweredAllQuestions = userData.hasHeadset !== null && 
                                     userData.hasQuietPlace !== null && 
                                     userData.meetObligation !== null && 
                                     userData.loginDiscord !== null && 
                                     userData.checkEmails !== null && 
                                     userData.solveProblems !== null && 
                                     userData.completeTraining !== null;

      const isEligible = userData.hasHeadset === true && 
                         userData.hasQuietPlace === true && 
                         userData.meetObligation === true && 
                         userData.loginDiscord === true && 
                         userData.checkEmails === true && 
                         userData.solveProblems === true && 
                         userData.completeTraining === true;
                         
      console.log('Onboarding submission:', {
        hasCompletedBasicInfo,
        hasAnsweredAllQuestions,
        isEligible,
        answersData: {
          hasHeadset: userData.hasHeadset,
          hasQuietPlace: userData.hasQuietPlace,
          meetObligation: userData.meetObligation,
          loginDiscord: userData.loginDiscord,
          checkEmails: userData.checkEmails,
          solveProblems: userData.solveProblems,
          completeTraining: userData.completeTraining
        }
      });

      const profileData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        birth_day: userData.birthDay,
        gov_id_number: userData.govIdNumber,
        gov_id_image: govIdImageUrl,
        cpu_type: userData.cpuType,
        ram_amount: userData.ramAmount,
        has_headset: userData.hasHeadset,
        has_quiet_place: userData.hasQuietPlace,
        speed_test: speedTestUrl,
        system_settings: systemSettingsUrl,
        meet_obligation: userData.meetObligation,
        login_discord: userData.loginDiscord,
        check_emails: userData.checkEmails,
        solve_problems: userData.solveProblems,
        complete_training: userData.completeTraining,
        personal_statement: userData.personalStatement,
        accepted_terms: userData.acceptedTerms
      };
      
      if (Array.isArray(userData.availableDays) && userData.availableDays.length > 0) {
        profileData['available_days'] = userData.availableDays;
      }
      
      if (typeof userData.dayHours === 'object' && userData.dayHours !== null && Object.keys(userData.dayHours).length > 0) {
        profileData['day_hours'] = userData.dayHours;
      }

      await updateProfile(profileData);

      if (hasCompletedBasicInfo && hasAnsweredAllQuestions) {
        if (isEligible) {
          toast({
            title: "You're eligible!",
            description: "You've successfully completed onboarding and are eligible for training.",
            variant: "default"
          });
        } else {
          toast({
            title: "Not eligible",
            description: "You've completed onboarding but are not eligible for training based on your answers.",
            variant: "destructive"
          });
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialUserData?.onboarding_completed === true) {
      console.log("Onboarding already completed, closing modal");
      onClose();
    }
  }, [initialUserData, onClose]);

  if (initialUserData?.onboarding_completed === true) {
    return null;
  }

  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Initial Onboarding
          </DialogTitle>
          <DialogDescription>
            Please complete your profile to continue with the application process.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="personalDetails">Personal Details</TabsTrigger>
            <TabsTrigger value="systemRequirements">System Requirements</TabsTrigger>
            <TabsTrigger value="commitments">Commitments</TabsTrigger>
          </TabsList>
          
          {errorMessage && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-4">
              {errorMessage}
            </div>}
          
          <TabsContent value="personalDetails" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                <Input id="firstName" value={userData.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="Enter first name" />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input id="lastName" value={userData.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Enter last name" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input id="email" value={userData.email} readOnly className="bg-gray-100 cursor-not-allowed" />
              </div>
              
              <div>
                <Label htmlFor="birthDay" className="text-sm font-medium text-gray-700">Birth Day</Label>
                <Input id="birthDay" type="date" value={userData.birthDay} onChange={e => handleChange('birthDay', e.target.value)} />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Picture of Government ID</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
                <input type="file" id="govIdImage" accept="image/*,.pdf" className="hidden" onChange={e => handleFileChange('govIdImage', e)} />
                <label htmlFor="govIdImage" className="cursor-pointer">
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <p className="text-sm text-gray-500 mb-1">
                    {userData.govIdImage ? `Selected: ${userData.govIdImage.name}` : userData.govIdImageUrl ? "ID already uploaded (click to change)" : 'Drag and drop your ID here, or click to browse'}
                  </p>
                  <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="govIdNumber" className="text-sm font-medium text-gray-700">Government ID Number</Label>
              <Input id="govIdNumber" value={userData.govIdNumber} onChange={e => handleChange('govIdNumber', e.target.value)} placeholder="Enter your ID number" />
              <p className="mt-1 text-xs text-gray-500">This will be verified for uniqueness</p>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button type="button" onClick={handleNext} className="text-neutral-50">
                Next
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="systemRequirements" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <h3 className="text-lg font-medium mb-4">System Requirements</h3>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">25 MBPS Internet</Label>
                  <p className="text-xs text-gray-500 mb-2">Upload a selfie of speed test results from:</p>
                  <a href="https://speed.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline">
                    https://speed.cloudflare.com/
                  </a>
                  
                  <div className="mt-3 border-2 border-dashed border-gray-300 rounded-md p-4 bg-white">
                    <div className="flex items-center justify-center">
                      <input id="speed-test-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileChange('speedTest', e)} />
                      <label htmlFor="speed-test-upload" className="cursor-pointer text-center">
                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                          <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          {userData.speedTest ? `Selected: ${userData.speedTest.name}` : userData.speedTestUrl ? "Speed test already uploaded (click to change)" : 'Upload a file or drag and drop'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Windows 10+</Label>
                  <p className="text-xs text-gray-500 mb-2">Post a screenshot of system settings</p>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-3">
                    <p className="text-xs text-blue-700">
                      <strong>How to find your system settings:</strong> Click Start Menu → Type "system" and hit Enter → Take a screenshot of the system information page
                    </p>
                  </div>
                  
                  <div className="mt-3 border-2 border-dashed border-gray-300 rounded-md p-4 bg-white">
                    <div className="flex items-center justify-center">
                      <input id="system-settings-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileChange('systemSettings', e)} />
                      <label htmlFor="system-settings-upload" className="cursor-pointer text-center">
                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                          <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          {userData.systemSettings ? `Selected: ${userData.systemSettings.name}` : userData.systemSettingsUrl ? "System settings already uploaded (click to change)" : 'Upload a file or drag and drop'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cpuType" className="block text-sm font-medium text-gray-700 mb-1">CPU Type and Speed</Label>
                  <Input id="cpuType" value={userData.cpuType} onChange={e => handleChange('cpuType', e.target.value)} placeholder="e.g., Intel Core i5-10400 2.9GHz" />
                </div>
                
                <div>
                  <Label htmlFor="ramAmount" className="block text-sm font-medium text-gray-700 mb-1">RAM / Memory (How much?)</Label>
                  <Input id="ramAmount" value={userData.ramAmount} onChange={e => handleChange('ramAmount', e.target.value)} placeholder="e.g., 16GB DDR4" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">I have a headset</Label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input type="radio" name="headset" value="yes" checked={userData.hasHeadset === true} onChange={() => handleChange('hasHeadset', true)} className="w-4 h-4 cursor-pointer text-indigo-600" />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="headset" value="no" checked={userData.hasHeadset === false} onChange={() => handleChange('hasHeadset', false)} className="w-4 h-4 cursor-pointer text-indigo-600" />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">I have a quiet place to work</Label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input type="radio" name="quietPlace" value="yes" checked={userData.hasQuietPlace === true} onChange={() => handleChange('hasQuietPlace', true)} className="w-4 h-4 cursor-pointer text-indigo-600" />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="quietPlace" value="no" checked={userData.hasQuietPlace === false} onChange={() => handleChange('hasQuietPlace', false)} className="w-4 h-4 cursor-pointer text-indigo-600" />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="text-slate-50">
                Next
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="commitments" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <h3 className="text-lg font-medium mb-4">Commitments</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Can you meet the 15 hours per week obligation three weeks out of every four?</Label>
                  <div className="flex space-x-3">
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.meetObligation === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`} onClick={() => handleChange('meetObligation', true)}>
                      YES
                    </button>
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.meetObligation === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`} onClick={() => handleChange('meetObligation', false)}>
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Login to Discord everyday that you work?</Label>
                  <div className="flex space-x-3">
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.loginDiscord === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`} onClick={() => handleChange('loginDiscord', true)}>
                      YES
                    </button>
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.loginDiscord === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`} onClick={() => handleChange('loginDiscord', false)}>
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Check company emails every day?</Label>
                  <div className="flex space-x-3">
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.checkEmails === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`} onClick={() => handleChange('checkEmails', true)}>
                      YES
                    </button>
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.checkEmails === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`} onClick={() => handleChange('checkEmails', false)}>
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Proactively solve your own problems and help others solve theirs?</Label>
                  <div className="flex space-x-3">
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.solveProblems === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`} onClick={() => handleChange('solveProblems', true)}>
                      YES
                    </button>
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.solveProblems === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`} onClick={() => handleChange('solveProblems', false)}>
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Complete required training on your own?</Label>
                  <div className="flex space-x-3">
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.completeTraining === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-indigo-600 hover:text-white hover:border-indigo-600`} onClick={() => handleChange('completeTraining', true)}>
                      YES
                    </button>
                    <button type="button" className={`px-4 py-1.5 border rounded text-sm ${userData.completeTraining === false ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]`} onClick={() => handleChange('completeTraining', false)}>
                      NO
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="personalStatement" className="block text-sm font-medium text-gray-700 mb-2">
                    At Apolead, we believe in fostering a positive, results-oriented atmosphere.
                    <br />Briefly tell us what this means to you:
                  </Label>
                  <textarea id="personalStatement" rows={4} value={userData.personalStatement} onChange={e => handleChange('personalStatement', e.target.value)} className="w-full resize-vertical rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Share your thoughts here..." />
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <input type="checkbox" id="terms" checked={userData.acceptedTerms} onChange={e => handleChange('acceptedTerms', e.target.checked)} className="h-4 w-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              <div>
                <Label htmlFor="terms" className="font-medium text-gray-700">
                  Terms and Conditions
                </Label>
                <p className="text-gray-500 text-sm">
                  I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>. I understand that my personal data will be processed as described.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              
              <Button type="button" disabled={isSubmitting} onClick={handleSubmit} className="text-slate-50">
                {isSubmitting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </> : 'Submit'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
};

export default OnboardingModal;
