# Step-by-step: Auth confirmation email (Supabase + Resend hook)

Do these **in order**. After each step, put a ✓ and only then go to the next.

**Your project ref** (from Supabase URL): e.g. `dsawrebgmgarfzrtaqrt`  
**Full functions URL** (replace `YOUR_REF`):

`https://YOUR_REF.supabase.co/functions/v1/auth-send-email`

---

## Step 1 — Resend (outside Supabase)

1. Open [resend.com](https://resend.com) → log in.
2. **Domains** → your domain (e.g. `paisoltechnology.com`) shows **Verified** (green). If not, finish DNS first.
3. **API Keys** → create a key (or copy existing) → you need the full `re_...` string.

✓ **Stop here:** You have a working **API key** and a **verified domain**.

---

## Step 2 — Deploy the Edge Function (your PC)

Open **Command Prompt** in your project folder:

```cmd
cd /d "c:\Users\Moiz Khan\Downloads\data-smart-chat-931b0dc1-main"
set S="C:\Users\Moiz Khan\Downloads\supabase_windows_amd64\supabase.exe"
%S% functions deploy auth-send-email --no-verify-jwt
```

Wait until it says **success** / **deployed**.

✓ **Stop here:** Deploy finished with **no error**.

---

## Step 3 — Edge Function secrets (Supabase Dashboard)

1. **Project Settings** (gear) → **Edge Functions** → **Secrets** (or **Vault**).
2. Add or update:

| Name | Value |
|------|--------|
| `RESEND_API_KEY` | Your full `re_...` key from Step 1 |
| `SUPABASE_URL` | `https://YOUR_REF.supabase.co` (exact, no trailing slash) |

**Do not** add `SEND_EMAIL_HOOK_SECRET` yet — next step creates it.

Save each secret.

✓ **Stop here:** `RESEND_API_KEY` and `SUPABASE_URL` are set.

---

## Step 4 — Auth Hook + secret (must match exactly)

1. **Authentication** → **Auth Hooks** (under CONFIGURATION, BETA).
2. Find **Send Email** (or add hook type **Send Email**).
3. **Enable** it.
4. **HTTP URL** (exact):

   `https://YOUR_REF.supabase.co/functions/v1/auth-send-email`

5. **Generate** or copy the **Hook signing secret** (often looks like `v1,whsec_xxxxxxxx`).

6. **Copy the entire secret string** and go back to **Edge Functions → Secrets**.

7. Add secret:

   | Name | Value |
   |------|--------|
   | `SEND_EMAIL_HOOK_SECRET` | Paste the **full** value including `v1,whsec_` if the dashboard shows it |

8. **Save** the Auth Hooks page in the Dashboard.

✓ **Stop here:** Hook is **ON**, URL is correct, `SEND_EMAIL_HOOK_SECRET` in secrets **matches** the hook secret in the Dashboard.

---

## Step 5 — Email auth allowed (**critical for the hook**)

If **confirm email** is **OFF**, Supabase often **sends no confirmation email** → the **Send Email hook is never called** → **empty function logs**.

1. **Authentication** → **Sign In / Providers** (or **Providers**).
2. **Email** provider → **enabled**.
3. Turn **ON**:
   - **Confirm email** / **Enable email confirmations** / **Require email confirmation** (exact label depends on dashboard version).

✓ **Stop here:** Email sign-up is on **and** confirmation is **required** so signup triggers an email (and your hook).

### Quick check: is the function reachable?

In a browser, open (fix ref if yours differs):

`https://dsawrebgmgarfzrtaqrt.supabase.co/functions/v1/auth-send-email`

You should see plain text starting with **`auth-send-email: OK`**.  
If **404** or wrong project → wrong URL / wrong deployment.

---

## Step 6 — Redirect URLs (so the link in the email works)

1. **Authentication** → **URL Configuration**.
2. **Site URL** = your real app, e.g. `https://chetti.vercel.app`
3. **Redirect URLs** includes:
   - `https://chetti.vercel.app`
   - `https://chetti.vercel.app/**`
   - (and `http://localhost:8080/**` if you test locally)

✓ **Stop here:** Site URL + redirect allowlist are set.

---

## Step 7 — Test (clean test)

1. Use an email that **never** signed up before (or delete the user in **Authentication → Users** first).
2. On your app → **Sign up** with password.
3. Watch **three** places:
   - **Resend → Logs** — new “send” row?
   - **Supabase → Edge Functions → auth-send-email → Logs** — 200 or error?
   - **Inbox / Spam** for that address.

✓ **Stop here:** You know which of the three failed (below).

---

## If Step 7 fails — where the mistake usually is

| What you see | Likely fix |
|--------------|------------|
| **Nothing in Resend logs** | Hook not firing: hook disabled, wrong URL, or signup didn’t require confirmation. |
| **401 in function logs** | `SEND_EMAIL_HOOK_SECRET` ≠ Dashboard hook secret → regenerate secret, update secret, save hook again. |
| **502 / Resend error in logs** | `from` address domain not verified → verify in Resend or set secret `AUTH_FROM_EMAIL` to `Chetti <noreply@yourverifieddomain.com>`. |
| **Resend OK but no inbox** | Spam folder; or corporate email blocking. |
| **Toast “rate limit”** | Wait 1+ hours or use another email. |

---

## Optional: SMTP

If the **hook** is **enabled**, Supabase uses the **hook** for sending those emails, **not** SMTP. You can ignore SMTP for debugging the hook path.

---

## Quick copy-paste URL (replace YOUR_REF)

```
https://YOUR_REF.supabase.co/functions/v1/auth-send-email
```

Use your real **Project ref** from: **Project Settings → General → Reference ID**.
