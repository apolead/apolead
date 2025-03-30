
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

    // Try a simple database function first - most direct approach
    try {
      const { data: funcData, error: funcError } = await supabaseClient.rpc('get_user_credentials', { user_id });
      
      if (funcData && !funcError) {
        console.log('Edge Function: Credentials found via RPC:', funcData);
        return new Response(
          JSON.stringify(funcData || 'agent'),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      if (funcError) console.log('RPC function error:', funcError);
    } catch (rpcError) {
      console.log('RPC try/catch error:', rpcError);
    }

    // If RPC fails, try direct query
    try {
      const { data: directData, error: directError } = await supabaseClient.from('user_profiles')
        .select('credentials')
        .eq('user_id', user_id)
        .single();
        
      if (directData && !directError) {
        console.log('Edge Function: Credentials found directly:', directData.credentials);
        return new Response(
          JSON.stringify(directData.credentials || 'agent'),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      if (directError) console.log('Direct query error:', directError);
    } catch (queryError) {
      console.log('Direct query try/catch error:', queryError);
    }

    // If we get here, we couldn't find credentials through any method
    console.log('Edge Function: No credentials found, returning default agent value');
    return new Response(
      JSON.stringify("agent"),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify("agent"),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
