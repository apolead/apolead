import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Type definitions
type SignUpContextType = {
  currentStep: number;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isCheckingGovId: boolean;
  confirmationSent: boolean;
};

type UserData = {
  // Personal Information (Step 1)
  firstName: string;
  lastName: string;
  email: string;
  birthDay: string;
  govIdNumber: string;
  govIdImage: File | null;
  govIdImageUrl: string;
  
  // Computer Requirements (Step 2)
  cpuType: string;
  ramAmount: string;
  hasHeadset: boolean;
  hasQuietPlace: boolean;
  speedTest: File | null;
  speedTestUrl: string;
  systemSettings: File | null;
  systemSettingsUrl: string;
  
  // Availability and Experience (Step 3)
  availableHours: string[];
  availableDays: string[];
  dayHours: Record<string, string[]>;
  
  salesExperience: boolean;
  salesMonths: string;
  salesCompany: string;
  salesProduct: string;
  
  serviceExperience: boolean;
  serviceMonths: string;
  serviceCompany: string;
  serviceProduct: string;
  
  meetObligation: boolean;
  loginDiscord: boolean;
  checkEmails: boolean;
  solveProblems: boolean;
  completeTraining: boolean;
  
  personalStatement: string;
  acceptedTerms: boolean;
};

// Create context
const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

// Initial user data
const initialUserData: UserData = {
  // Personal Information (Step 1)
  firstName: '',
  lastName: '',
  email: '',
  birthDay: '',
  govIdNumber: '',
  govIdImage: null,
  govIdImageUrl: '',
  
  // Computer Requirements (Step 2)
  cpuType: '',
  ramAmount: '',
  hasHeadset: false,
  hasQuietPlace: false,
  speedTest: null,
  speedTestUrl: '',
  systemSettings: null,
  systemSettingsUrl: '',
  
  // Availability and Experience (Step 3)
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
};

export const SignUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingGovId, setIsCheckingGovId] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { toast } = useToast();
  
  // Update user data
  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prevData => ({
      ...prevData,
      ...data
    }));
  };
  
  // Move to next step
  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };
  
  // Move to previous step
  const prevStep = () => {
    setCurrentStep(prevStep => Math.max(0, prevStep - 1));
  };
  
  // Upload a file to Supabase storage
  const uploadFileToStorage = async (file: File, bucketName: string) => {
    if (!file) return null;
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
      
    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    console.log(`File uploaded to ${bucketName}:`, urlData.publicUrl);
    return urlData.publicUrl;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Additional validation can be added here
      if (!userData.acceptedTerms) {
        toast({
          title: "Terms Required",
          description: "You must accept the terms and conditions to continue.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Upload any remaining files that haven't been uploaded yet
      let govIdImageUrl = userData.govIdImageUrl;
      let speedTestUrl = userData.speedTestUrl;
      let systemSettingsUrl = userData.systemSettingsUrl;
      
      try {
        // Upload government ID if not already uploaded
        if (userData.govIdImage && !userData.govIdImageUrl) {
          govIdImageUrl = await uploadFileToStorage(userData.govIdImage, 'government_ids');
        }
        
        // Upload speed test if not already uploaded
        if (userData.speedTest && !userData.speedTestUrl) {
          speedTestUrl = await uploadFileToStorage(userData.speedTest, 'speed_tests');
        }
        
        // Upload system settings if not already uploaded
        if (userData.systemSettings && !userData.systemSettingsUrl) {
          systemSettingsUrl = await uploadFileToStorage(userData.systemSettings, 'system_settings');
        }
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload one or more files. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Insert into user_applications table
      const { data: applicationData, error: applicationError } = await supabase
        .from('user_applications')
        .insert([{
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
          application_status: 'pending'
        }]);
      
      if (applicationError) {
        console.error('Application submission error:', applicationError);
        toast({
          title: "Submission Error",
          description: applicationError.message || "An error occurred during submission.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Application submitted successfully:', applicationData);
      
      // Send confirmation email with signup link immediately for all approved applications
      // Real-world implementation would likely have an admin review step here
      const isAutomaticallyApproved = 
        userData.meetObligation && 
        userData.loginDiscord && 
        userData.checkEmails && 
        userData.solveProblems && 
        userData.completeTraining;
      
      if (isAutomaticallyApproved) {
        try {
          // Call our edge function to send the confirmation email
          console.log('Sending confirmation email to:', userData.email);
          
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ 
              email: userData.email,
              redirectUrl: `${window.location.origin}/confirmation`
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error calling send-confirmation function:', errorText);
            toast({
              title: "Email Notification Error",
              description: "There was an issue sending your confirmation email. Please contact support.",
              variant: "destructive",
              duration: 8000,
            });
          } else {
            const result = await response.json();
            
            if (!result.success) {
              console.error('Error sending confirmation email:', result.error);
              toast({
                title: "Email Notification Error",
                description: "There was an issue sending your confirmation email. Please contact support.",
                variant: "destructive",
                duration: 8000,
              });
            } else {
              console.log('Confirmation email sent successfully');
              setConfirmationSent(true);
              
              toast({
                title: "Application Approved",
                description: "A confirmation email has been sent to your inbox with instructions to complete your registration.",
                duration: 8000,
              });
            }
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          toast({
            title: "Email Notification Error",
            description: "There was an issue sending your confirmation email. Please contact support.",
            variant: "destructive",
            duration: 8000,
          });
        }
      }
      
      // Move to confirmation step
      nextStep();
      
      // Show confirmation toast
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
        duration: 5000,
      });
      
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <SignUpContext.Provider 
      value={{ 
        currentStep, 
        userData, 
        updateUserData, 
        nextStep, 
        prevStep, 
        handleSubmit,
        isSubmitting,
        isCheckingGovId,
        confirmationSent
      }}
    >
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
