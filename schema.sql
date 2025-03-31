

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

-- Function to retrieve billing information for a user
CREATE OR REPLACE FUNCTION public.get_billing_information(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  billing_data JSON;
BEGIN
  SELECT json_build_object(
    'bank_name', bank_name,
    'account_number', account_number,
    'routing_number', routing_number,
    'account_holder_name', account_holder_name,
    'account_type', account_type,
    'address_line1', address_line1,
    'address_line2', address_line2,
    'city', city,
    'state', state,
    'zip_code', zip_code,
    'ssn_last_four', ssn_last_four
  ) INTO billing_data
  FROM public.user_profiles
  WHERE user_id = $1
  LIMIT 1;
  
  RETURN billing_data;
END;
$$;

-- Grant access to the billing function for authenticated users
GRANT EXECUTE ON FUNCTION public.get_billing_information TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_billing_information TO service_role;

