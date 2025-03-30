
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
      
      // First, get the raw profile data
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (!data) {
        console.log('No user profile found');
        return;
      }

      // Ensure boolean fields are properly converted
      const processedProfile = {
        ...data,
        // Force boolean conversion for critical fields
        quiz_passed: data.quiz_passed === true,
        training_video_watched: data.training_video_watched === true,
      };
      
      console.log('Profile data from DB:', data);
      console.log('Processed profile:', processedProfile);
      console.log('Quiz passed type:', typeof processedProfile.quiz_passed, 'value:', processedProfile.quiz_passed);
      
      // Set the profile in state
      setUserProfile(processedProfile);
      
      // Store in localStorage as stringified JSON
      localStorage.setItem('userProfile', JSON.stringify(processedProfile));
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
    }
  };

  // Setup auth state change listener and initial session check
  useEffect(() => {
    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          localStorage.removeItem('userProfile');
        }
      }
    );
    
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
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

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login successful');
      
      // User profile will be fetched by the auth state change listener
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
      // Clear state first for UI update
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Logout successful');
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
      
      // Update the database
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setUserProfile(prev => {
        const updated = {
          ...prev,
          ...data
        };
        console.log('Updated user profile in state:', updated);
        
        // Update localStorage cache
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
