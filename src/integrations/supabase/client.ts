
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
    flowType: 'pkce', // PKCE flow for more secure authentication
    debug: import.meta.env.DEV // Only enable debug in development
  }
});

// Helper function to force sign out (clears all session data)
export const forceSignOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
    // Clear any potentially remaining tokens
    localStorage.removeItem('sb-didvmdhyxltjjnxlbmxy-auth-token');
    window.location.href = '/login'; // Redirect to login page
  } catch (error) {
    console.error('Error during force sign out:', error);
  }
};
