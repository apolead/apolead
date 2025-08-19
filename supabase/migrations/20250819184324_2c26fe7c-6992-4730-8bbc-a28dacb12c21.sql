-- Fix critical RLS security issues by enabling Row Level Security on public tables
-- This prevents unauthorized access to sensitive data

-- Enable RLS on tables that currently have it disabled
ALTER TABLE public.approved_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_leads ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for lead management tables (supervisor access only)
-- These tables contain sensitive customer data and should only be accessible by supervisors

-- Approved leads policies
CREATE POLICY "Supervisors can manage approved leads" ON public.approved_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

-- Call logs policies  
CREATE POLICY "Supervisors can manage call logs" ON public.call_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

-- Duplicate leads policies
CREATE POLICY "Supervisors can manage duplicate leads" ON public.duplicate_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

-- Live leads policies
CREATE POLICY "Supervisors can manage live leads" ON public.live_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

-- Rejected leads policies
CREATE POLICY "Supervisors can manage rejected leads" ON public.rejected_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );