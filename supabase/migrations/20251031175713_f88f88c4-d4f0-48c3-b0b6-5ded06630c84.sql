-- Create conversion_data table with all columns from the CSV
CREATE TABLE IF NOT EXISTS public.conversion_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE,
  email_address TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email_address TEXT,
  customer_zip_code TEXT,
  what_do_you_need_done TEXT,
  what_is_wrong_with_roof TEXT,
  how_tall_is_building TEXT,
  how_big_is_roof TEXT,
  how_old_is_current_roof TEXT,
  what_kind_of_roofing TEXT,
  is_work_covered_by_insurance TEXT,
  is_home_or_business TEXT,
  how_many_contractors_allowed TEXT,
  anything_else_contractor_needs TEXT,
  actual_submits INTEGER,
  notes TEXT,
  white_glove TEXT,
  revenue TEXT,
  refunds TEXT,
  phone_validation TEXT,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_conversion_data_updated_at
  BEFORE UPDATE ON public.conversion_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.conversion_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for supervisors
CREATE POLICY "Supervisors can view conversion data"
  ON public.conversion_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.credentials = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can insert conversion data"
  ON public.conversion_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.credentials = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can update conversion data"
  ON public.conversion_data
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.credentials = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can delete conversion data"
  ON public.conversion_data
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.credentials = 'supervisor'
    )
  );

-- Create index on timestamp for better query performance
CREATE INDEX idx_conversion_data_timestamp ON public.conversion_data(timestamp);
CREATE INDEX idx_conversion_data_customer_phone ON public.conversion_data(customer_phone);