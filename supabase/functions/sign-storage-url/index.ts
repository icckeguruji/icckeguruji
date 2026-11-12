// Supabase Edge Function: sign-storage-url
// Generates secure, short-lived signed URLs for course study material PDFs
// Enforces automatic academic mapping and course enrollment verification

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { material_id } = await req.json();

    if (!material_id) {
      return new Response(JSON.stringify({ error: "material_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Client with user token to verify RLS access
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Check if user is allowed to read this material under RLS
    const { data: material, error: queryError } = await userClient
      .from("study_materials")
      .select("id, file_path, title")
      .eq("id", material_id)
      .single();

    if (queryError || !material) {
      return new Response(
        JSON.stringify({
          error: "ACCESS_DENIED",
          message: "आप इस अध्ययन सामग्री तक पहुँचने के लिए अधिकृत नहीं हैं। (You are not authorized to view this material.)",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate signed URL via admin client for 900 seconds (15 mins)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: signedData, error: signError } = await adminClient.storage
      .from("study-materials")
      .createSignedUrl(material.file_path, 900);

    if (signError || !signedData?.signedUrl) {
      return new Response(JSON.stringify({ error: "Failed to generate signed URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        title: material.title,
        signed_url: signedData.signedUrl,
        expires_in_seconds: 900,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
