
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
    hasHeadset: false,
    hasQuietPlace: false,
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

  const nextStep = () => {
    if (currentStep === 0) {
      if (!userData.firstName.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter your first and last name",
          variant: "destructive",
        });
        return;
      }
      
      const nameParts = userData.firstName.trim().split(' ');
      if (nameParts.length > 1 && !userData.lastName) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        setUserData(prev => ({
          ...prev,
          firstName,
          lastName
        }));
      } else if (nameParts.length === 1 && !userData.lastName) {
        toast({
          title: "Missing information",
          description: "Please enter both your first and last name",
          variant: "destructive",
        });
        return;
      }
      
      // Move password validation from step 1 to step 0
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
      
      if (userData.password.length < 8) {
        toast({
          title: "Weak password",
          description: "Password should be at least 8 characters long",
          variant: "destructive",
        });
        return;
      }
      
      if (userData.password !== userData.confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "The passwords you entered don't match",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep === 1) {
      // Auto-fill confirmEmail if it's empty but email exists
      if (!userData.confirmEmail && userData.email) {
        setUserData(prev => ({
          ...prev,
          confirmEmail: prev.email
        }));
      }
      
      // Ensure emails match if both are provided
      if (userData.email && userData.confirmEmail && userData.email !== userData.confirmEmail) {
        toast({
          title: "Email mismatch",
          description: "The email addresses you entered don't match",
          variant: "destructive",
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const updateUserData = (data) => {
    setUserData({ ...userData, ...data });
  };

  const handleSubmit = async () => {
    try {
      // Get missing commitments to show specific error
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
      
      // Check for specific missing commitments
      const missingCommitments = getMissingCommitments();
      if (missingCommitments.length > 0) {
        toast({
          title: "Missing information",
          description: `Please answer these commitment questions: ${missingCommitments.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      if (!userData.acceptedTerms) {
        toast({
          title: "Terms required",
          description: "You must accept the terms and conditions to continue",
          variant: "destructive",
        });
        return;
      }
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are missing or invalid');
        throw new Error('Configuration error. Please contact support.');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed. Please try again.');
      }

      // Create the user_profiles entry first
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
            gov_id_image: null, // We'll update this after upload
            cpu_type: userData.cpuType,
            ram_amount: userData.ramAmount,
            has_headset: userData.hasHeadset,
            has_quiet_place: userData.hasQuietPlace,
            speed_test: null, // We'll update this after upload
            system_settings: null, // We'll update this after upload
            available_hours: userData.availableHours || [],
            available_days: userData.availableDays || [],
            day_hours: userData.dayHours || {},
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

      // Now handle file uploads if needed, but don't stop the process if they fail
      let govIdUrl = null;
      let speedTestUrl = null;
      let systemSettingsUrl = null;

      if (userData.govIdImage) {
        try {
          const govIdFileName = `${authData.user.id}_gov_id`;
          const { data: govIdData, error: govIdError } = await supabase.storage
            .from('user_documents')
            .upload(govIdFileName, userData.govIdImage);
          
          if (!govIdError) {
            govIdUrl = govIdData.path;
            // Update the user profile with the file path
            await supabase
              .from('user_profiles')
              .update({ gov_id_image: govIdUrl })
              .eq('user_id', authData.user.id);
          } else {
            console.error('Error uploading government ID:', govIdError);
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
          
          if (!speedTestError) {
            speedTestUrl = speedTestData.path;
            // Update the user profile with the file path
            await supabase
              .from('user_profiles')
              .update({ speed_test: speedTestUrl })
              .eq('user_id', authData.user.id);
          } else {
            console.error('Error uploading speed test:', speedTestError);
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
          
          if (!systemSettingsError) {
            systemSettingsUrl = systemSettingsData.path;
            // Update the user profile with the file path
            await supabase
              .from('user_profiles')
              .update({ system_settings: systemSettingsUrl })
              .eq('user_id', authData.user.id);
          } else {
            console.error('Error uploading system settings:', systemSettingsError);
          }
        } catch (fileError) {
          console.error('Error in system settings upload:', fileError);
        }
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
