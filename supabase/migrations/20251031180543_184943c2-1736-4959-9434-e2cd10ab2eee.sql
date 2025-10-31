-- Fix the function to have a secure search_path
CREATE OR REPLACE FUNCTION public.compute_conversion_data_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.row_hash := md5(
    COALESCE(NEW."Timestamp"::text, '') || '|' ||
    COALESCE(NEW."Email Address", '') || '|' ||
    COALESCE(NEW."Customer Name", '') || '|' ||
    COALESCE(NEW."Customer phone - Copy directly from RM", '') || '|' ||
    COALESCE(NEW."Customer email address", '') || '|' ||
    COALESCE(NEW."Customer Zip Code", '') || '|' ||
    COALESCE(NEW."What do you need done?", '') || '|' ||
    COALESCE(NEW."What is wrong with your roof? (choose all that apply)", '') || '|' ||
    COALESCE(NEW."How tall is the building?", '') || '|' ||
    COALESCE(NEW."How big is the roof?", '') || '|' ||
    COALESCE(NEW."How old is the current roof?", '') || '|' ||
    COALESCE(NEW."What kind of roofing do you want?", '') || '|' ||
    COALESCE(NEW."Is this work covered by insurance?", '') || '|' ||
    COALESCE(NEW."Is this a home or a business?", '') || '|' ||
    COALESCE(NEW."How many contractors are we allowed to contact?", '') || '|' ||
    COALESCE(NEW."Anything else the contractor needs to know?", '') || '|' ||
    COALESCE(NEW."Actual Submits"::text, '') || '|' ||
    COALESCE(NEW."Notes", '') || '|' ||
    COALESCE(NEW."White Glove? ", '') || '|' ||
    COALESCE(NEW."Revenue", '') || '|' ||
    COALESCE(NEW."Refunds", '') || '|' ||
    COALESCE(NEW."Phone Validation", '') || '|' ||
    COALESCE(NEW."Supplier", '')
  );
  RETURN NEW;
END;
$$;