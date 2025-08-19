-- Fix search_path security issue for all existing custom functions
-- This sets a secure search_path for database functions to prevent injection attacks

-- Update all existing functions to have secure search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_timestamp() SET search_path = '';
ALTER FUNCTION public.check_user_eligibility() SET search_path = '';
ALTER FUNCTION public.copy_lead_data_to_approved() SET search_path = '';
ALTER FUNCTION public.copy_lead_data_to_live() SET search_path = '';
ALTER FUNCTION public.copy_values_to_approved() SET search_path = '';
ALTER FUNCTION public.copy_values_to_live() SET search_path = '';
ALTER FUNCTION public.copy_live_leads() SET search_path = '';
ALTER FUNCTION public.update_live_leads() SET search_path = '';
ALTER FUNCTION public.extract_lead_id_on_insert() SET search_path = '';
ALTER FUNCTION public.process_new_lead() SET search_path = '';
ALTER FUNCTION public.is_profile_owner(uuid) SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.update_onboarding_status(uuid, integer) SET search_path = '';
ALTER FUNCTION public.get_user_role(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_profile(uuid) SET search_path = '';
ALTER FUNCTION public.get_application_status(uuid) SET search_path = '';
ALTER FUNCTION public.is_user_on_probation(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_credentials(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_user_profile(uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.update_billing_information(uuid, text, text, text, text, text, text, text, text, text, text, text) SET search_path = '';
ALTER FUNCTION public.is_supervisor(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_profile_direct(uuid) SET search_path = '';
ALTER FUNCTION public.update_user_profile_direct(uuid, jsonb) SET search_path = '';

-- Note: We set search_path to empty string ('') which is the most secure option
-- This prevents SQL injection attacks and ensures functions use fully qualified names