# Supabase Auth email templates (Chetti branding)

Auth emails are **not** sent from this repo. You paste these into:

**Supabase Dashboard → Authentication → [Email Templates](https://supabase.com/dashboard/project/_/auth/templates)**

Use **Confirm sign up**, **Reset password**, **Magic link**, etc. — each has a **Subject** and **Body** field.

> **Important:** The confirmation link **must** use `href="{{ .ConfirmationURL }}"` on the button. Do not remove that variable.

Many clients support **dark mode**; colors use inline styles (like your welcome email) for consistent rendering.

---

## 1. Confirm sign up

**Subject:** `Confirm your Chetti account`

**Body (HTML):**

```html
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
      <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;">Verify your email</h1>
      <p style="color:#a1a1aa;font-size:14px;margin:12px 0 0;line-height:1.5;">You're one step away from Chetti</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#18181b;font-size:16px;line-height:1.6;margin:0 0 8px;">Hi there,</p>
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Thanks for signing up. Please confirm your email address so we know this is really you.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">
          Confirm email address
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:13px;line-height:1.6;margin:24px 0 0;border-top:1px solid #f4f4f5;padding-top:24px;">
        If you didn't create an account with Chetti, you can safely ignore this email.
      </p>
      <p style="color:#d4d4d8;font-size:12px;line-height:1.5;margin:16px 0 0;word-break:break-all;">
        Button not working? Copy and paste this link into your browser:<br>
        <span style="color:#71717a;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#a1a1aa;font-size:12px;margin:24px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 2. Reset password

**Subject:** `Reset your Chetti password`

**Body (HTML):**

```html
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
        <span style="font-size:28px;">🔐</span>
      </div>
      <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;">Password reset</h1>
      <p style="color:#a1a1aa;font-size:14px;margin:12px 0 0;line-height:1.5;">We received a request for your account</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Click the button below to choose a new password. This link won't stay valid forever.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">
          Reset password
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:13px;line-height:1.6;margin:24px 0 0;border-top:1px solid #f4f4f5;padding-top:24px;">
        If you didn't request a reset, you can ignore this email — your password will stay the same.
      </p>
      <p style="color:#d4d4d8;font-size:12px;line-height:1.5;margin:16px 0 0;word-break:break-all;">
        Copy link:<br><span style="color:#71717a;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#a1a1aa;font-size:12px;margin:24px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 3. Magic link (if you use OTP / magic link sign-in)

**Subject:** `Your Chetti login link`

**Body (HTML):**

```html
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
        <span style="font-size:28px;">✨</span>
      </div>
      <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;">Sign in to Chetti</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Use the button below to sign in. No password needed.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">
          Sign in
        </a>
      </div>
      <p style="color:#d4d4d8;font-size:12px;line-height:1.5;margin:16px 0 0;word-break:break-all;">
        {{ .ConfirmationURL }}
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#a1a1aa;font-size:12px;margin:24px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 4. Change email address

**Subject:** `Confirm your new email for Chetti`

**Body (HTML):** Same structure as “Confirm sign up”, but you can use this copy:

- Title: **Confirm your new email**
- Body paragraph: `You asked to change the email on your Chetti account. Confirm the new address with the button below.`
- Button: `Confirm new email` with `href="{{ .ConfirmationURL }}"`

---

## After pasting

1. Click **Save** on each template.
2. Send a **test** signup or password reset to yourself.
3. If links look “wrong”, ensure **URL Configuration** (Site URL + Redirect URLs) still includes your production domain.

## Optional: OTP instead of a big link

Some inboxes prefetch links and burn the token. If you see “invalid/expired token”, Supabase suggests showing `{{ .Token }}` (6-digit code) and verifying with `verifyOtp` — that’s a product/code change, not only a template change.
