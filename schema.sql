
-- This function retrieves the credentials value for a specific user
CREATE OR REPLACE FUNCTION public.get_user_credentials(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT credentials 
    FROM public.user_profiles 
    WHERE user_id = $1
    LIMIT 1
  );
END;
$$;

-- Grant access to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credentials TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_credentials TO service_role;

-- Ensure the user_applications table is accessible for public inserts
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert into user_applications
-- This is needed for the signup flow
CREATE POLICY IF NOT EXISTS "Allow public inserts to user_applications" 
ON public.user_applications 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Only allow the user who created the application to select it
CREATE POLICY IF NOT EXISTS "Allow users to view their own applications" 
ON public.user_applications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Only allow the user who created the application to update it
CREATE POLICY IF NOT EXISTS "Allow users to update their own applications" 
ON public.user_applications 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Only allow the user who created the application to delete it
CREATE POLICY IF NOT EXISTS "Allow users to delete their own applications" 
ON public.user_applications 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
