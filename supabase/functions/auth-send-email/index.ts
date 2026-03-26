/**
 * Supabase Auth "Send Email" hook — sends auth emails via Resend HTTP API (no SMTP).
 *
 * Dashboard: Authentication → Hooks → Send Email → point to this function URL.
 * Deploy: supabase functions deploy auth-send-email --no-verify-jwt
 * Secrets: RESEND_API_KEY, SEND_EMAIL_HOOK_SECRET (from Auth Hooks UI), optional AUTH_FROM_EMAIL
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const DEFAULT_FROM = "Chetti <noreply@paisoltechnology.com>";
const LOGO_URL =
  "https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png";

type EmailPayload = {
  user: {
    email: string;
    new_email?: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
    old_email?: string;
  };
};

function verifyQueryType(action: string): string {
  const map: Record<string, string> = {
    signup: "signup",
    invite: "invite",
    magiclink: "magiclink",
    recovery: "recovery",
    email_change: "email_change",
    reauthentication: "reauthentication",
    email: "email",
  };
  return map[action] || "signup";
}

function buildVerifyUrl(
  supabaseUrl: string,
  tokenHash: string,
  actionType: string,
  redirectTo: string
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const type = verifyQueryType(actionType);
  const params = new URLSearchParams({
    token: tokenHash,
    type,
    redirect_to: redirectTo || "",
  });
  return `${base}/auth/v1/verify?${params.toString()}`;
}

function subjectFor(action: string): string {
  const s: Record<string, string> = {
    signup: "Confirm your Chetti account",
    invite: "You’re invited to Chetti",
    magiclink: "Your Chetti login link",
    recovery: "Reset your Chetti password",
    email_change: "Confirm your email change",
    reauthentication: "Confirm it’s you",
  };
  return s[action] || "Chetti notification";
}

function htmlEmail(opts: {
  title: string;
  bodyHtml: string;
  ctaUrl?: string;
  ctaLabel?: string;
  otp?: string;
  eyebrow?: string;
}): string {
  const { title, bodyHtml, ctaUrl, ctaLabel, otp, eyebrow } = opts;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Segoe UI,Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="${LOGO_URL}" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      ${eyebrow ? `<p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">${eyebrow}</p>` : ""}
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">${title}</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;color:#334155;font-size:15px;line-height:1.7;">
      ${bodyHtml}
      ${ctaUrl && ctaLabel ? `<div style="text-align:center;margin:28px 0;"><a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">${ctaLabel}</a></div>` : ""}
      ${otp ? `<p style="color:#475569;font-size:14px;line-height:1.7;margin:16px 0 0;">Or enter this code: <strong style="letter-spacing:2px;color:#0f172a;">${otp}</strong></p>` : ""}
      ${ctaUrl ? `<p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">Link: <span style="color:#0ea5e9;">${ctaUrl}</span></p>` : ""}
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">© Chetti · Paisol Technology</p>
</body></html>`;
}

serve(async (req) => {
  // Always log — if you see nothing here after signup, Supabase Auth is not calling this URL.
  console.info("[auth-send-email]", req.method, new Date().toISOString());

  if (req.method === "GET" || req.method === "HEAD") {
    return new Response(
      "auth-send-email: OK. Supabase Send Email hook must POST here. If signup shows no logs, enable Confirm email and check Auth Hooks URL.",
      { status: 200, headers: { "Content-Type": "text/plain" } }
    );
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const secretRaw = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  const from = Deno.env.get("AUTH_FROM_EMAIL") || DEFAULT_FROM;
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";

  if (!RESEND_API_KEY || !secretRaw) {
    console.error("auth-send-email: missing RESEND_API_KEY or SEND_EMAIL_HOOK_SECRET");
    return new Response(
      JSON.stringify({ error: { message: "Server misconfigured" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Dashboard secret is often "v1,whsec_<base64>"; standardwebhooks expects the part after whsec_
  const payloadText = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const trimmed = secretRaw.trim();
  const secretAttempts = [
    trimmed.replace(/^v1,whsec_/, ""),
    trimmed.startsWith("whsec_") ? trimmed.slice("whsec_".length) : trimmed,
    trimmed,
  ];

  let data: EmailPayload | undefined;
  let lastVerifyErr: unknown;
  try {
    for (const sec of secretAttempts) {
      if (!sec) continue;
      try {
        const wh = new Webhook(sec);
        data = wh.verify(payloadText, headers) as EmailPayload;
        break;
      } catch (e) {
        lastVerifyErr = e;
      }
    }
    if (!data) {
      throw lastVerifyErr ?? new Error("verify failed");
    }
  } catch (e) {
    console.error("auth-send-email webhook verify failed:", e);
    return new Response(
      JSON.stringify({ error: { message: "Invalid webhook signature" } }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!data) {
    return new Response(JSON.stringify({ error: { message: "Invalid payload" } }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { user, email_data } = data;
  const action = email_data.email_action_type;
  const to = user.email;
  const redirectTo = email_data.redirect_to || "";
  const siteUrl = email_data.site_url || supabaseUrl;

  let subject = subjectFor(action);
  let html = "";
  let recipient = to;

  const isNotification = action.includes("_notification");

  if (isNotification) {
    subject = "Chetti account notification";
    html = htmlEmail({
      title: "Notification",
      bodyHtml: `<p>This is a security notification for <strong>${to}</strong> related to: <code>${action}</code>.</p><p>If you did not make this change, contact support.</p>`,
      eyebrow: "Account Alert",
    });
  } else if (!isNotification && supabaseUrl && email_data.token_hash) {
    const confirmUrl = buildVerifyUrl(supabaseUrl, email_data.token_hash, action, redirectTo);
    const labels: Record<string, { title: string; body: string; cta: string; eyebrow: string }> = {
      signup: {
        title: "Verify your email",
        body: "<p>Thanks for signing up. Click below to confirm your email address.</p>",
        cta: "Confirm email",
        eyebrow: "Account Security",
      },
      invite: {
        title: "You’re invited",
        body: `<p>You’ve been invited to join Chetti. Click below to accept.</p>`,
        cta: "Accept invite",
        eyebrow: "Team Collaboration",
      },
      magiclink: {
        title: "Sign in to Chetti",
        body: "<p>Use the button below to sign in (no password needed).</p>",
        cta: "Sign in",
        eyebrow: "Instant Access",
      },
      recovery: {
        title: "Reset password",
        body: "<p>We received a request to reset your password. Click below to choose a new one.</p>",
        cta: "Reset password",
        eyebrow: "Access Recovery",
      },
      reauthentication: {
        title: "Confirm it's you",
        body: "<p>Your confirmation code is required for this sensitive action.</p>",
        cta: "Continue",
        eyebrow: "Sensitive Action",
      },
      email_change: {
        title: "Confirm email change",
        body: "<p>Confirm this email address for your Chetti account.</p>",
        cta: "Confirm email",
        eyebrow: "Account Update",
      },
    };
    const pack = labels[action as keyof typeof labels] || labels.signup;
    subject = subjectFor(action);
    html = htmlEmail({
      title: pack.title,
      bodyHtml: pack.body,
      ctaUrl: confirmUrl,
      ctaLabel: pack.cta,
      otp: email_data.token,
      eyebrow: pack.eyebrow,
    });
  } else {
    html = htmlEmail({
      title: "Chetti",
      bodyHtml: `<p>Action: <strong>${action}</strong></p><p>Site: ${siteUrl}</p>`,
      eyebrow: "Notification",
    });
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject,
      html,
    }),
  });

  const resendJson = await resendRes.json().catch(() => ({}));
  if (!resendRes.ok) {
    console.error("auth-send-email Resend error:", resendRes.status, resendJson);
    return new Response(
      JSON.stringify({
        error: {
          http_code: resendRes.status,
          message: (resendJson as { message?: string }).message || "Resend send failed",
        },
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
