-- Create calls_with_did table with merged data from did_numbers and conversion_data
CREATE TABLE public.calls_with_did (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Original CSV columns
  cid_name TEXT,
  cid_num TEXT,
  did_num TEXT,
  start TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  last_status TEXT,
  
  -- Merged columns from did_numbers table
  did_vertical TEXT,
  did_system_config_notes TEXT,
  did_lead_price TEXT,
  did_campaign_status TEXT,
  did_seller TEXT,
  
  -- Merged columns from conversion_data table
  conversion_timestamp TIMESTAMP WITH TIME ZONE,
  conversion_email_address TEXT,
  conversion_customer_name TEXT,
  conversion_customer_phone TEXT,
  conversion_customer_email_address TEXT,
  conversion_customer_zip_code TEXT,
  conversion_what_need_done TEXT,
  conversion_roof_problem TEXT,
  conversion_building_height TEXT,
  conversion_roof_size TEXT,
  conversion_roof_age TEXT,
  conversion_roofing_type TEXT,
  conversion_insurance_covered TEXT,
  conversion_home_or_business TEXT,
  conversion_contractors_allowed TEXT,
  conversion_additional_notes TEXT,
  conversion_actual_submits INTEGER,
  conversion_notes TEXT,
  conversion_white_glove TEXT,
  conversion_revenue TEXT,
  conversion_refunds TEXT,
  conversion_phone_validation TEXT,
  conversion_supplier TEXT,
  
  -- Metadata
  row_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calls_with_did ENABLE ROW LEVEL SECURITY;

-- Create unique index on row_hash to prevent duplicates
CREATE UNIQUE INDEX idx_calls_with_did_unique_row ON public.calls_with_did(row_hash);

-- Function to compute hash for duplicate detection (only on original CSV columns)
CREATE OR REPLACE FUNCTION public.compute_calls_with_did_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.row_hash := md5(
    COALESCE(NEW.cid_name, '') || '|' ||
    COALESCE(NEW.cid_num, '') || '|' ||
    COALESCE(NEW.did_num, '') || '|' ||
    COALESCE(NEW.start::text, '') || '|' ||
    COALESCE(NEW.duration::text, '') || '|' ||
    COALESCE(NEW.last_status, '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to compute hash before insert/update
CREATE TRIGGER compute_calls_with_did_hash_trigger
  BEFORE INSERT OR UPDATE ON public.calls_with_did
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_calls_with_did_hash();

-- Function to merge data from did_numbers and conversion_data
CREATE OR REPLACE FUNCTION public.merge_call_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Merge data from did_numbers table (match on number = did_num)
  SELECT 
    vertical,
    system_config_notes,
    lead_price,
    campaign_status,
    seller
  INTO 
    NEW.did_vertical,
    NEW.did_system_config_notes,
    NEW.did_lead_price,
    NEW.did_campaign_status,
    NEW.did_seller
  FROM public.did_numbers
  WHERE number = NEW.did_num
  LIMIT 1;
  
  -- Merge data from conversion_data table (match on Customer phone to cid_num)
  SELECT 
    "Timestamp",
    "Email Address",
    "Customer Name",
    "Customer phone - Copy directly from RM",
    "Customer email address",
    "Customer Zip Code",
    "What do you need done?",
    "What is wrong with your roof? (choose all that apply)",
    "How tall is the building?",
    "How big is the roof?",
    "How old is the current roof?",
    "What kind of roofing do you want?",
    "Is this work covered by insurance?",
    "Is this a home or a business?",
    "How many contractors are we allowed to contact?",
    "Anything else the contractor needs to know?",
    "Actual Submits",
    "Notes",
    "White Glove? ",
    "Revenue",
    "Refunds",
    "Phone Validation",
    "Supplier"
  INTO 
    NEW.conversion_timestamp,
    NEW.conversion_email_address,
    NEW.conversion_customer_name,
    NEW.conversion_customer_phone,
    NEW.conversion_customer_email_address,
    NEW.conversion_customer_zip_code,
    NEW.conversion_what_need_done,
    NEW.conversion_roof_problem,
    NEW.conversion_building_height,
    NEW.conversion_roof_size,
    NEW.conversion_roof_age,
    NEW.conversion_roofing_type,
    NEW.conversion_insurance_covered,
    NEW.conversion_home_or_business,
    NEW.conversion_contractors_allowed,
    NEW.conversion_additional_notes,
    NEW.conversion_actual_submits,
    NEW.conversion_notes,
    NEW.conversion_white_glove,
    NEW.conversion_revenue,
    NEW.conversion_refunds,
    NEW.conversion_phone_validation,
    NEW.conversion_supplier
  FROM public.conversion_data
  WHERE "Customer phone - Copy directly from RM" = NEW.cid_num
  LIMIT 1;
  
  RETURN NEW;
END;
$$;

-- Trigger to merge data before insert
CREATE TRIGGER merge_call_data_trigger
  BEFORE INSERT ON public.calls_with_did
  FOR EACH ROW
  EXECUTE FUNCTION public.merge_call_data();

-- RLS Policies for supervisors
CREATE POLICY "Supervisors can view calls with DID"
  ON public.calls_with_did
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can insert calls with DID"
  ON public.calls_with_did
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can update calls with DID"
  ON public.calls_with_did
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can delete calls with DID"
  ON public.calls_with_did
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_id = auth.uid() AND credentials = 'supervisor'
    )
  );

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_calls_with_did_updated_at
  BEFORE UPDATE ON public.calls_with_did
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();