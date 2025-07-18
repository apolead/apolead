import { useState, useEffect, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

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
  quiz_score?: number;
  agent_standing?: string;
  created_at?: string;
  updated_at?: string;
  credentials?: string;
  probation_training_completed?: boolean;
  probation_training_passed?: boolean;
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
  telemarketing_policy_acknowledged?: boolean;
  do_not_call_policy_acknowledged?: boolean;
  policy_acknowledgment_name?: string;
  policy_acknowledged_at?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isRecoveryMode: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
  refreshUserProfile: () => Promise<any>;
  acknowledgePolicies: (name: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  setRecoveryMode: (mode: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  const isRefreshingProfile = useRef<boolean>(false);
  const lastProfileRefreshTime = useRef<number>(0);
  const REFRESH_COOLDOWN = 2000;
  const refreshQueue = useRef<(() => void)[]>([]);
  const recoveryModeDetected = useRef<boolean>(false);
  
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (isRefreshingProfile.current) {
      return new Promise((resolve) => {
        refreshQueue.current.push(() => {
          resolve(userProfile);
        });
      });
    }
    
    const now = Date.now();
    if (now - lastProfileRefreshTime.current < REFRESH_COOLDOWN) {
      console.log("Profile refresh throttled, returning current profile");
      return userProfile;
    }
    
    isRefreshingProfile.current = true;
    lastProfileRefreshTime.current = now;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      } 
      
      if (data) {
        const typedData = data as unknown as UserProfile;
        setUserProfile(typedData);
        return typedData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    } finally {
      isRefreshingProfile.current = false;
      
      if (refreshQueue.current.length > 0) {
        const nextRefresh = refreshQueue.current.shift();
        if (nextRefresh) nextRefresh();
      }
    }
  }, [userProfile]);

  const setRecoveryMode = useCallback((mode: boolean) => {
    console.log('Setting recovery mode:', mode);
    setIsRecoveryMode(mode);
    recoveryModeDetected.current = mode;
  }, []);

  const checkForPasswordResetFlow = useCallback(() => {
    console.log('=== AUTH PROVIDER RECOVERY CHECK ===');
    
    // Check global recovery flag first
    if (window.__RECOVERY_MODE_ACTIVE) {
      console.log('Global recovery mode active');
      return true;
    }
    
    // Check session storage for recovery data
    const storedParams = sessionStorage.getItem('passwordResetParams');
    const recoveryMode = sessionStorage.getItem('recoveryMode');
    const recoveryTimestamp = sessionStorage.getItem('recoveryTimestamp');
    
    if (recoveryMode === 'true' || storedParams) {
      console.log('Recovery mode detected from storage');
      
      // Check if recovery data is still valid (30 minutes)
      if (recoveryTimestamp) {
        const timestamp = parseInt(recoveryTimestamp);
        const isValid = Date.now() - timestamp < 30 * 60 * 1000;
        if (isValid) {
          return true;
        } else {
          console.log('Recovery data expired, clearing');
          sessionStorage.removeItem('passwordResetParams');
          sessionStorage.removeItem('passwordResetUrl');
          sessionStorage.removeItem('recoveryMode');
          sessionStorage.removeItem('recoveryTimestamp');
        }
      }
    }
    
    // Check URL parameters as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const code = urlParams.get('code');
    const accessToken = urlParams.get('access_token');
    
    const isPasswordReset = (
      type === 'recovery' || 
      (code && type === 'recovery') || 
      (accessToken && type === 'recovery') ||
      window.location.pathname === '/reset-password'
    );
    
    console.log('URL-based recovery check:', { 
      type, 
      hasCode: !!code, 
      hasAccessToken: !!accessToken, 
      isPasswordReset, 
      pathname: window.location.pathname
    });
    
    return isPasswordReset;
  }, []);

  useEffect(() => {
    console.log('=== AUTH PROVIDER INITIALIZATION ===');
    
    // IMMEDIATE recovery mode detection before any auth setup
    const isPasswordResetFlow = checkForPasswordResetFlow();
    
    if (isPasswordResetFlow) {
      console.log('🔒 AUTH PROVIDER: Recovery flow detected, ISOLATING auth processing');
      setIsRecoveryMode(true);
      recoveryModeDetected.current = true;
      window.__RECOVERY_MODE_ACTIVE = true;
    }

    const setUpAuthStateListener = async () => {
      console.log('Setting up auth state listener, recovery mode:', recoveryModeDetected.current);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('🔄 Auth state change:', event, !!newSession, 'recovery mode:', recoveryModeDetected.current);
          
          // CRITICAL: Completely isolate recovery sessions
          if (recoveryModeDetected.current || window.__RECOVERY_MODE_ACTIVE) {
            console.log('🚫 AUTH STATE CHANGE BLOCKED - Recovery mode active');
            
            // Only set session/user for recovery, don't trigger normal auth flow
            if (event === 'SIGNED_IN' && newSession?.user) {
              console.log('Setting recovery session data only');
              setSession(newSession);
              setUser(newSession.user);
              return; // CRITICAL: Exit here to prevent normal processing
            } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
              console.log('Refreshing recovery session');
              setSession(newSession);
              setUser(newSession.user);
              return; // CRITICAL: Exit here
            }
            
            // Ignore sign out during recovery unless explicitly requested
            if (event === 'SIGNED_OUT' && window.location.pathname === '/reset-password') {
              console.log('Ignoring sign out during password reset flow');
              return;
            }
            
            console.log('Recovery mode - ignoring auth state change:', event);
            return;
          }
          
          // Normal auth flow for non-recovery sessions
          console.log('Processing normal auth state change');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user && !recoveryModeDetected.current) {
            console.log('Fetching user profile for normal auth');
            setTimeout(() => {
              fetchUserProfile(newSession.user.id);
            }, 0);
          } else if (!newSession) {
            setUserProfile(null);
            // Only clear recovery mode if we're not on reset password page
            if (window.location.pathname !== '/reset-password') {
              console.log('Clearing recovery mode after sign out');
              setIsRecoveryMode(false);
              recoveryModeDetected.current = false;
              window.__RECOVERY_MODE_ACTIVE = false;
              sessionStorage.removeItem('passwordResetUrl');
              sessionStorage.removeItem('passwordResetParams');
              sessionStorage.removeItem('recoveryMode');
              sessionStorage.removeItem('recoveryTimestamp');
            }
          }
        }
      );

      // Handle initial session
      const { data } = await supabase.auth.getSession();
      const initialSession = data.session;
      
      if (isPasswordResetFlow || recoveryModeDetected.current) {
        console.log('🔒 AUTH PROVIDER: Initial session during recovery - maintaining isolation');
        setIsRecoveryMode(true);
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } else {
        console.log('AUTH PROVIDER: Processing initial session normally');
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };

    const unsubscribePromise = setUpAuthStateListener();

    return () => {
      unsubscribePromise.then(unsubscribeFn => {
        if (unsubscribeFn) unsubscribeFn();
      }).catch(error => {
        console.error('Error when unsubscribing from auth state listener:', error);
      });
    };
  }, [checkForPasswordResetFlow, fetchUserProfile]);

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = 'https://www.apolead.com/reset-password';
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
  };
  
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User must be logged in to update profile');
    
    try {
      console.log("Updating profile with:", updates);
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
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
      
      const onboarding_completed = hasCompletedBasicInfo && hasAnsweredAllQuestions;
      const eligible_for_training = isEligible;
      
      const profileData = {
        ...updates,
        user_id: user.id,
        onboarding_completed,
        eligible_for_training
      };
      
      let result;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          if (existingProfile) {
            const { data, error } = await supabase
              .from('user_profiles')
              .update(profileData)
              .eq('user_id', user.id)
              .select()
              .single();
              
            if (error) throw error;
            result = data;
            break;
          } else {
            const newProfileData = {
              ...profileData,
              email: user.email || '', 
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || ''
            };
            
            const { data, error } = await supabase
              .from('user_profiles')
              .insert(newProfileData)
              .select()
              .single();
              
            if (error) throw error;
            result = data;
            break;
          }
        } catch (error: any) {
          console.error(`Error updating profile (attempt ${attempts + 1}/${maxAttempts}):`, error);
          attempts++;
          
          if (attempts >= maxAttempts) {
            throw error;
          }
          
          const delay = Math.min(1000 * Math.pow(2, attempts), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      setUserProfile(result as unknown as UserProfile);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "There was an issue saving your information. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const acknowledgePolicies = async (name: string) => {
    if (!user) throw new Error('User must be logged in to acknowledge policies');
    
    try {
      const updates = {
        telemarketing_policy_acknowledged: true,
        do_not_call_policy_acknowledged: true,
        policy_acknowledgment_name: name,
        policy_acknowledged_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setUserProfile(prev => prev ? {...prev, ...updates} : null);
      return data;
    } catch (error) {
      console.error('Error acknowledging policies:', error);
      throw error;
    }
  };
  
  const refreshUserProfile = useCallback(async () => {
    if (!user) return null;
    
    try {
      console.log("Refreshing user profile for user:", user.id);
      return await fetchUserProfile(user.id);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  }, [user, fetchUserProfile]);
  
  const value = {
    user,
    session,
    userProfile,
    loading,
    isRecoveryMode,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUserProfile,
    acknowledgePolicies,
    resetPassword,
    updatePassword,
    setRecoveryMode
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
