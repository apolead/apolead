-- Rename columns to match CSV headers exactly
ALTER TABLE public.calls_with_did 
  RENAME COLUMN cid_name TO "CID_name";

ALTER TABLE public.calls_with_did 
  RENAME COLUMN cid_num TO "CID_num";

ALTER TABLE public.calls_with_did 
  RENAME COLUMN did_num TO "DID_num";

ALTER TABLE public.calls_with_did 
  RENAME COLUMN last_status TO "lastStatus";

-- Update the hash computation function to use new column names
CREATE OR REPLACE FUNCTION public.compute_calls_with_did_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.row_hash := md5(
    COALESCE(NEW."CID_name", '') || '|' ||
    COALESCE(NEW."CID_num", '') || '|' ||
    COALESCE(NEW."DID_num", '') || '|' ||
    COALESCE(NEW.start::text, '') || '|' ||
    COALESCE(NEW.duration::text, '') || '|' ||
    COALESCE(NEW."lastStatus", '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Update the merge function to use new column names
CREATE OR REPLACE FUNCTION public.merge_call_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Merge data from did_numbers table (match on number = DID_num)
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
  WHERE number = NEW."DID_num"
  LIMIT 1;
  
  -- Merge data from conversion_data table (match on Customer phone to CID_num)
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
  WHERE "Customer phone - Copy directly from RM" = NEW."CID_num"
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';