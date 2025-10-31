-- Add a hash column (not generated, will be set by trigger)
ALTER TABLE public.conversion_data 
ADD COLUMN row_hash TEXT;

-- Create function to compute hash of row data
CREATE OR REPLACE FUNCTION public.compute_conversion_data_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create trigger to compute hash before insert or update
CREATE TRIGGER compute_conversion_data_hash_trigger
  BEFORE INSERT OR UPDATE ON public.conversion_data
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_conversion_data_hash();

-- Create unique constraint on the hash to prevent duplicate rows
CREATE UNIQUE INDEX idx_conversion_data_unique_row 
ON public.conversion_data(row_hash);

-- Add a helpful comment
COMMENT ON COLUMN public.conversion_data.row_hash IS 'MD5 hash of all data fields to prevent duplicate row imports. Duplicate phone numbers are allowed, but completely identical rows will be rejected.';