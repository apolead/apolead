
// Add polyfill for process.env
if (typeof globalThis.process === "undefined") {
  globalThis.process = { env: {} };
  // Populate process.env with Deno.env values
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    globalThis.process.env[key] = value;
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a secure temporary password
const generateTemporaryPassword = () => {
  const length = 12;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  
  // Ensure at least one of each character type
  password += chars.substr(Math.floor(Math.random() * 26), 1); // Uppercase
  password += chars.substr(26 + Math.floor(Math.random() * 26), 1); // Lowercase
  password += chars.substr(52 + Math.floor(Math.random() * 10), 1); // Number
  password += chars.substr(62 + Math.floor(Math.random() * 10), 1); // Special
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
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
      console.error("Missing Supabase environment variables");
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client with the service role key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { email, redirectUrl } = await req.json();
    
    if (!email) {
      console.error("Email is required but was not provided");
      throw new Error("Email is required");
    }

    console.log(`Generating signup link for: ${email}`);
    console.log(`Redirect URL: ${redirectUrl || "Not provided, using default"}`);
    
    // Generate a secure temporary password
    const tempPassword = generateTemporaryPassword();
    console.log(`Generated temporary password for: ${email}`);

    // Generate signup link with the temporary password
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password: tempPassword,
      options: {
        redirectTo: redirectUrl || `${req.headers.get("origin")}/confirmation?status=approved`,
      }
    });

    if (error) {
      console.error("Error generating signup link:", error.message);
      throw error;
    }

    console.log("Generated signup link successfully");
    console.log("Link properties:", {
      hrefLength: data?.properties?.action_link?.length,
      linkExists: !!data?.properties?.action_link
    });
    
    // The link should be automatically sent via email since Supabase is configured with Resend SMTP
    // Let's log additional information for debugging
    if (data?.properties?.action_link) {
      console.log("Email with signup link should be sent automatically via Resend SMTP");
    } else {
      console.error("No action link was generated");
    }
    
    // Check if we're in development environment - use Deno.env instead of process.env
    const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully",
        // Include the temporary password in the response and link in non-production environments
        tempPassword: tempPassword,
        link: isDevelopment ? data?.properties?.action_link : undefined
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
