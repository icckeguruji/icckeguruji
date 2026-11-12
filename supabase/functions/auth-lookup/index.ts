// Supabase Edge Function: auth-lookup
// Resolves student identifier (Mobile / Username / Email) and triggers Email OTP
// Zero-Paid-Service & Strict Security (No SMS, No Account Enumeration, No Email Leakage)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string" || identifier.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "INVALID_IDENTIFIER",
          message: "कृपया मोबाइल नंबर, यूज़रनेम या ईमेल दर्ज करें। (Please enter mobile, username or email.)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Call secure PostgreSQL procedure
    const { data, error } = await supabaseAdmin.rpc("resolve_identifier_for_auth", {
      p_identifier: identifier.trim(),
    });

    if (error) {
      console.error("RPC error resolving identifier:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "SERVER_ERROR",
          message: "सर्वर त्रुटि। कृपया पुनः प्रयास करें। (Server error. Please retry.)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!data.success) {
      // Could be rate limited or deactivated
      return new Response(
        JSON.stringify({
          success: false,
          error: data.error || "LOOKUP_FAILED",
          message: data.message,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // If user exists, trigger Supabase Auth Email OTP
    if (data.user_exists && data.email) {
      const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        console.error("Error sending OTP email:", otpError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "OTP_DISPATCH_FAILED",
            message: "ईमेल ओटीपी भेजने में समस्या हुई। कृपया थोड़ी देर बाद प्रयास करें।",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // Return generic response without revealing raw email to prevent account enumeration
    return new Response(
      JSON.stringify({
        success: true,
        message: data.user_exists
          ? `ओटीपी आपके पंजीकृत ईमेल (${data.masked_email}) पर भेज दिया गया है।`
          : "यदि यह खाता पंजीकृत है, तो ओटीपी ईमेल पर भेजा गया है।",
        masked_email: data.masked_email || null,
        identifier_type: data.identifier_type || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("Unexpected error in auth-lookup:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_ERROR",
        message: err.message || "An unexpected error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
