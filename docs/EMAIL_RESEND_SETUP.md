# Resend email setup (Chetti)

Do **not** commit API keys. Add secrets only in **Supabase Dashboard** or via `supabase secrets set`.

## 1. Welcome email & other Edge Functions (`RESEND_API_KEY`)

Functions such as `welcome-email`, `send-email`, `send-otp-email`, and `notify-chatbot-owner` use Resend. The **`send-email`** function uses the official **`npm:resend`** SDK (same `RESEND_API_KEY`).

| Secret              | Purpose                          |
|---------------------|----------------------------------|
| `RESEND_API_KEY`    | Resend API key (Bearer token)    |
| `AUTH_FROM_EMAIL`   | Optional. Default `From:` for `send-email` (e.g. `Chetti <noreply@yourdomain.com>`). Must match a verified domain in Resend. |
| `PUBLIC_APP_URL`    | Optional. Base URL for links in welcome email (default: `https://chetti.vercel.app`) |

**Signup / `welcome-email`:** The repo sets `[functions.welcome-email] verify_jwt = false` in `supabase/config.toml`. Without this, **new users have no session JWT** until they confirm email, so the Edge Function gateway would **block** the `invoke` with **401** and no welcome mail would send. After pulling this config, redeploy:

```bash
supabase functions deploy welcome-email
```

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

**Sender in code:** default `Chetti <noreply@paisoltechnology.com>` (override with `AUTH_FROM_EMAIL` or per-request `from` in the JSON body). The domain must be **verified** in Resend.

**Deploy `send-email`:**

```bash
supabase functions deploy send-email
```

**Call from React** (user must be signed in so the Supabase client sends the session JWT):

```ts
const { data, error } = await supabase.functions.invoke("send-email", {
  body: {
    to: "user@example.com",
    subject: "Hello",
    html: "<h1>Test</h1>",
    // optional: text, from
  },
});
```

This sends **transactional** mail when your app invokes the function. It does **not** replace Supabase **signup confirmation / password reset** emails — those still need **Auth SMTP**, the **`auth-send-email`** hook, or a custom server flow.

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

### Auth emails via Resend API instead of SMTP (recommended if SMTP fails)

The Edge Function **`auth-send-email`** implements the **Send Email hook**: confirmation, reset password, magic link, etc. are sent with **Resend’s HTTP API** (same key as above). Supabase Auth still controls users and links; only **delivery** changes.

See **`docs/RESEND_AUTH_HOOK.md`** for deploy steps and Dashboard configuration.

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
