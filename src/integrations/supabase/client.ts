
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
      return fetch(...args)
        .then(response => {
          // Log info about the response for debugging
          if (!response.ok) {
            console.error(`Supabase fetch error: ${response.status} ${response.statusText}`, 
              `URL: ${typeof args[0] === 'string' ? args[0] : 'complex URL'}`,
              `Method: ${args[1]?.method || 'GET'}`
            );
          }
          return response;
        })
        .catch(err => {
          console.error('Supabase fetch error:', err);
          throw err;
        });
    }
  },
  // Add better retry logic for transient errors
  db: {
    schema: 'public',
    // Improved query handling with standard backoff
    retryAlgorithm: {
      maxRetryCount: 3,
      initialBackoff: 200,  // Start with short retry delay
      maxBackoff: 2000,     // Don't wait longer than 2 seconds
      retry: (count, error) => {
        // Only retry on network errors and ambiguous column errors
        if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES') || 
            error.message?.includes('ambiguous') ||
            error.code === 'PGRST109' || 
            error.code === '42702') {
          console.log(`Retrying query due to error (attempt ${count}):`, error.message);
          return true;
        }
        return false;
      }
    }
  }
});

// Add additional debugging information
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
});

// Set up a global error event listener instead of using the non-existent handleBrowserError property
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    // Check if the error is related to Supabase
    (typeof event.reason.message === 'string' && event.reason.message.includes('supabase')) ||
    (event.reason.name && event.reason.name.includes('Supabase'))
  )) {
    console.error('Supabase unhandled rejection:', event.reason);
  }
});
