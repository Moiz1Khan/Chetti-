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

    const { email, confirmation_url, type } = await req.json();

    if (!email || !confirmation_url) {
      return new Response(
        JSON.stringify({ error: "email and confirmation_url are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailType = type || "signup";

    let subject = "Verify your email";
    let heading = "Confirm your email address";
    let body = "Please click the button below to verify your email address and activate your account.";
    let buttonText = "Verify Email";

    if (emailType === "recovery") {
      subject = "Reset your password";
      heading = "Password Reset Request";
      body = "You requested a password reset. Click the button below to set a new password.";
      buttonText = "Reset Password";
    } else if (emailType === "email_change") {
      subject = "Confirm email change";
      heading = "Confirm your new email";
      body = "Please click the button below to confirm your new email address.";
      buttonText = "Confirm Email";
    } else if (emailType === "magic_link") {
      subject = "Your sign-in link";
      heading = "Sign in to Chetti";
      body = "Click the button below to sign in to your account. This link expires in 10 minutes.";
      buttonText = "Sign In";
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:40px 32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#6366f1;border-radius:14px;margin-bottom:16px;">
        <span style="font-size:28px;">🤖</span>
      </div>
      <h1 style="color:#ffffff;font-size:22px;margin:0;">${heading}</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        ${body}
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${confirmation_url}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">
          ${buttonText}
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:0;">
        If you didn't request this, you can safely ignore this email.
      </p>
      <p style="color:#d4d4d8;font-size:12px;text-align:center;margin:24px 0 0;border-top:1px solid #f4f4f5;padding-top:24px;">
        Chetti by Paisol Technology
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
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend OTP email error:", resendRes.status, resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-otp-email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
