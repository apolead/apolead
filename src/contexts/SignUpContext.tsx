
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
  
  const uploadFile = async (file: File | null) => {
    try {
      if (!file) return null;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User is not authenticated');
      }
      
      const userId = session.user.id;
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
      
      // Upload both government ID and speed test images first
      console.log('Starting file uploads...');
      
      let govIdImageUrl = null;
      if (userData.govIdImage) {
        console.log('Uploading government ID image:', userData.govIdImage.name);
        govIdImageUrl = await uploadFile(userData.govIdImage);
        console.log('Government ID image uploaded, URL:', govIdImageUrl);
      }
      
      let speedTestUrl = null;
      if (userData.speedTest) {
        console.log('Uploading speed test image:', userData.speedTest.name);
        speedTestUrl = await uploadFile(userData.speedTest);
        console.log('Speed test image uploaded, URL:', speedTestUrl);
      }
      
      let systemSettingsUrl = null;
      if (userData.systemSettings) {
        console.log('Uploading system settings image:', userData.systemSettings.name);
        systemSettingsUrl = await uploadFile(userData.systemSettings);
        console.log('System settings image uploaded, URL:', systemSettingsUrl);
      }
      
      const applicationStatus = determineApplicationStatus();
      console.log('Application status determined:', applicationStatus);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, need to sign up the user first
      if (!session) {
        try {
          console.log('No session found, creating user account with email:', userData.email);
          
          // Create the user account with all user data in metadata
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), // Generate a random secure password
            options: {
              data: {
                first_name: userData.firstName,
                last_name: userData.lastName,
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
              },
            },
          });
          
          if (error) throw error;
          
          console.log('User created successfully:', data);
          
          // If we don't have a session after signup, that's okay - we'll create the profile record directly
          // and then redirect to the appropriate page
          if (!data.session) {
            console.log('No session returned after signup, proceeding with profile creation anyway');
            
            // Create user_profiles record with service role
            const profileData = {
              user_id: data.user.id, // Critical: Include the user_id field
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
            
            // Redirect based on application status
            setIsSubmitting(false);
            
            if (applicationStatus === 'rejected') {
              navigate('/confirmation?status=rejected');
            } else {
              navigate('/confirmation?status=approved');
            }
            
            return;
          }
        } catch (error: any) {
          console.error('Error creating user account:', error);
          toast({
            title: "Authentication failed",
            description: error.message || "Failed to create user account",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Get the current session again (could be new or existing)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        // Even if we don't have a session, we'll let the form submission continue
        // as we've already determined the application status and uploaded files
        console.log('No session available, but continuing with form submission');
      }
      
      const userId = currentSession?.user?.id;
      
      // Always include user_id in the data object
      const data = {
        user_id: userId, // Fix: Adding the required user_id field
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
      
      if (userId) {
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
      } else {
        // If we somehow don't have a user ID at this point, show an error
        console.error('No user ID available for profile creation');
        toast({
          title: "Error creating profile",
          description: "Could not determine user ID for profile creation",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (updateError) {
        console.error('Error updating/inserting user profile:', updateError);
        throw updateError;
      }
      
      // Redirect based on application status
      if (applicationStatus === 'rejected') {
        if (currentSession) {
          await supabase.auth.signOut();
        }
        navigate('/confirmation?status=rejected');
        return;
      }
      
      navigate('/confirmation?status=approved');
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
