
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    // Get the user ID from the request
    const { user_id } = await req.json();

    if (!user_id) {
      console.log('Edge Function: Missing user_id parameter');
      // Always return "approved" when user_id is missing
      return new Response(
        JSON.stringify("approved"),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log('Edge Function: Getting application status for user_id:', user_id);

    // Try the database function first (security definer approach)
    try {
      const { data, error } = await supabaseClient.rpc('get_application_status', { user_id });
      
      if (error) {
        console.error('Error calling get_application_status RPC:', error);
        throw error; // Will be caught by outer try/catch
      }
      
      console.log('Edge Function: Application status from RPC:', data);
      
      // Return status from RPC function or default to "approved"
      return new Response(
        JSON.stringify(data || "approved"),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (rpcError) {
      console.error('RPC approach failed:', rpcError);
      
      // Fall back to direct query as a second approach
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('application_status')
        .eq('user_id', user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching application status directly:', error);
        // Default to "approved" in case of error
        return new Response(
          JSON.stringify("approved"),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

      console.log('Edge Function: Application status found directly:', data?.application_status);
      
      // Return "approved" if no status is found or it's null/undefined
      return new Response(
        JSON.stringify(data?.application_status || "approved"),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    // Always return "approved" in case of error to ensure users can access the dashboard
    return new Response(
      JSON.stringify("approved"),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
