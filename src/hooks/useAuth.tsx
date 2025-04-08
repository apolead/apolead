
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  birth_day?: string;
  gov_id_number?: string;
  gov_id_image?: string;
  cpu_type?: string;
  ram_amount?: string;
  has_headset?: boolean;
  has_quiet_place?: boolean;
  speed_test?: string;
  system_settings?: string;
  meet_obligation?: boolean;
  login_discord?: boolean;
  check_emails?: boolean;
  solve_problems?: boolean;
  complete_training?: boolean;
  personal_statement?: string;
  available_days?: string[];
  day_hours?: Record<string, number>;
  accepted_terms?: boolean;
  onboarding_completed?: boolean;
  eligible_for_training?: boolean;
  training_video_watched?: boolean;
  quiz_passed?: boolean;
  agent_standing?: string;
  created_at?: string;
  updated_at?: string;
  credentials?: string;
  probation_training_completed?: boolean;
  probation_training_passed?: boolean;
  // Add missing fields referenced in other files
  account_type?: string;
  routing_number?: string;
  account_number?: string;
  bank_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  ssn_last_four?: string;
  account_holder_name?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
  refreshUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const setUpAuthStateListener = async () => {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Defer Supabase calls with setTimeout to prevent auth deadlocks
          if (newSession?.user) {
            setTimeout(() => {
              fetchUserProfile(newSession.user.id);
            }, 0);
          } else {
            setUserProfile(null);
          }
        }
      );

      // THEN check for existing session
      const { data } = await supabase.auth.getSession();
      const initialSession = data.session;
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user.id);
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };

    const unsubscribe = setUpAuthStateListener();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      } else if (unsubscribe instanceof Promise) {
        unsubscribe.then(fn => {
          if (fn) fn();
        });
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };
  
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User must be logged in to update profile');
    
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no results found, which is fine for a new profile
        throw fetchError;
      }
      
      const hasCompletedBasicInfo = Boolean(
        (updates.first_name || existingProfile?.first_name) && 
        (updates.last_name || existingProfile?.last_name) && 
        (updates.birth_day || existingProfile?.birth_day) && 
        (updates.gov_id_number || existingProfile?.gov_id_number) && 
        (updates.gov_id_image || existingProfile?.gov_id_image)
      );
                                   
      const hasAnsweredAllQuestions = 
        (updates.has_headset !== undefined || existingProfile?.has_headset !== undefined) && 
        (updates.has_quiet_place !== undefined || existingProfile?.has_quiet_place !== undefined) && 
        (updates.meet_obligation !== undefined || existingProfile?.meet_obligation !== undefined) && 
        (updates.login_discord !== undefined || existingProfile?.login_discord !== undefined) && 
        (updates.check_emails !== undefined || existingProfile?.check_emails !== undefined) && 
        (updates.solve_problems !== undefined || existingProfile?.solve_problems !== undefined) && 
        (updates.complete_training !== undefined || existingProfile?.complete_training !== undefined);

      const isEligible = 
        (updates.has_headset === true || existingProfile?.has_headset === true) && 
        (updates.has_quiet_place === true || existingProfile?.has_quiet_place === true) && 
        (updates.meet_obligation === true || existingProfile?.meet_obligation === true) && 
        (updates.login_discord === true || existingProfile?.login_discord === true) && 
        (updates.check_emails === true || existingProfile?.check_emails === true) && 
        (updates.solve_problems === true || existingProfile?.solve_problems === true) && 
        (updates.complete_training === true || existingProfile?.complete_training === true);
      
      // Set onboarding status for the profile
      const onboarding_completed = hasCompletedBasicInfo && hasAnsweredAllQuestions;
      const eligible_for_training = isEligible;
      
      const profileData = {
        ...updates,
        user_id: user.id,
        onboarding_completed,
        eligible_for_training
      };
      
      let result;
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Update local state
      setUserProfile(result as UserProfile);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  const refreshUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data as UserProfile);
      return data;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  };
  
  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
