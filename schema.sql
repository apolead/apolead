
-- Create the storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_documents', 'User Documents', false);

-- Create secure policies for the bucket
CREATE POLICY "User can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (auth.uid() = SPLIT_PART(name, '_', 1)::uuid);

CREATE POLICY "User can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (auth.uid() = SPLIT_PART(name, '_', 1)::uuid);

-- Create anon users can upload policy
CREATE POLICY "Anyone can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user_documents');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  birth_day DATE,
  gov_id_number TEXT,
  gov_id_image TEXT,
  cpu_type TEXT,
  ram_amount TEXT,
  has_headset BOOLEAN DEFAULT false,
  has_quiet_place BOOLEAN DEFAULT false,
  speed_test TEXT,
  system_settings TEXT,
  available_hours TEXT[] DEFAULT '{}',
  available_days TEXT[] DEFAULT '{}',
  day_hours JSONB DEFAULT '{}'::jsonb,
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
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  application_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for the user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profiles
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Critical fix: Allow authenticated users to insert rows
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow unauthenticated users to insert rows - needed for signup process
CREATE POLICY "Anyone can insert profiles" 
ON public.user_profiles 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function for automatically setting updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_on_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
