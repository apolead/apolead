
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
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Edge Function: Getting credentials for user_id:', user_id);

    // Try using the is_supervisor function first (most reliable approach)
    try {
      const { data: isSupervisor, error: supervisorError } = await supabaseClient.rpc('is_supervisor', {
        check_user_id: user_id
      });
      
      if (supervisorError) {
        console.log('is_supervisor function error:', supervisorError);
      } else if (isSupervisor !== null) {
        console.log('Edge Function: Supervisor check result:', isSupervisor);
        return new Response(
          JSON.stringify(isSupervisor ? 'supervisor' : 'agent'),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (fnError) {
      console.log('is_supervisor try/catch error:', fnError);
    }

    // Try using the get_user_credentials function as fallback
    try {
      const { data: funcData, error: funcError } = await supabaseClient.rpc('get_user_credentials', { user_id });
      
      if (funcData !== null && !funcError) {
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

    // If RPC fails, try direct query as last resort
    try {
      const { data: directData, error: directError } = await supabaseClient.from('user_profiles')
        .select('credentials')
        .eq('user_id', user_id)
        .maybeSingle();
        
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
