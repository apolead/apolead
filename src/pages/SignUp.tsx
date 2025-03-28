import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserData(prev => ({ ...prev, email: session.user.email }));
      }
    };
    
    checkSession();
  }, []);
  
  const updateUserData = async (newData) => {
    if (!newData.govIdNumber) {
      setUserData(prev => ({ ...prev, ...newData }));
      return;
    }
    
    if (newData.govIdNumber && newData.govIdNumber !== userData.govIdNumber) {
      setUserData(prev => ({ ...prev, ...newData }));
    } else {
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
    if (!userData.hasHeadset || !userData.hasQuietPlace) {
      return 'rejected';
    }
    
    if (!userData.meetObligation || !userData.loginDiscord || 
        !userData.checkEmails || !userData.solveProblems || 
        !userData.completeTraining) {
      return 'rejected';
    }
    
    return 'approved';
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      try {
        setIsCheckingGovId(true);
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
      }
      
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
      
      let govIdImageUrl = null;
      if (userData.govIdImage) {
        govIdImageUrl = await uploadFile(userData.govIdImage);
      }
      
      const applicationStatus = determineApplicationStatus();
      
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
        application_status: applicationStatus
      };
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', session.user.id);
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }
      
      if (applicationStatus === 'rejected') {
        await supabase.auth.signOut();
        navigate(`/confirmation?status=rejected`);
        return;
      }
      
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
  
  const handleBackToHome = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepZero 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          handleBackToHome={handleBackToHome} 
        />;
      case 1:
        return <StepOne 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          prevStep={prevStep}
          isCheckingGovId={isCheckingGovId}
          handleBackToHome={handleBackToHome}
        />;
      case 2:
        return <StepTwo 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          prevStep={prevStep} 
          handleBackToHome={handleBackToHome}
        />;
      case 3:
        return <StepThree 
          userData={userData} 
          updateUserData={updateUserData} 
          handleSubmit={handleSubmit} 
          prevStep={prevStep} 
          isSubmitting={isSubmitting} 
          handleBackToHome={handleBackToHome}
        />;
      case 4:
        return <ConfirmationScreen />;
      default:
        return <StepZero 
          userData={userData} 
          updateUserData={updateUserData} 
          nextStep={nextStep} 
          handleBackToHome={handleBackToHome}
        />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
};

export default SignUp;
