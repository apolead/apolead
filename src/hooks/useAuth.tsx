
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
    
    console.group("🧹 SANITIZATION PROCESS");
    console.log("BEFORE sanitization:", profileData);
    
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
    
    // Special detailed logging for quiz_passed
    if ('quiz_passed' in cleanProfile) {
      const rawValue = cleanProfile.quiz_passed;
      console.group("⚠️ quiz_passed Detailed Analysis");
      console.log("ORIGINAL Value:", rawValue);
      console.log("Type:", typeof rawValue);
      console.log("instanceof Boolean:", rawValue instanceof Boolean);
      console.log("toString():", String(rawValue));
      console.log("toJSON():", JSON.stringify(rawValue));
      console.log("== true:", rawValue == true);
      console.log("=== true:", rawValue === true);
      console.log("== false:", rawValue == false);
      console.log("=== false:", rawValue === false);
      console.log("!!", !!rawValue);
      console.groupEnd();
    }
    
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
    
    console.log("AFTER sanitization:", cleanProfile);
    console.groupEnd();
    
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
          sessionStorage.clear();
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
      
      // MODIFIED: Use a direct SELECT query instead of an RPC call to avoid infinite recursion
      const { data: directData, error: directError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      
      if (directError) {
        console.error('Error fetching user profile:', directError);
        // Don't attempt to use the function call as fallback, it's likely causing the infinite recursion
      } else if (directData && directData.length > 0) {
        console.group("🔍 RAW DATABASE RESPONSE");
        console.log("FULL RESPONSE:", directData[0]);
        console.log("quiz_passed (value):", directData[0].quiz_passed);
        console.log("quiz_passed (type):", typeof directData[0].quiz_passed);
        console.log("quiz_passed (JSON.stringify):", JSON.stringify(directData[0].quiz_passed));
        console.log("quiz_passed (Object.prototype.toString):", Object.prototype.toString.call(directData[0].quiz_passed));
        console.groupEnd();
        
        const sanitizedData = sanitizeProfileData(directData[0]);
        console.log('User profile fetched successfully via direct query:', sanitizedData);
        
        // Log specific quiz state values for debugging
        console.log('Quiz state values:', {
          quiz_passed: sanitizedData.quiz_passed,
          training_video_watched: sanitizedData.training_video_watched,
          types: {
            quiz_passed: typeof sanitizedData.quiz_passed,
            training_video_watched: typeof sanitizedData.training_video_watched
          }
        });
        
        console.group("🔄 STATE UPDATE");
        console.log("Previous userProfile:", userProfile);
        console.log("New userProfile:", sanitizedData);
        console.log("quiz_passed value:", sanitizedData.quiz_passed);
        console.log("quiz_passed type:", typeof sanitizedData.quiz_passed);
        console.groupEnd();
        
        setUserProfile(sanitizedData);
        
        // Cache the profile in localStorage as a stringified JSON
        localStorage.setItem('userProfile', JSON.stringify(sanitizedData));
        
        // After localStorage.setItem
        const storedData = localStorage.getItem('userProfile');
        console.group("💾 STORAGE VERIFICATION");
        console.log("Stored in localStorage:", storedData);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          console.log("Parsed from localStorage:", parsed);
          console.log("quiz_passed after parsing:", parsed.quiz_passed);
          console.log("quiz_passed type after parsing:", typeof parsed.quiz_passed);
        }
        console.groupEnd();
      } else {
        console.log('No user profile found');
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
      
      // Clear ALL storage to ensure clean state on next login
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Logout successful - all storage cleared');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      console.log('Updating user profile with:', data);
      
      // MODIFIED: Use direct update instead of RPC call to avoid infinite recursion
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Direct profile update failed:', error);
        throw error;
      }
      
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
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
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
