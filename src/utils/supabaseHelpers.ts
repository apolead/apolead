
/**
 * Helper functions for working with Supabase data
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Converts a UUID to a string
 */
export function idToString(id: string | undefined): string {
  return id || '';
}

/**
 * Safely checks if a profile exists
 */
export function profileExists<T extends Record<string, any>>(data: T | null | { error: PostgrestError }): data is T {
  return data !== null && !('error' in data);
}

/**
 * Safely accesses a property in a profile
 */
export function safelyAccessProfile<T extends Record<string, any>, K extends keyof T>(
  profile: T | null | { error: PostgrestError },
  key: K
): T[K] | undefined {
  if (!profileExists(profile)) {
    console.error("Cannot access profile", profile);
    return undefined;
  }
  
  return profile[key];
}
