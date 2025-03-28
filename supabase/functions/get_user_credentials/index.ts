
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
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Edge Function: Getting credentials for user_id:', user_id);

    // Try the database function first (security definer approach)
    try {
      const { data, error } = await supabaseClient.rpc('get_user_credentials', { user_id });
      
      if (error) {
        console.error('Error calling get_user_credentials RPC:', error);
        throw error; // Will be caught by outer try/catch
      }
      
      console.log('Edge Function: Credentials found from RPC:', data);
      
      // Return credentials from RPC function or default to "agent"
      return new Response(
        JSON.stringify(data || 'agent'),
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
        .select('credentials')
        .eq('user_id', user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user credentials directly:', error);
        return new Response(
          JSON.stringify('agent'), // Default to 'agent' on error
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

      // Log the data being returned
      console.log('Edge Function: Credentials found directly:', data?.credentials);

      // Return the credentials or 'agent' as default
      return new Response(
        JSON.stringify(data?.credentials || 'agent'),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify('agent'), // Default to 'agent' on error
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
