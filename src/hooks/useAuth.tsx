
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
    
    // Define all possible boolean fields in the user profile
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
      'accepted_terms'
    ];
    
    // Convert anything that should be boolean to actual boolean
    booleanFields.forEach(field => {
      if (field in cleanProfile) {
        const value = cleanProfile[field];
        
        // Extra debugging for the quiz_passed field
        if (field === 'quiz_passed') {
          console.log(`Raw quiz_passed value:`, value, typeof value);
        }
        
        if (value === null || value === undefined) {
          cleanProfile[field] = null;
        } else if (typeof value === 'boolean') {
          // Force to true/false even if already boolean
          cleanProfile[field] = value === true;
        } else if (typeof value === 'string') {
          // Handle all possible PostgreSQL string representations
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
        
        // Extra debugging for the quiz_passed field
        if (field === 'quiz_passed') {
          console.log(`Sanitized quiz_passed value:`, cleanProfile[field], typeof cleanProfile[field]);
        }
      }
    });
    
    console.log('Sanitized profile data:', {
      quiz_passed: cleanProfile.quiz_passed,
      training_video_watched: cleanProfile.training_video_watched,
      types: {
        quiz_passed: typeof cleanProfile.quiz_passed,
        training_video_watched: typeof cleanProfile.training_video_watched
      }
    });
    
    return cleanProfile;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in hook:', event);
        setUser(session?.user ?? null);
        
        // If signing in, fetch profile immediately after state update
        if (session?.user) {
          // Use immediate fetch for the UI update
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
          
          // Defer DB fetch to prevent blocking
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Clear all user data on sign out
          setUserProfile(null);
          localStorage.removeItem('userProfile');
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // First check for cached profile
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
          
          // Always fetch the latest data from the database
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
      
      // Use type assertion to bypass TypeScript error for the RPC function name
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
        
        // Log specific quiz state values for debugging
        console.log('Quiz state values:', {
          quiz_passed: sanitizedData.quiz_passed,
          training_video_watched: sanitizedData.training_video_watched,
          types: {
            quiz_passed: typeof sanitizedData.quiz_passed,
            training_video_watched: typeof sanitizedData.training_video_watched
          }
        });
        
        // Check for bank information
        if (sanitizedData.routing_number) {
          console.log('Bank information found in profile:', {
            routing_number_length: sanitizedData.routing_number.length,
            account_number_length: sanitizedData.account_number ? sanitizedData.account_number.length : 0
          });
        }
        
        setUserProfile(sanitizedData);
        
        // Cache the profile in localStorage as a stringified JSON
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
      
      // Fetch profile immediately after successful login
      if (data.user) {
        // Use setTimeout to prevent blocking
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
      // Clear state first to update UI immediately
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      localStorage.removeItem('tempCredentials');
      
      // Check if we have an active session before trying to sign out
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we have a session, sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Logout from Supabase successful');
      } else {
        // If we don't have a session, just log and consider it a success
        console.log('No active session found, client-side logout completed');
      }
      
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully"
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if there's an error with Supabase, still clear local state
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
      
      // Use type assertion to bypass TypeScript error for the RPC function name
      const { error } = await (supabase.rpc as any)('update_user_profile_direct', {
        input_user_id: user.id,
        input_updates: data
      });
      
      if (error) throw error;
      
      // Update local state
      setUserProfile(prev => {
        const updated = {
          ...prev,
          ...data
        };
        console.log('Updated user profile in state:', updated);
        
        // Update localStorage cache with the new profile data
        localStorage.setItem('userProfile', JSON.stringify(updated));
        
        return updated;
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      // Fetch the updated profile to ensure we have the latest data
      fetchUserProfile(user.id);
      
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
