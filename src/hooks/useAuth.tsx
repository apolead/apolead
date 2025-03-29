
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  first_name?: string;
  last_name?: string;
  quiz_passed?: boolean;
  quiz_score?: number;
  training_video_watched?: boolean;
  appointment_scheduled?: boolean;
  appointment_date?: string;
  application_status?: string;
  role?: string;
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile function that properly handles boolean values
  const fetchUserProfile = async (userId: string) => {
    console.log("Fetching profile for userId:", userId);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        console.log("Fetched profile data:", data);
        
        // Ensure boolean fields are actually booleans
        if (data.quiz_passed !== undefined) {
          // Convert "true"/"false" strings to actual booleans if needed
          if (typeof data.quiz_passed === 'string') {
            data.quiz_passed = data.quiz_passed === 'true';
          }
        }
        
        if (data.training_video_watched !== undefined) {
          if (typeof data.training_video_watched === 'string') {
            data.training_video_watched = data.training_video_watched === 'true';
          }
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Exception fetching profile:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state listener first
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed in hook:", event);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log("User signed in:", session.user);
            setUser(session.user);
            
            // Fetch user profile after sign in
            const profile = await fetchUserProfile(session.user.id);
            if (profile) {
              console.log("Setting profile after sign in:", profile);
              setUserProfile(profile);
              // Cache the profile
              localStorage.setItem('userProfile', JSON.stringify(profile));
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            setUser(null);
            setUserProfile(null);
            localStorage.removeItem('userProfile');
          }
        });
        
        // Then check for existing session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData.session ? "Has session" : "No session");
        
        if (sessionData.session?.user) {
          setUser(sessionData.session.user);
          
          // Check cached profile first for immediate UI response
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const parsed = JSON.parse(cachedProfile);
              console.log("Using cached profile:", parsed);
              setUserProfile(parsed);
            } catch (e) {
              console.error("Error parsing cached profile:", e);
            }
          }
          
          // Then fetch fresh profile data
          const freshProfile = await fetchUserProfile(sessionData.session.user.id);
          if (freshProfile) {
            console.log("Updated profile from DB:", freshProfile);
            setUserProfile(freshProfile);
            localStorage.setItem('userProfile', JSON.stringify(freshProfile));
          }
        }
        
        setIsLoading(false);
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error };
      }
      
      // Auth state change listener will handle updating the user and profile
      return { error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      localStorage.removeItem('userProfile');
      await supabase.auth.signOut();
      // Auth state change listener will handle clearing the user and profile
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update user profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        return { error };
      }
      
      // Update local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...updates };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
      
      return { error: null };
    } catch (error) {
      console.error("Profile update error:", error);
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    isLoading,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
