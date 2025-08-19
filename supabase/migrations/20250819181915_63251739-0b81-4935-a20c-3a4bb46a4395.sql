-- Fix search_path security issue for all custom functions
-- This sets a secure search_path for database functions to prevent injection attacks

-- Update all existing functions to have secure search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';

-- Note: We set search_path to empty string ('') which is the most secure option
-- This means functions must use fully qualified names (schema.table) for all references