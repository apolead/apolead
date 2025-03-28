
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepZero from '@/components/signup/StepZero';
import StepOne from '@/components/signup/StepOne';
import StepTwo from '@/components/signup/StepTwo';
import StepThree from '@/components/signup/StepThree';
import ConfirmationScreen from '@/components/signup/ConfirmationScreen';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingGovId, setIsCheckingGovId] = useState(false);
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
    speedTest: '',
    systemSettings: '',
    availableHours: [],
    availableDays: [],
    dayHours: {},
    salesExperience: false,
    salesMonths: '',
    salesCompany: '',
    salesProduct: '',
    serviceExperience: false,
    serviceMonths: '',
    serviceCompany: '',
    serviceProduct: '',
    meetObligation: false,
    loginDiscord: false,
    checkEmails: false,
    solveProblems: false,
    completeTraining: false,
    personalStatement: '',
    acceptedTerms: false,
    applicationStatus: 'pending'
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If already authenticated, update userData with email
        setUserData(prev => ({ ...prev, email: session.user.email }));
      }
    };
    
    checkSession();
  }, []);
  
  const updateUserData = async (newData) => {
    // Update user data immediately without validation for normal fields
    if (!newData.govIdNumber) {
      setUserData(prev => ({ ...prev, ...newData }));
      return;
    }
    
    // Only validate government ID if it's being updated and different from current
    if (newData.govIdNumber && newData.govIdNumber !== userData.govIdNumber) {
      // No need to immediately validate - let StepOne handle this when continuing
      setUserData(prev => ({ ...prev, ...newData }));
    } else {
      // Just update the data normally
      setUserData(prev => ({ ...prev, ...newData }));
    }
  };
  
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const uploadFile = async (file) => {
    try {
      if (!file) return null;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User is not authenticated');
      }
      
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Convert file to ArrayBuffer for upload
      const fileArrayBuffer = await file.arrayBuffer();
      
      const { data, error } = await supabase.storage
        .from('user_documents')
        .upload(filePath, fileArrayBuffer, {
          contentType: file.type,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_documents')
        .getPublicUrl(filePath);
      
      console.log('Uploaded file public URL:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return null;
    }
  };
  
  const determineApplicationStatus = () => {
    // Check minimum requirements
    if (!userData.hasHeadset || !userData.hasQuietPlace) {
      return 'rejected';
    }
    
    // Check if they can meet the obligations
    if (!userData.meetObligation || !userData.loginDiscord || 
        !userData.checkEmails || !userData.solveProblems || 
        !userData.completeTraining) {
      return 'rejected';
    }
    
    // Default to approved if they pass the checks
    return 'approved';
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Verify government ID one more time before final submission
      try {
        setIsCheckingGovId(true);
        // Check if the government ID has been used before
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('gov_id_number')
          .eq('gov_id_number', userData.govIdNumber)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
        const { data: applicationData, error: applicationError } = await supabase
          .from('user_applications')
          .select('gov_id_number')
          .eq('gov_id_number', userData.govIdNumber)
          .maybeSingle();
          
        if (applicationError) throw applicationError;
        
        if (profileData || applicationData) {
          toast({
            title: "Government ID already used",
            description: "This government ID has already been registered in our system.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          setIsCheckingGovId(false);
          return;
        }
        setIsCheckingGovId(false);
      } catch (error) {
        console.error('Error verifying government ID:', error);
        setIsCheckingGovId(false);
        // Continue with submission despite error checking ID
      }
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in with Google to complete your application",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Upload ID image if provided
      let govIdImageUrl = null;
      if (userData.govIdImage) {
        govIdImageUrl = await uploadFile(userData.govIdImage);
      }
      
      // Determine if the application should be approved or rejected
      const applicationStatus = determineApplicationStatus();
      
      // Prepare data for submission
      const data = {
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
        speed_test: userData.speedTest,
        system_settings: userData.systemSettings,
        available_hours: userData.availableHours,
        available_days: userData.availableDays,
        day_hours: userData.dayHours,
        sales_experience: userData.salesExperience,
        sales_months: userData.salesMonths,
        salesCompany: userData.salesCompany,
        salesProduct: userData.salesProduct,
        service_experience: userData.serviceExperience,
        service_months: userData.serviceMonths,
        serviceCompany: userData.serviceCompany,
        serviceProduct: userData.serviceProduct,
        meet_obligation: userData.meetObligation,
        login_discord: userData.loginDiscord,
        check_emails: userData.checkEmails,
        solve_problems: userData.solveProblems,
        complete_training: userData.completeTraining,
        personal_statement: userData.personalStatement,
        accepted_terms: userData.acceptedTerms,
        application_status: applicationStatus
      };
      
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', session.user.id);
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }
      
      // For rejected applications, sign out the user
      if (applicationStatus === 'rejected') {
        await supabase.auth.signOut();
        navigate(`/confirmation?status=rejected`);
        return;
      }
      
      // For approved applications, continue to confirmation screen
      // Include email redirect for approved applications only
      // The confirmation screen might require login for some views
      setCurrentStep(4);
      navigate('/confirmation?status=approved');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render steps
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepZero userData={userData} updateUserData={updateUserData} nextStep={nextStep} />;
      case 1:
        return <StepOne 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          prevStep={prevStep}
          isCheckingGovId={isCheckingGovId}
        />;
      case 2:
        return <StepTwo userData={userData} updateUserData={updateUserData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <StepThree userData={userData} updateUserData={updateUserData} handleSubmit={handleSubmit} prevStep={prevStep} isSubmitting={isSubmitting} />;
      case 4:
        return <ConfirmationScreen />;
      default:
        return <StepZero userData={userData} updateUserData={updateUserData} nextStep={nextStep} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
};

export default SignUp;
