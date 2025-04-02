
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client with the service role key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { email, redirectUrl } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Generating signup link for: ${email}`);

    // Generate signup link with a temporary password (required by Supabase)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password: crypto.randomUUID(), // Generate a random temporary password
      options: {
        redirectTo: redirectUrl || `${req.headers.get("origin")}/confirmation?status=approved`,
      }
    });

    if (error) {
      throw error;
    }

    console.log("Generated signup link successfully");
    
    // Supabase is now configured with Resend SMTP, so the email will be sent automatically
    // We no longer need to return the link in the response for display
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-confirmation function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
