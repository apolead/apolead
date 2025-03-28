
import { PostgrestError } from '@supabase/supabase-js';

// Helper for safely accessing profile data properties
export function safelyAccessProfile<T extends Record<string, any>>(
  profileResult: T | PostgrestError | null,
  key: keyof T
): any {
  if (!profileResult || 'error' in profileResult || profileResult.error) {
    console.error("Error in profile result:", profileResult);
    return null;
  }
  
  return profileResult[key];
}

// Helper to type-safely check if a profile exists
export function profileExists<T>(
  profileResult: T | PostgrestError | null
): profileResult is T {
  return !!profileResult && !('error' in profileResult);
}

// Utility to convert UUID to string for proper query compatibility
export function idToString(id: string | { toString(): string }): string {
  return id.toString();
}
