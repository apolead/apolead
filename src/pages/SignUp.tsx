
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StepZero from '@/components/signup/StepZero';
import StepOne from '@/components/signup/StepOne';
import StepTwo from '@/components/signup/StepTwo';
import StepThree from '@/components/signup/StepThree';
import ConfirmationScreen from '@/components/signup/ConfirmationScreen';

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDay: '',
    govIdNumber: '',
    govIdImage: null,
    cpuType: '',
    ramAmount: '',
    hasHeadset: false,
    hasQuietPlace: false,
    speedTest: null,
    systemSettings: null,
    availableHours: [],
    acceptedTerms: false,
    password: '',
    // New fields for call center experience
    salesExperience: false,
    salesMonths: '',
    salesCompany: '',
    salesProduct: '',
    serviceExperience: false,
    serviceMonths: '',
    serviceCompany: '',
    serviceProduct: '',
    // Fields for availability and commitments
    meetObligation: false,
    availableDays: [],
    dayHours: {},
    loginDiscord: false,
    checkEmails: false,
    solveProblems: false,
    completeTraining: false,
    personalStatement: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to handle next step
  const nextStep = () => {
    // Process full name into first/last before proceeding to step 1
    if (currentStep === 0 && userData.firstName) {
      // Split full name into firstName and lastName if not already done
      const nameParts = userData.firstName.trim().split(' ');
      if (nameParts.length > 1 && !userData.lastName) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        setUserData(prev => ({
          ...prev,
          firstName,
          lastName
        }));
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  // Function to handle previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Function to update user data
  const updateUserData = (data) => {
    setUserData({ ...userData, ...data });
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      // Check Supabase URL and Key are available
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are missing or invalid');
        toast({
          title: "Configuration Error",
          description: "Supabase credentials are missing. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // 1. Create user account with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed. Please try again.');
      }

      // 2. Upload images to Supabase Storage
      let govIdUrl = null;
      let speedTestUrl = null;
      let systemSettingsUrl = null;

      if (userData.govIdImage) {
        const govIdFileName = `${authData.user.id}_gov_id`;
        const { data: govIdData, error: govIdError } = await supabase.storage
          .from('user_documents')
          .upload(govIdFileName, userData.govIdImage);
        
        if (govIdError) throw govIdError;
        govIdUrl = govIdData.path;
      }

      if (userData.speedTest) {
        const speedTestFileName = `${authData.user.id}_speed_test`;
        const { data: speedTestData, error: speedTestError } = await supabase.storage
          .from('user_documents')
          .upload(speedTestFileName, userData.speedTest);
        
        if (speedTestError) throw speedTestError;
        speedTestUrl = speedTestData.path;
      }

      if (userData.systemSettings) {
        const systemSettingsFileName = `${authData.user.id}_system_settings`;
        const { data: systemSettingsData, error: systemSettingsError } = await supabase.storage
          .from('user_documents')
          .upload(systemSettingsFileName, userData.systemSettings);
        
        if (systemSettingsError) throw systemSettingsError;
        systemSettingsUrl = systemSettingsData.path;
      }

      // 3. Store user data in Supabase database
      const { error: userDataError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            birth_day: userData.birthDay,
            gov_id_number: userData.govIdNumber,
            gov_id_image: govIdUrl,
            cpu_type: userData.cpuType,
            ram_amount: userData.ramAmount,
            has_headset: userData.hasHeadset,
            has_quiet_place: userData.hasQuietPlace,
            speed_test: speedTestUrl,
            system_settings: systemSettingsUrl,
            available_hours: userData.availableHours,
            available_days: userData.availableDays,
            day_hours: userData.dayHours,
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
            application_date: new Date().toISOString(),
            application_status: 'pending',
          }
        ]);

      if (userDataError) {
        console.error('Error submitting profile data:', userDataError);
        throw userDataError;
      }

      // Show success message and confirmation screen
      toast({
        title: "Application submitted successfully",
        description: "Your application has been received. We'll be in touch soon!",
        variant: "default",
      });
      
      nextStep();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error submitting application",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepZero userData={userData} updateUserData={updateUserData} nextStep={nextStep} />;
      case 1:
        return <StepOne userData={userData} updateUserData={updateUserData} nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return <StepTwo userData={userData} updateUserData={updateUserData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <StepThree userData={userData} updateUserData={updateUserData} prevStep={prevStep} handleSubmit={handleSubmit} />;
      case 4:
        return <ConfirmationScreen />;
      default:
        return <StepZero userData={userData} updateUserData={updateUserData} nextStep={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      {renderStep()}
    </div>
  );
};

export default SignUp;
