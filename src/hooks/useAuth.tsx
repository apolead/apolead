
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Get user profile that matches the actual user ID
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      } else if (data) {
        console.log('User profile fetched successfully:', data);
        
        // Explicitly ensure boolean fields are properly typed
        const formattedProfile = {
          ...data,
          quiz_passed: data.quiz_passed === null ? null : data.quiz_passed === true,
          training_video_watched: data.training_video_watched === null ? null : data.training_video_watched === true
        };
        
        // Ensure quiz_passed is explicitly handled as boolean
        if (formattedProfile.quiz_passed !== undefined) {
          // Force to boolean if it somehow became a string
          if (formattedProfile.quiz_passed === 'true') formattedProfile.quiz_passed = true;
          if (formattedProfile.quiz_passed === 'false') formattedProfile.quiz_passed = false;
        }
        
        console.log('Formatted profile with boolean conversion:', formattedProfile);
        return formattedProfile;
      } else {
        console.log('No user profile found');
        return null;
      }
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in hook:', event);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in, fetching profile...');
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            
            if (profile) {
              console.log('Setting user profile on SIGNED_IN:', profile);
              setUserProfile(profile);
              localStorage.setItem('userProfile', JSON.stringify(profile));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing profile');
          setUser(null);
          setUserProfile(null);
          localStorage.removeItem('userProfile');
        } else {
          // For other events, just update the user
          setUser(session?.user ?? null);
        }
      }
    );
    
    // THEN check for existing session
    const loadInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // First check for cached profile
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const parsed = JSON.parse(cachedProfile);
              console.log('Using cached profile while fetching from DB:', parsed);
              setUserProfile(parsed);
            } catch (error) {
              console.error('Error parsing cached profile:', error);
              localStorage.removeItem('userProfile');
            }
          }
          
          // Then fetch the latest data from the database
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            console.log('Initial profile load from DB:', profile);
            setUserProfile(profile);
            localStorage.setItem('userProfile', JSON.stringify(profile));
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login successful');
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
      // Clear cached profile on logout
      localStorage.removeItem('userProfile');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Explicitly clear state
      setUser(null);
      setUserProfile(null);
      
      console.log('Logout successful, profile cleared');
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
      
      // Use a function call instead of direct table update to avoid RLS recursion
      const { error } = await supabase.rpc('update_user_profile', { 
        p_user_id: user.id,
        p_updates: data
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
