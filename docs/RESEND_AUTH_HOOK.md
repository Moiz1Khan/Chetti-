# Auth emails via Resend API (Send Email hook)

Use this when **SMTP in Supabase** works poorly or not at all. Supabase Auth still owns users and tokens; **only delivery** switches to your Edge Function + **Resend HTTP API**.

## How it works

| Setting | Result |
|--------|--------|
| **Email provider** enabled + **Send Email hook** enabled | Hook sends mail (**SMTP is not used**) |
| Hook disabled | SMTP (or Supabase default) sends mail |

Reference: [Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)

## 1. Secrets

In **Supabase Dashboard → Project Settings → Edge Functions → Secrets** set:

| Secret | Value |
|--------|--------|
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `SEND_EMAIL_HOOK_SECRET` | From **Authentication → Hooks** when you create/configure the hook (format like `v1,whsec_...`) |
| `SUPABASE_URL` | Usually auto-injected for functions; if not, set `https://YOUR_PROJECT_REF.supabase.co` |

Optional:

| Secret | Value |
|--------|--------|
| `AUTH_FROM_EMAIL` | `Chetti <noreply@yourdomain.com>` (must be allowed in Resend) |

CLI:

```bash
supabase secrets set RESEND_API_KEY=re_xxx SEND_EMAIL_HOOK_SECRET="v1,whsec_xxx" --project-ref YOUR_REF
```

## 2. Deploy the function

From the repo root:

```bash
supabase functions deploy auth-send-email --no-verify-jwt
```

(`--no-verify-jwt` is required so Supabase Auth can call the hook without a user JWT.)

## 3. Enable the hook in the Dashboard

1. **Authentication → Hooks** (or **Auth → Hooks**)
2. **Send Email** → enable
3. **HTTP endpoint**:  
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/auth-send-email`
4. Paste / generate **hook secret** → same value as `SEND_EMAIL_HOOK_SECRET` in secrets
5. Save

## 4. Keep email sign-ups enabled

**Authentication → Providers → Email** — confirm email / sign up is allowed so Auth still triggers sends.

## 5. Test

Sign up with a new address → check **Resend → Logs** and inbox.

## Troubleshooting

- **401 from function**: webhook signature mismatch → regenerate secret in Dashboard and update `SEND_EMAIL_HOOK_SECRET`.
- **502 from Resend**: invalid `from` domain → verify domain in Resend.
- **Link doesn’t verify**: confirm `SUPABASE_URL` matches your project; **Site URL** / **Redirect URLs** in Auth settings must include your app origin.

## SMTP block in Dashboard

You can leave **SMTP** configured or clear it; with the hook **enabled**, Auth uses the hook for sending (see Supabase matrix above).
