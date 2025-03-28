
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
 * Generic constraint to ensure we're only checking objects
 */
export function profileExists<T extends Record<string, any>>(
  data: T | null | { error: PostgrestError }
): data is T {
  if (data === null) {
    console.debug("Profile check: Profile is null");
    return false;
  }
  
  if ('error' in data) {
    console.error("Profile check error:", data.error);
    return false;
  }
  
  console.debug("Profile exists:", data);
  return true;
}

/**
 * Safely accesses a property in a profile
 * Generic constraint ensures we're only accessing properties that exist on T
 */
export function safelyAccessProfile<T extends Record<string, any>, K extends keyof T>(
  profile: T | null | { error: PostgrestError },
  key: K
): T[K] | undefined {
  if (!profileExists(profile)) {
    console.debug(`Cannot access profile property ${String(key)}`, profile);
    return undefined;
  }
  
  const value = profile[key];
  console.debug(`Accessing profile property ${String(key)}:`, value);
  return value;
}

/**
 * Checks if user is already authenticated
 * Returns true if session exists and false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await import('@/integrations/supabase/client').then(
      ({ supabase }) => supabase.auth.getSession()
    );
    console.debug("isAuthenticated check:", !!session, session?.user?.email);
    return !!session;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

/**
 * Force a sign out to clear any potentially corrupt auth state
 */
export async function forceSignOut(): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    console.debug("Force sign out completed");
  } catch (error) {
    console.error("Error during force sign out:", error);
  }
}
