
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
});

// Initialize storage bucket if needed
(async function initStorage() {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking for storage buckets:', error);
      return;
    }
    
    // Create user_documents bucket if it doesn't exist
    if (!buckets?.find(bucket => bucket.name === 'user_documents')) {
      console.log('Creating user_documents storage bucket');
      await supabase.storage.createBucket('user_documents', {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      
      // Set policy for the bucket
      await supabase.rpc('create_storage_policy', {
        bucket_name: 'user_documents',
        policy_name: 'Allow public access',
        definition: 'true', 
        operation: 'SELECT'
      }).catch(err => {
        console.error('Error setting bucket policy:', err);
      });
    }
  } catch (err) {
    console.error('Error initializing storage:', err);
  }
})();
