import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Onboarding = () => {
  const { user, userProfile, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDay: '',
    govIdNumber: '',
    govIdImage: null,
    cpuType: '',
    ramAmount: '',
    hasHeadset: null,
    hasQuietPlace: null,
    speedTest: null,
    systemSettings: null,
    salesExperience: null,
    salesMonths: '',
    salesCompany: '',
    salesProduct: '',
    serviceExperience: null,
    serviceMonths: '',
    serviceCompany: '',
    serviceProduct: '',
    meetObligation: null,
    loginDiscord: null,
    checkEmails: null,
    solveProblems: null,
    completeTraining: null,
    personalStatement: '',
    acceptedTerms: false,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // If user has already completed onboarding, redirect to dashboard
      if (userProfile?.onboarding_completed) {
        navigate('/dashboard');
        return;
      }
      
      // Pre-fill form with existing user profile data if available
      if (userProfile) {
        setFormData({
          firstName: userProfile.first_name || '',
          lastName: userProfile.last_name || '',
          birthDay: userProfile.birth_day || '',
          govIdNumber: userProfile.gov_id_number || '',
          govIdImage: null,
          cpuType: userProfile.cpu_type || '',
          ramAmount: userProfile.ram_amount || '',
          hasHeadset: userProfile.has_headset,
          hasQuietPlace: userProfile.has_quiet_place,
          speedTest: null,
          systemSettings: null,
          salesExperience: userProfile.sales_experience,
          salesMonths: userProfile.sales_months || '',
          salesCompany: userProfile.sales_company || '',
          salesProduct: userProfile.sales_product || '',
          serviceExperience: userProfile.service_experience,
          serviceMonths: userProfile.service_months || '',
          serviceCompany: userProfile.service_company || '',
          serviceProduct: userProfile.service_product || '',
          meetObligation: userProfile.meet_obligation,
          loginDiscord: userProfile.login_discord,
          checkEmails: userProfile.check_emails,
          solveProblems: userProfile.solve_problems,
          completeTraining: userProfile.complete_training,
          personalStatement: userProfile.personal_statement || '',
          acceptedTerms: userProfile.accepted_terms || false,
        });
      }
    }
  }, [user, userProfile, loading, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      toast.error("Error", { description: "Please enter your first name" });
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Error", { description: "Please enter your last name" });
      return false;
    }
    if (!formData.birthDay) {
      toast.error("Error", { description: "Please enter your birth date" });
      return false;
    }
    if (!formData.govIdNumber.trim()) {
      toast.error("Error", { description: "Please enter your government ID number" });
      return false;
    }
    if (!formData.govIdImage && !userProfile?.gov_id_image) {
      toast.error("Error", { description: "Please upload your government ID" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.cpuType.trim()) {
      toast.error("Error", { description: "Please enter your CPU type" });
      return false;
    }
    if (!formData.ramAmount.trim()) {
      toast.error("Error", { description: "Please enter your RAM amount" });
      return false;
    }
    if (formData.hasHeadset === null) {
      toast.error("Error", { description: "Please indicate whether you have a headset" });
      return false;
    }
    if (formData.hasQuietPlace === null) {
      toast.error("Error", { description: "Please indicate whether you have a quiet place to work" });
      return false;
    }
    if (!formData.speedTest && !userProfile?.speed_test) {
      toast.error("Error", { description: "Please upload your speed test results" });
      return false;
    }
    if (!formData.systemSettings && !userProfile?.system_settings) {
      toast.error("Error", { description: "Please upload your system settings" });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.salesExperience === null) {
      toast.error("Error", { description: "Please indicate whether you have sales experience" });
      return false;
    }
    if (formData.salesExperience && !formData.salesMonths.trim()) {
      toast.error("Error", { description: "Please enter your sales experience duration" });
      return false;
    }
    if (formData.serviceExperience === null) {
      toast.error("Error", { description: "Please indicate whether you have customer service experience" });
      return false;
    }
    if (formData.serviceExperience && !formData.serviceMonths.trim()) {
      toast.error("Error", { description: "Please enter your customer service experience duration" });
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (formData.meetObligation === null) {
      toast.error("Error", { description: "Please indicate whether you can meet the work obligation" });
      return false;
    }
    if (formData.loginDiscord === null) {
      toast.error("Error", { description: "Please indicate whether you can login to Discord daily" });
      return false;
    }
    if (formData.checkEmails === null) {
      toast.error("Error", { description: "Please indicate whether you can check emails daily" });
      return false;
    }
    if (formData.solveProblems === null) {
      toast.error("Error", { description: "Please indicate whether you can solve problems" });
      return false;
    }
    if (formData.completeTraining === null) {
      toast.error("Error", { description: "Please indicate whether you can complete required training" });
      return false;
    }
    if (!formData.personalStatement.trim()) {
      toast.error("Error", { description: "Please provide a personal statement" });
      return false;
    }
    if (!formData.acceptedTerms) {
      toast.error("Error", { description: "You must accept the terms and conditions" });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        if (isValid) {
          // Save partial data after step 1
          try {
            await updateProfile({
              first_name: formData.firstName,
              last_name: formData.lastName,
              birth_day: formData.birthDay,
              gov_id_number: formData.govIdNumber,
              govIdImage: formData.govIdImage
            });
            setStep(prev => prev + 1);
          } catch (error) {
            console.error('Error saving step 1 data:', error);
            toast.error("Error", { description: "Failed to save your data. Please try again." });
          }
        }
        break;
      case 2:
        isValid = validateStep2();
        if (isValid) {
          // Save partial data after step 2
          try {
            await updateProfile({
              cpu_type: formData.cpuType,
              ram_amount: formData.ramAmount,
              has_headset: formData.hasHeadset,
              has_quiet_place: formData.hasQuietPlace,
              speedTest: formData.speedTest,
              systemSettings: formData.systemSettings
            });
            setStep(prev => prev + 1);
          } catch (error) {
            console.error('Error saving step 2 data:', error);
            toast.error("Error", { description: "Failed to save your data. Please try again." });
          }
        }
        break;
      case 3:
        isValid = validateStep3();
        if (isValid) {
          // Save partial data after step 3
          try {
            await updateProfile({
              sales_experience: formData.salesExperience,
              sales_months: formData.salesMonths,
              sales_company: formData.salesCompany,
              sales_product: formData.salesProduct,
              service_experience: formData.serviceExperience,
              service_months: formData.serviceMonths,
              service_company: formData.serviceCompany,
              service_product: formData.serviceProduct
            });
            setStep(prev => prev + 1);
          } catch (error) {
            console.error('Error saving step 3 data:', error);
            toast.error("Error", { description: "Failed to save your data. Please try again." });
          }
        }
        break;
      case 4:
        isValid = validateStep4();
        if (isValid) {
          handleSubmit();
        }
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Check eligibility based on form data
      // This is a simple example - you can customize the eligibility criteria
      const isEligible = formData.meetObligation && 
                         formData.hasHeadset && 
                         formData.hasQuietPlace && 
                         (formData.salesExperience || formData.serviceExperience);
      
      await updateProfile({
        meet_obligation: formData.meetObligation,
        login_discord: formData.loginDiscord,
        check_emails: formData.checkEmails,
        solve_problems: formData.solveProblems,
        complete_training: formData.completeTraining,
        personal_statement: formData.personalStatement,
        accepted_terms: formData.acceptedTerms,
        onboarding_completed: true,
        eligible_for_training: isEligible,
        application_status: isEligible ? 'approved' : 'rejected'
      });
      
      if (isEligible) {
        toast.success("Onboarding Completed!", { 
          description: "You're eligible to proceed with training!" 
        });
      } else {
        toast.error("Onboarding Completed", { 
          description: "Thank you for your application. Unfortunately, you don't meet our requirements."
        });
      }
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast.error("Submission Error", {
        description: "There was an error completing your onboarding. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-6 text-white">
          <h1 className="text-2xl font-bold">ApoLead Onboarding</h1>
          <p className="text-sm opacity-90">Complete all steps to continue with your application</p>
          
          <div className="flex mt-6 pb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-white text-indigo-600' : 
                  step > s ? 'bg-green-500 text-white' : 
                  'bg-white/30 text-white'
                } font-semibold`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-1 ${
                    step > s ? 'bg-green-500' : 'bg-white/30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName} 
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName} 
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="birthDay">Date of Birth</Label>
                <Input 
                  id="birthDay" 
                  type="date" 
                  value={formData.birthDay} 
                  onChange={(e) => handleChange('birthDay', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="govIdNumber">Government ID Number</Label>
                <Input 
                  id="govIdNumber" 
                  value={formData.govIdNumber} 
                  onChange={(e) => handleChange('govIdNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="govIdImage">Government ID Image</Label>
                <div className="mt-1">
                  <Input 
                    id="govIdImage" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange('govIdImage', e)}
                  />
                </div>
                {userProfile?.gov_id_image && (
                  <div className="mt-2 text-sm text-green-600">
                    You've already uploaded an ID image
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">System Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpuType">CPU Type</Label>
                  <Input 
                    id="cpuType" 
                    value={formData.cpuType} 
                    onChange={(e) => handleChange('cpuType', e.target.value)}
                    placeholder="e.g., Intel i5, AMD Ryzen 5"
                  />
                </div>
                <div>
                  <Label htmlFor="ramAmount">RAM Amount</Label>
                  <Input 
                    id="ramAmount" 
                    value={formData.ramAmount} 
                    onChange={(e) => handleChange('ramAmount', e.target.value)}
                    placeholder="e.g., 8GB, 16GB"
                  />
                </div>
              </div>
              <div>
                <Label>Do you have a headset?</Label>
                <RadioGroup
                  value={formData.hasHeadset === true ? "yes" : formData.hasHeadset === false ? "no" : ""}
                  onValueChange={(value) => handleChange('hasHeadset', value === "yes")}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hasHeadsetYes" />
                    <Label htmlFor="hasHeadsetYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hasHeadsetNo" />
                    <Label htmlFor="hasHeadsetNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Do you have a quiet place to work?</Label>
                <RadioGroup
                  value={formData.hasQuietPlace === true ? "yes" : formData.hasQuietPlace === false ? "no" : ""}
                  onValueChange={(value) => handleChange('hasQuietPlace', value === "yes")}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hasQuietPlaceYes" />
                    <Label htmlFor="hasQuietPlaceYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hasQuietPlaceNo" />
                    <Label htmlFor="hasQuietPlaceNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="speedTest">Speed Test Screenshot</Label>
                <div className="mt-1">
                  <Input 
                    id="speedTest" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange('speedTest', e)}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Please upload a screenshot of your speed test from <a href="https://www.speedtest.net" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">speedtest.net</a>
                </div>
                {userProfile?.speed_test && (
                  <div className="mt-2 text-sm text-green-600">
                    You've already uploaded a speed test
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="systemSettings">System Settings Screenshot</Label>
                <div className="mt-1">
                  <Input 
                    id="systemSettings" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange('systemSettings', e)}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Please upload a screenshot of your system settings/specifications
                </div>
                {userProfile?.system_settings && (
                  <div className="mt-2 text-sm text-green-600">
                    You've already uploaded a system settings screenshot
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Experience</h2>
              <div>
                <Label>Do you have sales experience?</Label>
                <RadioGroup
                  value={formData.salesExperience === true ? "yes" : formData.salesExperience === false ? "no" : ""}
                  onValueChange={(value) => handleChange('salesExperience', value === "yes")}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="salesExpYes" />
                    <Label htmlFor="salesExpYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="salesExpNo" />
                    <Label htmlFor="salesExpNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.salesExperience && (
                <div className="space-y-4 pl-6 border-l-2 border-indigo-100">
                  <div>
                    <Label htmlFor="salesMonths">How many months of sales experience?</Label>
                    <Input 
                      id="salesMonths" 
                      value={formData.salesMonths} 
                      onChange={(e) => handleChange('salesMonths', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesCompany">Company Name</Label>
                    <Input 
                      id="salesCompany" 
                      value={formData.salesCompany} 
                      onChange={(e) => handleChange('salesCompany', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesProduct">Product/Service Sold</Label>
                    <Input 
                      id="salesProduct" 
                      value={formData.salesProduct} 
                      onChange={(e) => handleChange('salesProduct', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Label>Do you have customer service experience?</Label>
                <RadioGroup
                  value={formData.serviceExperience === true ? "yes" : formData.serviceExperience === false ? "no" : ""}
                  onValueChange={(value) => handleChange('serviceExperience', value === "yes")}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="serviceExpYes" />
                    <Label htmlFor="serviceExpYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="serviceExpNo" />
                    <Label htmlFor="serviceExpNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.serviceExperience && (
                <div className="space-y-4 pl-6 border-l-2 border-indigo-100">
                  <div>
                    <Label htmlFor="serviceMonths">How many months of customer service experience?</Label>
                    <Input 
                      id="serviceMonths" 
                      value={formData.serviceMonths} 
                      onChange={(e) => handleChange('serviceMonths', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCompany">Company Name</Label>
                    <Input 
                      id="serviceCompany" 
                      value={formData.serviceCompany} 
                      onChange={(e) => handleChange('serviceCompany', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceProduct">Type of Service Provided</Label>
                    <Input 
                      id="serviceProduct" 
                      value={formData.serviceProduct} 
                      onChange={(e) => handleChange('serviceProduct', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Commitments & Final Steps</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Can you meet the obligation of working 15 hours/week, three weeks of every four?</Label>
                  <RadioGroup
                    value={formData.meetObligation === true ? "yes" : formData.meetObligation === false ? "no" : ""}
                    onValueChange={(value) => handleChange('meetObligation', value === "yes")}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="meetObligationYes" />
                      <Label htmlFor="meetObligationYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="meetObligationNo" />
                      <Label htmlFor="meetObligationNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label>Will you login to Discord every day that you work?</Label>
                  <RadioGroup
                    value={formData.loginDiscord === true ? "yes" : formData.loginDiscord === false ? "no" : ""}
                    onValueChange={(value) => handleChange('loginDiscord', value === "yes")}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="loginDiscordYes" />
                      <Label htmlFor="loginDiscordYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="loginDiscordNo" />
                      <Label htmlFor="loginDiscordNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label>Will you check company emails every day?</Label>
                  <RadioGroup
                    value={formData.checkEmails === true ? "yes" : formData.checkEmails === false ? "no" : ""}
                    onValueChange={(value) => handleChange('checkEmails', value === "yes")}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="checkEmailsYes" />
                      <Label htmlFor="checkEmailsYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="checkEmailsNo" />
                      <Label htmlFor="checkEmailsNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label>Will you proactively solve problems and help others solve theirs?</Label>
                  <RadioGroup
                    value={formData.solveProblems === true ? "yes" : formData.solveProblems === false ? "no" : ""}
                    onValueChange={(value) => handleChange('solveProblems', value === "yes")}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="solveProblemsYes" />
                      <Label htmlFor="solveProblemsYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="solveProblemsNo" />
                      <Label htmlFor="solveProblemsNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label>Will you complete required training on your own?</Label>
                  <RadioGroup
                    value={formData.completeTraining === true ? "yes" : formData.completeTraining === false ? "no" : ""}
                    onValueChange={(value) => handleChange('completeTraining', value === "yes")}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="completeTrainingYes" />
                      <Label htmlFor="completeTrainingYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="completeTrainingNo" />
                      <Label htmlFor="completeTrainingNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div>
                <Label htmlFor="personalStatement">Personal Statement</Label>
                <Textarea
                  id="personalStatement"
                  value={formData.personalStatement}
                  onChange={(e) => handleChange('personalStatement', e.target.value)}
                  placeholder="At ApoLead, we believe in fostering a positive, results-oriented atmosphere. Briefly tell us what this means to you."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => handleChange('acceptedTerms', checked === true)}
                />
                <Label htmlFor="terms" className="leading-tight">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>. I understand that my personal data will be processed as described.
                </Label>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={isSubmitting}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {step === 4 ? 'Submitting...' : 'Saving...'}
                </>
              ) : (
                step === 4 ? 'Complete Onboarding' : 'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
