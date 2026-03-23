/**
 * Transactional email via Resend (SDK).
 * Call from the app with a logged-in user JWT, or with the service role key for server/internal use.
 *
 * Deploy: supabase secrets set RESEND_API_KEY=...
 *         supabase functions deploy send-email
 *
 * Optional: AUTH_FROM_EMAIL — default "From" (must be a verified sender/domain in Resend).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");

    const isInternal = authHeader?.includes(supabaseServiceKey);

    if (!isInternal) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      const token = authHeader?.replace("Bearer ", "") || "";
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { to, subject, html, text, from } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: "to, subject, and html or text are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const defaultFrom =
      Deno.env.get("AUTH_FROM_EMAIL") || "Chetti <noreply@paisoltechnology.com>";

    const resend = new Resend(RESEND_API_KEY);

    const payload: {
      from: string;
      to: string[];
      subject: string;
      html?: string;
      text?: string;
    } = {
      from: from || defaultFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
    };
    if (html) payload.html = html;
    if (text) payload.text = text;

    const { data, error: sendError } = await resend.emails.send(payload);

    if (sendError) {
      console.error("Resend SDK error:", sendError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: sendError }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
