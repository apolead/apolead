
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AuthContextType {
  user: any | null;
  userProfile: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to sanitize boolean values in the profile
  const sanitizeProfileData = (profileData: any) => {
    if (!profileData) return null;
    
    const cleanProfile = { ...profileData };
    
    const booleanFields = [
      'quiz_passed', 
      'training_video_watched',
      'has_headset',
      'has_quiet_place',
      'sales_experience',
      'service_experience',
      'meet_obligation',
      'login_discord',
      'check_emails',
      'solve_problems',
      'complete_training',
      'accepted_terms',
      'onboarding_completed',
      'eligible_for_training'
    ];
    
    booleanFields.forEach(field => {
      if (field in cleanProfile) {
        const value = cleanProfile[field];
        
        if (field === 'onboarding_completed' || field === 'eligible_for_training') {
          console.log(`Raw ${field} value:`, value, typeof value);
        }
        
        if (value === null || value === undefined) {
          cleanProfile[field] = null;
        } else if (typeof value === 'boolean') {
          cleanProfile[field] = value;
        } else if (typeof value === 'string') {
          const lowerValue = String(value).toLowerCase();
          if (['true', 't', 'yes', 'y', '1'].includes(lowerValue)) {
            cleanProfile[field] = true;
          } else if (['false', 'f', 'no', 'n', '0'].includes(lowerValue)) {
            cleanProfile[field] = false;
          } else {
            cleanProfile[field] = null;
          }
        } else if (typeof value === 'number') {
          cleanProfile[field] = value !== 0;
        } else {
          cleanProfile[field] = null;
        }
        
        if (field === 'onboarding_completed' || field === 'eligible_for_training') {
          console.log(`Sanitized ${field} value:`, cleanProfile[field], typeof cleanProfile[field]);
        }
      }
    });
    
    // Ensure we properly handle arrays that might be null or undefined
    if (cleanProfile.available_days === null || cleanProfile.available_days === undefined) {
      cleanProfile.available_days = [];
    }
    
    if (cleanProfile.day_hours === null || cleanProfile.day_hours === undefined) {
      cleanProfile.day_hours = {};
    }
    
    console.log('Sanitized profile data:', {
      onboarding_completed: cleanProfile.onboarding_completed, 
      eligible_for_training: cleanProfile.eligible_for_training,
      types: {
        onboarding_completed: typeof cleanProfile.onboarding_completed,
        eligible_for_training: typeof cleanProfile.eligible_for_training
      }
    });
    
    return cleanProfile;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in hook:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const parsed = sanitizeProfileData(JSON.parse(cachedProfile));
              console.log('Using cached profile while fetching from DB:', parsed);
              setUserProfile(parsed);
            } catch (error) {
              console.error('Error parsing cached profile:', error);
              localStorage.removeItem('userProfile');
            }
          }
          
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          localStorage.removeItem('userProfile');
        }
      }
    );
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const parsed = sanitizeProfileData(JSON.parse(cachedProfile));
              console.log('Using cached profile while fetching from DB:', parsed);
              setUserProfile(parsed);
            } catch (error) {
              console.error('Error parsing cached profile:', error);
              localStorage.removeItem('userProfile');
            }
          }
          
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await (supabase.rpc as any)('get_user_profile_direct', {
        input_user_id: userId
      });
      
      if (error) {
        console.error('Error fetching user profile with direct function:', error);
        return;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        const profileData = data[0];
        const sanitizedData = sanitizeProfileData(profileData);
        console.log('User profile fetched successfully with direct function:', sanitizedData);
        
        console.log('Onboarding state values:', {
          first_name: sanitizedData.first_name,
          last_name: sanitizedData.last_name,
          birth_day: sanitizedData.birth_day,
          gov_id_number: sanitizedData.gov_id_number,
          gov_id_image: sanitizedData.gov_id_image,
          onboarding_completed: sanitizedData.onboarding_completed,
          eligible_for_training: sanitizedData.eligible_for_training,
          meet_obligation: sanitizedData.meet_obligation,
          login_discord: sanitizedData.login_discord,
          check_emails: sanitizedData.check_emails,
          solve_problems: sanitizedData.solve_problems,
          complete_training: sanitizedData.complete_training,
          has_headset: sanitizedData.has_headset,
          has_quiet_place: sanitizedData.has_quiet_place
        });
        
        setUserProfile(sanitizedData);
        
        localStorage.setItem('userProfile', JSON.stringify(sanitizedData));
      } else {
        console.log('No user profile found with direct function');
      }
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login successful');
      
      if (data.user) {
        setTimeout(() => {
          fetchUserProfile(data.user.id);
        }, 0);
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      localStorage.removeItem('tempCredentials');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Logout from Supabase successful');
      } else {
        console.log('No active session found, client-side logout completed');
      }
      
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully"
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      localStorage.removeItem('tempCredentials');
      
      toast({
        title: "Partial logout",
        description: "You've been logged out locally, but there was an issue with the server logout",
        variant: "default"
      });
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      console.log('Updating user profile with:', data);
      
      // Create a safe copy of the data with proper handling of arrays and objects
      const safeData = { ...data };
      
      // Handle arrays and objects correctly
      if (safeData.available_days) {
        // If it's already a valid array, PostgreSQL will handle it
        if (!Array.isArray(safeData.available_days) || safeData.available_days.length === 0) {
          safeData.available_days = []; // Use empty array instead of removing
        }
      }
      
      if (safeData.day_hours) {
        // If it's an empty object, use an empty object
        if (typeof safeData.day_hours === 'object' && Object.keys(safeData.day_hours).length === 0) {
          safeData.day_hours = {};
        }
      }
      
      const { error } = await (supabase.rpc as any)('update_user_profile_direct', {
        input_user_id: user.id,
        input_updates: safeData
      });
      
      if (error) throw error;
      
      // Fetch the latest profile after update to ensure we have the latest state
      await fetchUserProfile(user.id);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
