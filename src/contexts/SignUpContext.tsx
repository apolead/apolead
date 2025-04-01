
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the shape of our user data
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  birthDay: string;
  govIdNumber: string;
  govIdImage: File | null;
  cpuType: string;
  ramAmount: string;
  hasHeadset: boolean | null;
  hasQuietPlace: boolean | null;
  speedTest: File | null;
  systemSettings: File | null;
  availableHours: string[];
  availableDays: string[];
  dayHours: Record<string, string>;
  salesExperience: boolean;
  salesMonths: string;
  salesCompany: string;
  salesProduct: string;
  serviceExperience: boolean;
  serviceMonths: string;
  serviceCompany: string;
  serviceProduct: string;
  meetObligation: boolean | null;
  loginDiscord: boolean | null;
  checkEmails: boolean | null;
  solveProblems: boolean | null;
  completeTraining: boolean | null;
  personalStatement: string;
  acceptedTerms: boolean;
  applicationStatus: string;
}

// Define application status type for type safety
type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// Initial user data state
const initialUserData: UserData = {
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
};

// Define the context type
interface SignUpContextType {
  currentStep: number;
  isSubmitting: boolean;
  isCheckingGovId: boolean;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => Promise<void>;
}

// Create the context
const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

// Custom hook to use the context
export const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
};

// Provider component
export const SignUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingGovId, setIsCheckingGovId] = useState(false);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const updateUserData = (newData: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...newData }));
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
  
  const uploadFile = async (file: File | null, useServiceRole = false) => {
    try {
      if (!file) return null;
      
      let userId = 'temp';
      
      // If we need to use session, get the current session
      if (!useServiceRole) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('User is not authenticated');
        }
        
        userId = session.user.id;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log('Uploading file:', file.name, 'to path:', filePath);
      
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
  
  const determineApplicationStatus = (): ApplicationStatus => {
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
    if (isSubmitting) return; // Prevent multiple submissions
    
    try {
      setIsSubmitting(true);
      
      // Check only user_profiles table for existing gov ID
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('gov_id_number')
          .eq('gov_id_number', userData.govIdNumber)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          toast({
            title: "Government ID already used",
            description: "This government ID has already been registered in our system.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('Error verifying government ID:', error);
        // Continue anyway
      }
      
      // First, determine application status before anything else
      const applicationStatus = determineApplicationStatus();
      console.log('Application status determined:', applicationStatus);
      
      // Upload both government ID and speed test images first
      // We'll use service role for uploading if no session exists
      console.log('Starting file uploads...');
      
      let govIdImageUrl = null;
      if (userData.govIdImage) {
        console.log('Uploading government ID image:', userData.govIdImage.name);
        govIdImageUrl = await uploadFile(userData.govIdImage, true);
        console.log('Government ID image uploaded, URL:', govIdImageUrl);
      }
      
      let speedTestUrl = null;
      if (userData.speedTest) {
        console.log('Uploading speed test image:', userData.speedTest.name);
        speedTestUrl = await uploadFile(userData.speedTest, true);
        console.log('Speed test image uploaded, URL:', speedTestUrl);
      }
      
      let systemSettingsUrl = null;
      if (userData.systemSettings) {
        console.log('Uploading system settings image:', userData.systemSettings.name);
        systemSettingsUrl = await uploadFile(userData.systemSettings, true);
        console.log('System settings image uploaded, URL:', systemSettingsUrl);
      }
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // For rejected applications, we'll store the data but not create a user
      if (applicationStatus === "rejected") {
        try {
          console.log('Application rejected, storing data without creating user account');
          
          // Generate temporary user ID for rejected applications
          const tempUserId = session?.user?.id || 'temp-' + Math.random().toString(36).substring(2);
          
          // Store in user_applications table
          const { error } = await supabase
            .from('user_applications')
            .insert({
              user_id: tempUserId,
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
              application_status: applicationStatus
            });
            
          if (error) throw error;
          
          // Redirect to rejection page
          setIsSubmitting(false);
          navigate('/confirmation?status=rejected');
          return;
        } catch (error: any) {
          console.error('Error storing rejected application:', error);
          toast({
            title: "Submission failed",
            description: error.message || "There was an error submitting your application",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // If no session and application is approved, create user account
      if (!session && applicationStatus === "approved") {
        try {
          console.log('No session found, creating user account with email:', userData.email);
          
          // Create the user account with all user data in metadata
          // For approved applications, we'll create the user and send confirmation email
          const { data, error } = await supabase.auth.updateUser({
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              application_status: applicationStatus
            }
          });
          
          if (error) throw error;
          
          console.log('User updated successfully:', data);
          
          // Create user_profiles record right away
          const profileData = {
            user_id: session?.user?.id || 'temp-' + Math.random().toString(36).substring(2),
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
            application_status: applicationStatus
          };
          
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert(profileData);
            
          if (insertError) throw insertError;
          
          // Now that profile is created, send confirmation email
          // Only for approved applications
          await supabase.auth.signInWithPassword({
            email: userData.email,
            password: "temporary-password" // This will trigger confirmation email
          }).catch(error => {
            console.log("Expected auth error (just to trigger email):", error);
          });
          
          // Redirect to approval page
          setIsSubmitting(false);
          nextStep(); // Move to confirmation step
          return;
        } catch (error: any) {
          console.error('Error updating user profile:', error);
          toast({
            title: "Update failed",
            description: error.message || "Failed to update user profile",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // If we have an existing session, update the user profile
      if (session) {
        const userId = session.user.id;
        
        // Prepare the data object
        const data = {
          user_id: userId,
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
          application_status: applicationStatus
        };
        
        console.log('Updating user profile with data:', data);
        
        let updateError = null;
        
        // First check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (profileCheckError) {
          console.error('Error checking for existing profile:', profileCheckError);
        }
        
        if (existingProfile) {
          // Update existing profile
          console.log('Updating existing profile for user:', userId);
          const { error } = await supabase
            .from('user_profiles')
            .update(data)
            .eq('user_id', userId);
            
          updateError = error;
        } else {
          // Insert new profile
          console.log('Creating new profile for user:', userId);
          const { error } = await supabase
            .from('user_profiles')
            .insert(data);
            
          updateError = error;
        }
        
        if (updateError) {
          console.error('Error updating/inserting user profile:', updateError);
          throw updateError;
        }
        
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            application_status: applicationStatus
          }
        });
        
        // Redirect based on application status
        if (applicationStatus === "rejected") {
          navigate('/confirmation?status=rejected');
        } else {
          nextStep(); // Move to confirmation step
        }
      } else {
        // This is a fallback, but should not normally be reached
        console.error('No session available for profile update');
        toast({
          title: "Error updating profile",
          description: "Could not determine user session for profile update",
          variant: "destructive",
        });
      }
    } catch (error: any) {
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

  return (
    <SignUpContext.Provider value={{
      currentStep,
      isSubmitting,
      isCheckingGovId,
      userData,
      updateUserData,
      nextStep,
      prevStep,
      handleSubmit
    }}>
      {children}
    </SignUpContext.Provider>
  );
};
