-- Drop the existing table
DROP TABLE IF EXISTS public.conversion_data CASCADE;

-- Create conversion_data table with exact CSV column names
CREATE TABLE public.conversion_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Timestamp" TIMESTAMP WITH TIME ZONE,
  "Email Address" TEXT,
  "Customer Name" TEXT,
  "Customer phone - Copy directly from RM" TEXT,
  "Customer email address" TEXT,
  "Customer Zip Code" TEXT,
  "What do you need done?" TEXT,
  "What is wrong with your roof? (choose all that apply)" TEXT,
  "How tall is the building?" TEXT,
  "How big is the roof?" TEXT,
  "How old is the current roof?" TEXT,
  "What kind of roofing do you want?" TEXT,
  "Is this work covered by insurance?" TEXT,
  "Is this a home or a business?" TEXT,
  "How many contractors are we allowed to contact?" TEXT,
  "Anything else the contractor needs to know?" TEXT,
  "Actual Submits" INTEGER,
  "Notes" TEXT,
  "White Glove? " TEXT,
  "Revenue" TEXT,
  "Refunds" TEXT,
  "Phone Validation" TEXT,
  "Supplier" TEXT,
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

-- Create indexes for better query performance
CREATE INDEX idx_conversion_data_timestamp ON public.conversion_data("Timestamp");
CREATE INDEX idx_conversion_data_customer_phone ON public.conversion_data("Customer phone - Copy directly from RM");