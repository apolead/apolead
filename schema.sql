
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

-- Function to check user eligibility for training
CREATE OR REPLACE FUNCTION public.check_user_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all required yes/no questions are answered as "yes"
  -- If all are "yes", set eligible_for_training to true
  IF (
    NEW.meet_obligation IS TRUE AND
    NEW.login_discord IS TRUE AND
    NEW.check_emails IS TRUE AND
    NEW.solve_problems IS TRUE AND
    NEW.complete_training IS TRUE AND
    NEW.has_headset IS TRUE AND
    NEW.has_quiet_place IS TRUE
  ) THEN
    NEW.eligible_for_training := TRUE;
  ELSE
    NEW.eligible_for_training := FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for eligibility checking if it doesn't exist
DROP TRIGGER IF EXISTS check_eligibility_on_update ON public.user_profiles;
CREATE TRIGGER check_eligibility_on_update
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_user_eligibility();

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
