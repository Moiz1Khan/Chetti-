# Resend email setup (Chetti)

Do **not** commit API keys. Add secrets only in **Supabase Dashboard** or via `supabase secrets set`.

## 1. Welcome email & other Edge Functions (`RESEND_API_KEY`)

Functions such as `welcome-email`, `send-email`, `send-otp-email`, and `notify-chatbot-owner` call Resend’s **HTTP API** and read:

| Secret            | Purpose                          |
|-------------------|----------------------------------|
| `RESEND_API_KEY`  | Resend API key (Bearer token)    |
| `PUBLIC_APP_URL`  | Optional. Base URL for links in welcome email (default: `https://chetti.vercel.app`) |

**Where to set (Supabase Cloud):**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. **Project Settings** → **Edge Functions** → **Secrets** (or **Vault** / **Secrets** depending on UI)  
3. Add:
   - `RESEND_API_KEY` = your Resend API key (after rotating any exposed key)  
   - Optionally `PUBLIC_APP_URL` = `https://chetti.vercel.app` (no trailing slash)

**CLI (alternative):**

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxx --project-ref YOUR_PROJECT_REF
supabase secrets set PUBLIC_APP_URL=https://chetti.vercel.app --project-ref YOUR_PROJECT_REF
```

Redeploy Edge Functions after changing secrets if your workflow requires it.

**Sender in code:** `Chetti <noreply@paisoltechnology.com>` — the domain must be **verified** in Resend.

---

## 2. Auth emails (signup confirm, password reset) — Custom SMTP

Supabase Auth does **not** use your repo’s `.env` for SMTP. Configure it in the dashboard.

1. **Resend:** [Domains](https://resend.com/domains) — ensure `paisoltechnology.com` (or your sending domain) is verified.  
2. **Supabase:** **Project Settings** → **Authentication** → **SMTP Settings** (or **Auth** → **SMTP**)

Enable **custom SMTP** and use Resend’s SMTP (confirm current values in [Resend docs](https://resend.com/docs/send-with-smtp)):

| Field              | Typical value              |
|--------------------|----------------------------|
| Host               | `smtp.resend.com`          |
| Port               | `465` (SSL) or `587` (TLS) |
| Username           | `resend`                   |
| Password           | Your **Resend API key**    |
| Sender email       | `noreply@paisoltechnology.com` |
| Sender name        | `Chetti`                   |

3. Save, then send a test from Supabase if available.

**Note:** Auth email **templates** (subject/body) are still edited under **Authentication** → **Email templates** in Supabase.

---

## 3. What stays in Vercel vs Supabase

| Variable            | Where        | Used for                    |
|---------------------|-------------|-----------------------------|
| `VITE_*`            | Vercel only | Frontend (browser bundle)   |
| `RESEND_API_KEY`    | Supabase    | Edge Functions → Resend API |
| SMTP in dashboard   | Supabase    | Auth emails → Resend SMTP   |

Do **not** put `RESEND_API_KEY` in `Vite` / Vercel unless you expose it to the client (not recommended).

---

## 4. Key rotation

If an API key was shared in chat, a ticket, or committed by mistake:

1. Resend → API Keys → **create new key** → update Supabase secrets + SMTP password  
2. **Revoke** the old key  
