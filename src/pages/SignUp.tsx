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
    confirmEmail: '',
    birthDay: '',
    govIdNumber: '',
    govIdImage: null,
    cpuType: '',
    ramAmount: '',
    hasHeadset: null,
    hasQuietPlace: null,
    speedTest: null,
    systemSettings: null,
    availableHours: [],
    acceptedTerms: false,
    password: '',
    confirmPassword: '',
    salesExperience: false,
    salesMonths: '',
    salesCompany: '',
    salesProduct: '',
    serviceExperience: false,
    serviceMonths: '',
    serviceCompany: '',
    serviceProduct: '',
    meetObligation: null,
    availableDays: [],
    dayHours: {},
    loginDiscord: null,
    checkEmails: null,
    solveProblems: null,
    completeTraining: null,
    personalStatement: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const updateUserData = (data) => {
    setUserData({ ...userData, ...data });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
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
      
      const missingCommitments = getMissingCommitments();
      if (missingCommitments.length > 0) {
        toast({
          title: "Missing information",
          description: `Please answer these commitment questions: ${missingCommitments.join(', ')}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!userData.acceptedTerms) {
        toast({
          title: "Terms required",
          description: "You must accept the terms and conditions to continue",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!userData.email.toLowerCase().endsWith('@gmail.com')) {
        toast({
          title: "Invalid email",
          description: "Only Gmail accounts are accepted at this time",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed. Please try again.');
      }

      console.log("User created successfully:", authData.user.id);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });
      
      if (signInError) {
        console.error('Error signing in after registration:', signInError);
      }

      let govIdPath = null;
      let speedTestPath = null;
      let systemSettingsPath = null;

      if (userData.govIdImage) {
        try {
          const govIdFileName = `${authData.user.id}_gov_id`;
          const { data: govIdData, error: govIdError } = await supabase.storage
            .from('user_documents')
            .upload(govIdFileName, userData.govIdImage);
          
          if (govIdError) {
            console.error('Error uploading government ID:', govIdError);
          } else {
            govIdPath = govIdData.path;
          }
        } catch (fileError) {
          console.error('Error in government ID upload:', fileError);
        }
      }

      if (userData.speedTest) {
        try {
          const speedTestFileName = `${authData.user.id}_speed_test`;
          const { data: speedTestData, error: speedTestError } = await supabase.storage
            .from('user_documents')
            .upload(speedTestFileName, userData.speedTest);
          
          if (speedTestError) {
            console.error('Error uploading speed test:', speedTestError);
          } else {
            speedTestPath = speedTestData.path;
          }
        } catch (fileError) {
          console.error('Error in speed test upload:', fileError);
        }
      }

      if (userData.systemSettings) {
        try {
          const systemSettingsFileName = `${authData.user.id}_system_settings`;
          const { data: systemSettingsData, error: systemSettingsError } = await supabase.storage
            .from('user_documents')
            .upload(systemSettingsFileName, userData.systemSettings);
          
          if (systemSettingsError) {
            console.error('Error uploading system settings:', systemSettingsError);
          } else {
            systemSettingsPath = systemSettingsData.path;
          }
        } catch (fileError) {
          console.error('Error in system settings upload:', fileError);
        }
      }

      const { error: userDataError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          birth_day: userData.birthDay || null,
          gov_id_number: userData.govIdNumber || null,
          gov_id_image: govIdPath,
          cpu_type: userData.cpuType || null,
          ram_amount: userData.ramAmount || null,
          has_headset: userData.hasHeadset === null ? false : userData.hasHeadset,
          has_quiet_place: userData.hasQuietPlace === null ? false : userData.hasQuietPlace,
          speed_test: speedTestPath,
          system_settings: systemSettingsPath,
          available_hours: userData.availableHours || [],
          available_days: userData.availableDays || [],
          day_hours: userData.dayHours || {},
          sales_experience: userData.salesExperience || false,
          sales_months: userData.salesMonths || null,
          sales_company: userData.salesCompany || null,
          sales_product: userData.salesProduct || null,
          service_experience: userData.serviceExperience || false,
          service_months: userData.serviceMonths || null,
          service_company: userData.serviceCompany || null,
          service_product: userData.serviceProduct || null,
          meet_obligation: userData.meetObligation === null ? false : userData.meetObligation,
          login_discord: userData.loginDiscord === null ? false : userData.loginDiscord,
          check_emails: userData.checkEmails === null ? false : userData.checkEmails,
          solve_problems: userData.solveProblems === null ? false : userData.solveProblems,
          complete_training: userData.completeTraining === null ? false : userData.completeTraining,
          personal_statement: userData.personalStatement || null,
          accepted_terms: userData.acceptedTerms || false,
          application_date: new Date().toISOString(),
          application_status: 'pending',
        });

      if (userDataError) {
        console.error('Error submitting profile data:', userDataError);
        throw userDataError;
      }

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
    } finally {
      setIsSubmitting(false);
    }
  };

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
