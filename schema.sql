
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
  speed_test TEXT,
  system_settings TEXT,
  available_hours TEXT[] DEFAULT '{}',
  has_quiet_place BOOLEAN DEFAULT false,
  accepted_terms BOOLEAN DEFAULT false,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  application_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for the user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for selecting user's own profile
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for inserting user's own profile
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for updating user's own profile
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name' or '',
    new.raw_user_meta_data->>'last_name' or '',
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
