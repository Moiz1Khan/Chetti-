import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { email, full_name } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = full_name || "there";
    const appBase =
      Deno.env.get("PUBLIC_APP_URL")?.replace(/\/$/, "") || "https://chetti.vercel.app";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:40px 32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#6366f1;border-radius:14px;margin-bottom:16px;">
        <span style="font-size:28px;">🤖</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;margin:0;">Welcome to Chetti!</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#18181b;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hey ${name}! 👋
      </p>
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Thanks for joining Chetti. You now have the power to create intelligent chatbots, train them on your own data, and embed them anywhere on the web.
      </p>
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 8px;font-weight:600;">
        Here's what you can do next:
      </p>
      <ul style="color:#52525b;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Create your first chatbot</li>
        <li>Upload documents to train your AI</li>
        <li>Customize appearance & branding</li>
        <li>Embed it on your website</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${appBase}/dashboard" style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">
          Go to Dashboard →
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:13px;text-align:center;margin:24px 0 0;border-top:1px solid #f4f4f5;padding-top:24px;">
        If you have any questions, just reply to this email. We're happy to help!
      </p>
    </div>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chetti <noreply@paisoltechnology.com>",
        to: [email],
        subject: `Welcome to Chetti, ${name}! 🚀`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend welcome email error:", resendRes.status, resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email", details: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("welcome-email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
