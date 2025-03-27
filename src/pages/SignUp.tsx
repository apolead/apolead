
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
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const nextStep = async () => {
    if (currentStep === 0) {
      if (!userData.email) {
        toast({
          title: "Email required",
          description: "Please enter an email address to continue",
          variant: "destructive",
        });
        return;
      }
      
      setIsCheckingEmail(true);
      try {
        const { data: existingProfiles, error: checkEmailError } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('email', userData.email.toLowerCase())
          .in('application_status', ['rejected']);
        
        if (checkEmailError) throw checkEmailError;
        
        if (existingProfiles && existingProfiles.length > 0) {
          toast({
            title: "Application Previously Submitted",
            description: "This email has been used for a previous application that did not meet our requirements. Please use a different email address.",
            variant: "destructive",
          });
          setIsCheckingEmail(false);
          return;
        }
      } catch (error) {
        console.error('Error checking email:', error);
      } finally {
        setIsCheckingEmail(false);
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

  const checkAllCommitmentsAreTrue = () => {
    const commitments = [
      'meetObligation',
      'loginDiscord',
      'checkEmails',
      'solveProblems',
      'completeTraining'
    ];
    
    return commitments.every(commitment => userData[commitment] === true);
  };

  const uploadFile = async (userId, file, fileType) => {
    if (!file) return null;
    
    try {
      const fileName = `${userId}_${fileType}`;
      console.log(`Uploading ${fileType} for user ${userId}:`, fileName);
      
      const { data, error } = await supabase.storage
        .from('user_documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading ${fileType}:`, error);
        return null;
      }
      
      console.log(`${fileType} uploaded successfully:`, data.path);
      return data.path;
    } catch (error) {
      console.error(`Exception in ${fileType} upload:`, error);
      return null;
    }
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

      const { data: existingProfiles, error: checkEmailError } = await supabase
        .from('user_profiles')
        .select('application_status')
        .eq('email', userData.email.toLowerCase())
        .in('application_status', ['rejected']);
      
      if (checkEmailError) throw checkEmailError;
      
      if (existingProfiles && existingProfiles.length > 0) {
        toast({
          title: "Application Previously Submitted",
          description: "This email has been used for a previous application that did not meet our requirements. Please use a different email address.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const passedAllCommitments = checkAllCommitmentsAreTrue();

      console.log("User data before creating account:", userData);
      console.log("Passed all commitments:", passedAllCommitments);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            birth_day: userData.birthDay || null,
            gov_id_number: userData.govIdNumber || null,
            gov_id_image: null,
            cpu_type: userData.cpuType || null,
            ram_amount: userData.ramAmount || null,
            has_headset: userData.hasHeadset === null ? false : userData.hasHeadset,
            has_quiet_place: userData.hasQuietPlace === null ? false : userData.hasQuietPlace,
            speed_test: null,
            system_settings: null,
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
            application_status: passedAllCommitments ? 'approved' : 'rejected'
          },
          ...(passedAllCommitments ? { emailRedirectTo: `${window.location.origin}/login` } : {})
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed. Please try again.');
      }

      console.log("User created successfully:", authData.user.id);

      let session = null;
      if (passedAllCommitments) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password,
        });
        
        if (signInError) {
          console.error('Error signing in after registration:', signInError);
        } else {
          session = signInData.session;
          console.log("User signed in successfully for file uploads");
        }
      }

      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          birth_day: userData.birthDay || null,
          gov_id_number: userData.govIdNumber || null,
          gov_id_image: null,
          cpu_type: userData.cpuType || null,
          ram_amount: userData.ramAmount || null,
          has_headset: userData.hasHeadset === null ? false : userData.hasHeadset,
          has_quiet_place: userData.hasQuietPlace === null ? false : userData.hasQuietPlace,
          speed_test: null,
          system_settings: null,
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
          application_status: passedAllCommitments ? 'approved' : 'rejected'
        });

      if (userProfileError) {
        console.error('Error creating user profile:', userProfileError);
      } else {
        console.log('User profile created successfully');
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'agent'
        });

      if (roleError) {
        console.error('Error creating user role:', roleError);
      } else {
        console.log('User role created successfully');
      }

      let govIdPath = null;
      let speedTestPath = null;
      let systemSettingsPath = null;

      if (session) {
        if (userData.govIdImage) {
          govIdPath = await uploadFile(authData.user.id, userData.govIdImage, 'gov_id');
        }
        
        if (userData.speedTest) {
          speedTestPath = await uploadFile(authData.user.id, userData.speedTest, 'speed_test');
        }
        
        if (userData.systemSettings) {
          systemSettingsPath = await uploadFile(authData.user.id, userData.systemSettings, 'system_settings');
        }
        
        // Define the type for updateData to fix the TypeScript errors
        interface UpdateDataType {
          gov_id_image?: string | null;
          speed_test?: string | null;
          system_settings?: string | null;
        }
        
        const updateData: UpdateDataType = {};
        if (govIdPath) updateData.gov_id_image = govIdPath;
        if (speedTestPath) updateData.speed_test = speedTestPath;
        if (systemSettingsPath) updateData.system_settings = systemSettingsPath;
        
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', authData.user.id);
          
          if (updateError) {
            console.error('Error updating user profile with file paths:', updateError);
          } else {
            console.log('User profile updated with file paths successfully');
          }
        }
      } else {
        console.log('User not signed in, skipping file uploads');
      }

      if (passedAllCommitments) {
        toast({
          title: "Application submitted successfully",
          description: "Your application has been approved! Please check your email for confirmation.",
          variant: "default",
        });
      } else {
        toast({
          title: "Application received",
          description: "We're unable to move forward with your application at this time based on your information.",
          variant: "destructive",
        });
      }
      
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
        return <StepZero 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          isCheckingEmail={isCheckingEmail}
        />;
      case 1:
        return <StepOne userData={userData} updateUserData={updateUserData} nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return <StepTwo userData={userData} updateUserData={updateUserData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <StepThree userData={userData} updateUserData={updateUserData} prevStep={prevStep} handleSubmit={handleSubmit} />;
      case 4:
        return <ConfirmationScreen />;
      default:
        return <StepZero 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          isCheckingEmail={isCheckingEmail}
        />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      {renderStep()}
    </div>
  );
};

export default SignUp;
