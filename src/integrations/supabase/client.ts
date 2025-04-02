
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://didvmdhyxltjjnxlbmxy.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZHZtZGh5eGx0ampueGxibXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Njg4NzMsImV4cCI6MjA1ODQ0NDg3M30.jr9FcI2qaO0bVWgKftxNIZLcqtVt-x_dr9e_PEfyoq4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  // Add global error handling and logging
  global: {
    fetch: (...args: [RequestInfo | URL, RequestInit?]) => {
      return fetch(...args).catch(err => {
        console.error('Supabase fetch error:', err);
        throw err;
      });
    }
  }
});

// Add additional debugging information
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  // Create user profile if missing
  if (event === 'SIGNED_IN' && session?.user) {
    console.log('User signed in, checking for profile...');
    checkAndCreateUserProfile(session.user.id, session.user.email);
  }
});

// Helper function to check if a user profile exists and create one if it doesn't
async function checkAndCreateUserProfile(userId: string, email: string | undefined) {
  try {
    // First check if the profile already exists
    const { data: existingProfile, error: profileError } = await (supabase.rpc as any)('get_user_profile_direct', {
      input_user_id: userId
    });
    
    if (profileError) {
      console.error('Error checking for existing profile:', profileError);
      return;
    }
    
    if (existingProfile && Array.isArray(existingProfile) && existingProfile.length > 0) {
      console.log('User profile already exists');
      return;
    }
    
    // No profile exists, create one
    console.log('No profile exists, creating one...');
    
    // Extract first name from email
    let firstName = email ? email.split('@')[0] : 'User';
    // Capitalize first letter
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    
    // Create basic profile
    const { error } = await (supabase.rpc as any)('update_user_profile_direct', {
      input_user_id: userId,
      input_updates: {
        first_name: firstName,
        last_name: '',
        email: email,
        application_status: 'pending',
        onboarding_completed: false,
        eligible_for_training: false,
        credentials: 'agent'
      }
    });
    
    if (error) {
      console.error('Error creating user profile:', error);
      return;
    }
    
    console.log('Successfully created user profile');
    
  } catch (error) {
    console.error('Exception in checkAndCreateUserProfile:', error);
  }
}
