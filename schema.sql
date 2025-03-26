
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

-- CRITICAL FIX: First, drop the conflicting policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.user_profiles;

-- CRITICAL FIX: Allow new signups to create their profiles, this is the key change
CREATE POLICY "Anyone can insert user profiles" 
ON public.user_profiles 
FOR INSERT 
TO authenticated, anon  -- This allows both authenticated and anonymous users
WITH CHECK (true);      -- No restrictions on insert

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    first_name, 
    last_name, 
    email,
    birth_day,
    gov_id_number,
    gov_id_image,
    cpu_type,
    ram_amount,
    has_headset,
    has_quiet_place,
    speed_test,
    system_settings,
    available_hours,
    available_days,
    day_hours,
    sales_experience,
    sales_months,
    sales_company,
    sales_product,
    service_experience,
    service_months,
    service_company,
    service_product,
    meet_obligation,
    login_discord,
    check_emails,
    solve_problems,
    complete_training,
    personal_statement,
    accepted_terms,
    application_status
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    (new.raw_user_meta_data->>'birth_day')::DATE,
    new.raw_user_meta_data->>'gov_id_number',
    new.raw_user_meta_data->>'gov_id_image',
    new.raw_user_meta_data->>'cpu_type',
    new.raw_user_meta_data->>'ram_amount',
    (new.raw_user_meta_data->>'has_headset')::boolean,
    (new.raw_user_meta_data->>'has_quiet_place')::boolean,
    new.raw_user_meta_data->>'speed_test',
    new.raw_user_meta_data->>'system_settings',
    (new.raw_user_meta_data->>'available_hours')::text[],
    (new.raw_user_meta_data->>'available_days')::text[],
    (new.raw_user_meta_data->>'day_hours')::jsonb,
    (new.raw_user_meta_data->>'sales_experience')::boolean,
    new.raw_user_meta_data->>'sales_months',
    new.raw_user_meta_data->>'sales_company',
    new.raw_user_meta_data->>'sales_product',
    (new.raw_user_meta_data->>'service_experience')::boolean,
    new.raw_user_meta_data->>'service_months',
    new.raw_user_meta_data->>'service_company',
    new.raw_user_meta_data->>'service_product',
    (new.raw_user_meta_data->>'meet_obligation')::boolean,
    (new.raw_user_meta_data->>'login_discord')::boolean,
    (new.raw_user_meta_data->>'check_emails')::boolean,
    (new.raw_user_meta_data->>'solve_problems')::boolean,
    (new.raw_user_meta_data->>'complete_training')::boolean,
    new.raw_user_meta_data->>'personal_statement',
    (new.raw_user_meta_data->>'accepted_terms')::boolean,
    coalesce(new.raw_user_meta_data->>'application_status', 'pending')
  );
  
  -- Also create a default role entry for the new user (agent)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'agent');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user creation
-- CRITICAL FIX: Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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

-- Create app_role enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'agent');
  END IF;
END
$$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Set up RLS for the user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if a user has a role (to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get a user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role AS $$
BEGIN
  RETURN (SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
