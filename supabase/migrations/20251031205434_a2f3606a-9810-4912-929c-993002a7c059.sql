
-- Drop and recreate the merge_call_data function with trimmed phone number matching
DROP FUNCTION IF EXISTS public.merge_call_data() CASCADE;

CREATE OR REPLACE FUNCTION public.merge_call_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- TRIM whitespace from both phone numbers for matching
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
  WHERE TRIM("Customer phone - Copy directly from RM") = TRIM(NEW."CID_num")
  LIMIT 1;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER merge_call_data_trigger
  BEFORE INSERT ON public.calls_with_did
  FOR EACH ROW
  EXECUTE FUNCTION public.merge_call_data();

-- Update existing rows to merge conversion data that was previously missed
UPDATE public.calls_with_did
SET 
  conversion_timestamp = cd."Timestamp",
  conversion_email_address = cd."Email Address",
  conversion_customer_name = cd."Customer Name",
  conversion_customer_phone = cd."Customer phone - Copy directly from RM",
  conversion_customer_email_address = cd."Customer email address",
  conversion_customer_zip_code = cd."Customer Zip Code",
  conversion_what_need_done = cd."What do you need done?",
  conversion_roof_problem = cd."What is wrong with your roof? (choose all that apply)",
  conversion_building_height = cd."How tall is the building?",
  conversion_roof_size = cd."How big is the roof?",
  conversion_roof_age = cd."How old is the current roof?",
  conversion_roofing_type = cd."What kind of roofing do you want?",
  conversion_insurance_covered = cd."Is this work covered by insurance?",
  conversion_home_or_business = cd."Is this a home or a business?",
  conversion_contractors_allowed = cd."How many contractors are we allowed to contact?",
  conversion_additional_notes = cd."Anything else the contractor needs to know?",
  conversion_actual_submits = cd."Actual Submits",
  conversion_notes = cd."Notes",
  conversion_white_glove = cd."White Glove? ",
  conversion_revenue = cd."Revenue",
  conversion_refunds = cd."Refunds",
  conversion_phone_validation = cd."Phone Validation",
  conversion_supplier = cd."Supplier"
FROM public.conversion_data cd
WHERE TRIM(cd."Customer phone - Copy directly from RM") = TRIM(calls_with_did."CID_num")
  AND calls_with_did.conversion_revenue IS NULL;
