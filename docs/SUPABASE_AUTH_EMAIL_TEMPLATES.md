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
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Account Security</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">Verify your email</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#0f172a;font-size:15px;line-height:1.7;margin:0 0 14px;">Hi there,</p>
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Welcome to Chetti. Confirm your email address to activate your workspace and launch your AI assistant.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Confirm email address
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:20px;">
        If you did not create a Chetti account, you can safely ignore this email.
      </p>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Button not working? Copy and paste this link into your browser:<br>
        <span style="color:#0ea5e9;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 2. Invite user

**Subject:** `You're invited to Chetti`

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Team Collaboration</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">You're invited to Chetti</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        You have been invited to join a Chetti workspace. Accept this invitation to get started.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Accept invite
        </a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Invite link:<br><span style="color:#0ea5e9;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
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
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Instant Access</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">Sign in to Chetti</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Your secure magic link is ready. Use it to sign in instantly without a password.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Sign in now
        </a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Login link:<br><span style="color:#0ea5e9;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 4. Change email address

**Subject:** `Confirm your new email for Chetti`

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Account Update</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">Confirm your new email</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        You asked to change the email on your Chetti account. Confirm the new address using the button below.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Confirm new email
        </a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Confirmation link:<br><span style="color:#0ea5e9;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 5. Reset password

**Subject:** `Reset your Chetti password`

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Access Recovery</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">Reset your password</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        We received a request to reset your Chetti password. Click below to choose a new one.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Reset password
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:20px;">
        If you did not request this, you can ignore this email and your current password will remain unchanged.
      </p>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Reset link:<br><span style="color:#0ea5e9;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## 6. Reauthentication

**Subject:** `Confirm it's you`

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#ecfeff,#eef2ff 55%,#f5f3ff);border-bottom:1px solid #e2e8f0;">
      <img src="https://res.cloudinary.com/dxfejax3u/image/upload/v1774506070/logo_mkjcfn.png" alt="Chetti" width="128" style="display:block;margin:0 auto 14px;height:auto;">
      <p style="margin:0;color:#0f172a;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;">Sensitive Action</p>
      <h1 style="color:#0f172a;font-size:24px;line-height:1.3;margin:10px 0 0;font-weight:800;">Confirm it's you</h1>
    </div>
    <div style="padding:30px 28px 32px;background:#ffffff;">
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        For your security, please reauthenticate before continuing this sensitive action.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#4f46e5);color:#ffffff;padding:14px 30px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
          Continue securely
        </a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Verification link:<br><span style="color:#0ea5e9;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px;margin:20px;padding:0 16px;">
    © Chetti · Paisol Technology
  </p>
</body>
</html>
```

---

## After pasting

1. Click **Save** on each template.
2. Send a **test** signup or password reset to yourself.
3. If links look “wrong”, ensure **URL Configuration** (Site URL + Redirect URLs) still includes your production domain.

## Optional: OTP instead of a big link

Some inboxes prefetch links and burn the token. If you see “invalid/expired token”, Supabase suggests showing `{{ .Token }}` (6-digit code) and verifying with `verifyOtp` — that’s a product/code change, not only a template change.
