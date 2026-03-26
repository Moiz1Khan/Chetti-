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
    const logoUrl =
      "https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="${logoUrl}" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Welcome Aboard</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">Welcome to Chetti!</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#0f172a;font-size:16px;line-height:1.7;margin:0 0 16px;">
        Hey ${name}! 👋
      </p>
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Thanks for joining Chetti. You now have the power to create intelligent chatbots, train them on your own data, and embed them anywhere on the web.
      </p>
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 8px;font-weight:700;">
        Here's what you can do next:
      </p>
      <ul style="color:#334155;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Create your first chatbot</li>
        <li>Upload documents to train your AI</li>
        <li>Customize appearance & branding</li>
        <li>Embed it on your website</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${appBase}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Go to Dashboard →
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center;line-height:1.7;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:20px;">
        If you have any questions, just reply to this email. We're happy to help!
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
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
