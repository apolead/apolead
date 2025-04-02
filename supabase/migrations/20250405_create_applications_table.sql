
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_day DATE,
  gov_id_number TEXT,
  gov_id_image TEXT,
  cpu_type TEXT,
  ram_amount TEXT,
  has_headset BOOLEAN DEFAULT false,
  has_quiet_place BOOLEAN DEFAULT false,
  speed_test TEXT,
  system_settings TEXT,
  available_hours TEXT[],
  available_days TEXT[],
  day_hours JSONB,
  sales_experience BOOLEAN DEFAULT false,
  sales_months TEXT,
  sales_company TEXT,
  sales_product TEXT,
  service_experience BOOLEAN DEFAULT false,
  service_months TEXT,
  service_company TEXT,
  service_product TEXT,
  meet_obligation BOOLEAN DEFAULT false,
  login_discord BOOLEAN DEFAULT false,
  check_emails BOOLEAN DEFAULT false,
  solve_problems BOOLEAN DEFAULT false,
  complete_training BOOLEAN DEFAULT false,
  personal_statement TEXT,
  accepted_terms BOOLEAN DEFAULT false,
  application_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(email);

-- Enable RLS for the applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing applications (only administrators can view them)
CREATE POLICY "Applications are accessible by admins only" ON public.applications
FOR ALL USING (auth.role() = 'service_role');

-- Create a trigger to update the timestamps
CREATE TRIGGER update_applications_timestamps
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
