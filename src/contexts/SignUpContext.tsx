
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadFile } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignUpContextType {
  currentStep: number;
  userData: any;
  updateUserData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isCheckingGovId: boolean;
}

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

export const SignUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingGovId, setIsCheckingGovId] = useState(false);
  const navigate = useNavigate();
  
  // Initialize userData with email from sessionStorage
  const initialUserData = {
    email: sessionStorage.getItem('signUpEmail') || '',
    firstName: '',
    lastName: '',
    birthDay: '',
    govIdNumber: '',
    govIdImage: null,
    govIdImageUrl: '',
    cpuType: '',
    ramAmount: '',
    hasHeadset: null,
    hasQuietPlace: null,
    speedTest: null,
    speedTestUrl: '',
    systemSettings: null,
    systemSettingsUrl: '',
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
    acceptedTerms: false
  };
  
  const [userData, setUserData] = useState(initialUserData);
  
  const updateUserData = (data: any) => {
    setUserData(prev => ({ ...prev, ...data }));
  };
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Authentication error: ' + (userError?.message || 'User not found'));
      }
      
      const userId = userData.user.id;

      // Upload all files that haven't been uploaded yet
      let uploads = {};
      
      // Process file uploads and get URLs
      if (!uploads.govIdImageUrl && userData.govIdImage) {
        uploads.govIdImageUrl = await uploadFile(userData.govIdImage, 'government_ids', userId);
      }
      
      if (!uploads.speedTestUrl && userData.speedTest) {
        uploads.speedTestUrl = await uploadFile(userData.speedTest, 'speed_tests', userId);
      }
      
      if (!uploads.systemSettingsUrl && userData.systemSettings) {
        uploads.systemSettingsUrl = await uploadFile(userData.systemSettings, 'system_settings', userId);
      }
      
      // Prepare data for user_profiles table update
      const profileData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        birth_day: userData.birthDay,
        gov_id_number: userData.govIdNumber,
        gov_id_image: uploads.govIdImageUrl || userData.govIdImageUrl,
        cpu_type: userData.cpuType,
        ram_amount: userData.ramAmount,
        has_headset: userData.hasHeadset,
        has_quiet_place: userData.hasQuietPlace,
        speed_test: uploads.speedTestUrl || userData.speedTestUrl,
        system_settings: uploads.systemSettingsUrl || userData.systemSettingsUrl,
        sales_experience: userData.salesExperience,
        sales_months: userData.salesMonths,
        sales_company: userData.salesCompany,
        sales_product: userData.salesProduct,
        service_experience: userData.serviceExperience,
        service_months: userData.serviceMonths,
        service_company: userData.serviceCompany,
        service_product: userData.serviceProduct,
        meet_obligation: userData.meetObligation,
        login_discord: userData.loginDiscord,
        check_emails: userData.checkEmails,
        solve_problems: userData.solveProblems,
        complete_training: userData.completeTraining,
        personal_statement: userData.personalStatement,
        accepted_terms: userData.acceptedTerms,
        onboarding_completed: true,
        // Calculate eligibility based on commitments
        eligible_for_training: 
          userData.meetObligation === true &&
          userData.loginDiscord === true &&
          userData.checkEmails === true &&
          userData.solveProblems === true &&
          userData.completeTraining === true &&
          userData.hasHeadset === true &&
          userData.hasQuietPlace === true
      };
      
      // Update the user profile in the database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId);
        
      if (profileError) {
        throw new Error('Error updating profile: ' + profileError.message);
      }
      
      // Redirect to dashboard after successful completion
      toast.success('Application submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SignUpContext.Provider value={{
      currentStep,
      userData,
      updateUserData,
      nextStep,
      prevStep,
      handleSubmit,
      isSubmitting,
      isCheckingGovId
    }}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (context === undefined) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
};
