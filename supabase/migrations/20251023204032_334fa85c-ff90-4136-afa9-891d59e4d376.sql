-- Create DID table for supervisor management
CREATE TABLE public.did_numbers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number text NOT NULL,
  seller text,
  vertical text,
  campaign_status text,
  lead_price text,
  system_config_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.did_numbers ENABLE ROW LEVEL SECURITY;

-- Create policies for supervisor-only access
CREATE POLICY "Supervisors can view DID numbers"
ON public.did_numbers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE user_id = auth.uid() AND credentials = 'supervisor'
));

CREATE POLICY "Supervisors can insert DID numbers"
ON public.did_numbers
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE user_id = auth.uid() AND credentials = 'supervisor'
));

CREATE POLICY "Supervisors can update DID numbers"
ON public.did_numbers
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE user_id = auth.uid() AND credentials = 'supervisor'
));

CREATE POLICY "Supervisors can delete DID numbers"
ON public.did_numbers
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE user_id = auth.uid() AND credentials = 'supervisor'
));

-- Create trigger for updated_at
CREATE TRIGGER update_did_numbers_updated_at
BEFORE UPDATE ON public.did_numbers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.did_numbers (number, seller, vertical, campaign_status, lead_price, system_config_notes) VALUES
('(213) 325-1604', 'Magic Foo Foo', 'Roofing', 'Pending', '', 'Done'),
('(310) 361-6187', 'Actual Sales', 'Roofing', 'Pending', '', 'Done'),
('(323) 375-2913', 'Ray', 'Roofing', 'Pending', '', 'Done'),
('(323) 450-2460', '', '', 'Inactive', '', 'Done'),
('(323) 694-2852', '', '', 'Inactive', '', 'Done'),
('(323) 859-1239', '', '', 'Inactive', '', 'Done'),
('(323) 859-6716', '', '', 'Inactive', '', 'Done'),
('(323) 948-6146', '', '', 'Inactive', '', 'Done'),
('(714) 364-9188', '', '', 'Inactive', '', 'Done'),
('(862) 292-4362', '', '', 'Inactive', '', 'Done'),
('(631) 519-9973', '', '', 'Inactive', '', 'Done'),
('(214) 367-6338', '', '', 'Inactive', '', 'Done'),
('(516) 212-2428', '', '', 'Inactive', '', 'Done'),
('(210) 941-2050', '', '', 'Inactive', '', 'Done'),
('(213) 510-2572', '', '', 'Inactive', '', 'Done'),
('(323) 366-3526', '', '', 'Inactive', '', 'Done'),
('(323) 417-6077', '', '', 'Inactive', '', 'Done'),
('(713) 386-5767', '', '', 'Inactive', '', 'Done'),
('(305) 320-9714', '', '', 'Inactive', '', 'Done'),
('(213) 320-6497', '', '', 'Inactive', '', 'Done'),
('(732) 217-7646', '', '', 'Inactive', '', 'Done'),
('(305) 320-9714', '', '', '', '', 'Done'),
('(305) 320-9689', 'Adventum', 'Roofing', 'Active', '$90', 'Done'),
('(305) 320-9709', 'Assure', 'Roofing', 'Active', '$90', 'Done'),
('(214) 463-2004', 'HomeIQ', 'Roofing', 'Active', '$140', 'Done'),
('(213) 204-9566', 'HomeIQ', 'Roofing', 'Active', '$90', 'Done'),
('(213) 214-2380', 'HomeIQ', 'Roofing', 'Active', '$75', 'Done'),
('(407) 258-2754', 'Marketcall', 'Roofing', 'Active', '$95', 'Done'),
('(213) 319-6175', 'Homequote', 'Roofing', 'Active', '$120', 'Done'),
('(213) 451-4578', '1 Speed', 'Roofing', 'Active', '$100', 'Done'),
('(213) 497-3635', 'Lead Smart', 'Roofing', 'Active', '$100', 'Done'),
('(310) 708-4968', 'Rex', 'Roofing', 'Active', '$100', 'Done'),
('(310) 708-5014', 'RPM', 'Roofing', 'Active', '$100', 'Done'),
('(323) 347-3662', 'Local Spark', 'Roofing', 'Active', '$100', 'Done'),
('(323) 416-1732', 'Home Appointments', 'Roofing', 'Active', '$110', 'Done'),
('(323) 457-2846', 'D2MDMS', 'Roofing', 'Active', '$90', 'Done'),
('(323) 530-1078', 'Click Thesis', 'Roofing', 'Active', '$75', 'Done'),
('(323) 709-8225', 'Follow Up Agency', 'Roofing', 'Active', '$100', 'Done'),
('(323) 784-3037', '', '', '', '', 'Done'),
('(323) 786-4936', 'Broker Calls', 'Roofing', 'Active', '$100', 'Done'),
('(323) 798-9471', 'Billy', 'Roofing', 'Active', '$100', 'Done'),
('(323) 879-8368', 'Turtle', 'Roofing', 'Active', '', 'Done'),
('(323) 886-9757', '', '', '', '', 'Done'),
('(323) 940-5576', 'OnCore', 'Roofing', 'Active', '$95', 'Done'),
('(323) 968-6124', 'Channel Edge', 'Roofing', 'Pending', '$100', 'Done'),
('(408) 302-3938', 'Home Front Pro', 'Roofing', 'Pending', '$100', 'Done'),
('(408) 302-3980', 'Aragon', 'Roofing', 'Active', '$100', 'Done'),
('(323) 716-0047', 'Follow Up Agency', 'Roofing 2', 'Active', '$100', 'Done'),
('(646) 517-5400', 'OpenHome', 'Roofing', 'Active', '$100', 'Done');