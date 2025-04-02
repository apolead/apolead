
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

-- Function to automatically create user profiles when a new user is authenticated
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user profile already exists
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) THEN
    -- Insert new user profile with all fields initially NULL except for required ones
    INSERT INTO public.user_profiles (
      user_id,
      email,
      application_status,
      credentials,
      onboarding_completed,
      eligible_for_training
    ) VALUES (
      NEW.id,
      NEW.email,
      'pending',
      'agent',
      FALSE,
      FALSE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically call this function when users are created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
