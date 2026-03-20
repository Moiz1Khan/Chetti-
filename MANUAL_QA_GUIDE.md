# Manual QA Guide — Data Smart Chat

Use this guide to test the app manually with your real project credentials.

---

## 1. Setup (before testing)

### 1.1 Environment variables

Create or update `.env` in the project root with your Supabase details:

```env
# Required for the frontend (Vite only exposes VITE_* to the browser)
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key"
```

- **Project ID** → Use in `VITE_SUPABASE_PROJECT_ID` and in the URL: `https://<project-id>.supabase.co`.
- **Publishable key** → This is the **anon** (public) key. Put it in `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Database password** → Not used in `.env`. Use it in Supabase Dashboard (Database settings, connection strings) or in backend/Edge Functions if you have any.
- **Secret keys** (e.g. `service_role`) → Never put in frontend. Use only in Supabase Dashboard, Edge Function secrets, or a secure backend.

After editing `.env`, restart the dev server.

### 1.2 Run the app locally

```powershell
cd "c:\Users\Moiz Khan\Downloads\data-smart-chat-931b0dc1-main"
npm install
npm run dev
```

- App runs at: **http://localhost:8080**
- Use this URL for all manual tests below.

### 1.3 Optional: pre-created test accounts (Supabase Auth)

For repeatable QA without signing up every time:

- In Supabase Dashboard: **Authentication → Users**, create users (e.g. `qa@test.com` / `qa-admin@test.com`).
- Or set in `.env` for Playwright only: `QA_USER_EMAIL`, `QA_USER_PASSWORD`, `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` (used by E2E, not required for manual QA).

---

## 2. QA checklist

Work through each section in order. Note **Pass / Fail** and any bugs (steps, screenshot, message).

---

### 2.1 Landing & public pages (no login)

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 1 | Homepage loads | Open http://localhost:8080 | ☐ | No console errors, hero and nav visible |
| 2 | Nav links | Click Features, Pricing, Integrations, Changelog, Docs, API Reference, Blog, Community, About, Careers, Contact, Privacy | ☐ | Each page loads, no 404 |
| 3 | Footer links | Click footer links (same as above where present) | ☐ | Correct navigation |
| 4 | Theme toggle | Toggle light/dark (if available) | ☐ | Theme persists or updates correctly |
| 5 | Demo chat (if on homepage) | Send a message in the demo widget | ☐ | Request completes or shows expected error message |

---

### 2.2 Authentication

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 6 | Sign up | Go to /signup, fill form, submit | ☐ | Account created and redirected (e.g. dashboard or login) |
| 7 | Email verification | If email confirmation is on, use link from email | ☐ | Account verified and can log in |
| 8 | Login | Go to /login, use existing email/password | ☐ | Redirect to dashboard, user name/avatar shown |
| 9 | Login (wrong password) | Wrong password | ☐ | Clear error, no crash |
| 10 | Forgot password | /forgot-password, submit email | ☐ | Reset email received (or expected message) |
| 11 | Reset password | Open reset link, set new password | ☐ | Can log in with new password |
| 12 | Logout | From dashboard, sign out | ☐ | Redirect to home or login, session cleared |
| 13 | Protected route | While logged out, open /dashboard | ☐ | Redirect to login (or home) |

---

### 2.3 Dashboard — overview & navigation

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 14 | Dashboard loads | Login, go to /dashboard | ☐ | Overview page and sidebar load |
| 15 | Sidebar navigation | Click: Overview, Chatbots, Knowledge, Analytics, API Keys, API Docs, Billing, Settings, Admin (if visible) | ☐ | Each route loads, correct content |
| 16 | Mobile/small screen | Resize to mobile width; open/close sidebar | ☐ | Menu works, no layout break |

---

### 2.4 Chatbots

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 17 | Chatbots list | Dashboard → Chatbots | ☐ | List loads (empty or with bots) |
| 18 | Create chatbot | Create new chatbot, set name and basics | ☐ | Bot created and appears in list |
| 19 | Open builder | Open a chatbot in the builder | ☐ | Builder page loads with bot config |
| 20 | Edit bot (name, welcome, model, etc.) | Change name, welcome message, model, then save | ☐ | Changes persist after refresh |
| 21 | Chat with bot (from dashboard) | Open “Chat” for a bot from dashboard | ☐ | Chat UI loads, send message, get response (or clear error) |
| 22 | Share / embed | Use any “Share” or “Embed” option | ☐ | Link or embed code works as expected |

---

### 2.5 Knowledge base

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 23 | Knowledge base page | Dashboard → Knowledge | ☐ | Page loads |
| 24 | Upload / add source | Upload file or add URL (if supported) | ☐ | Processing starts or completes, no crash |
| 25 | Process knowledge | Trigger “Process” or equivalent | ☐ | Success or clear error (e.g. Edge Function or DB) |

---

### 2.6 Analytics

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 26 | Analytics page | Dashboard → Analytics | ☐ | Page loads, charts or placeholders visible |
| 27 | Data or filters | Change date range or filters (if any) | ☐ | Data updates or “no data” message |

---

### 2.7 API Keys & API Docs

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 28 | API Keys page | Dashboard → API Keys | ☐ | Page loads, list or “create” CTA |
| 29 | Create API key | Create a new key | ☐ | Key shown once (copy works), stored in DB |
| 30 | API Docs | Dashboard → API Docs | ☐ | Docs load, request example and endpoint (e.g. `/functions/v1/api-chat`) visible |
| 31 | Try API request | Use docs or Postman to call API with key | ☐ | 200 with response or clear 401/403 |

---

### 2.8 Billing & settings

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 32 | Billing page | Dashboard → Billing | ☐ | Page loads (plans or “coming soon”) |
| 33 | Settings page | Dashboard → Settings | ☐ | Profile/settings form loads |
| 34 | Update profile | Change name/avatar (if available), save | ☐ | Changes persist |

---

### 2.9 Public chatbot (no login)

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 35 | Public chatbot URL | Open /chatbot/:chatbotId (use a real bot id from dashboard) | ☐ | Chat widget loads without login |
| 36 | Send message (public) | Send a message | ☐ | Reply from bot or clear error |
| 37 | Invalid chatbot id | Open /chatbot/invalid-id-12345 | ☐ | 404 or friendly error, no crash |

---

### 2.10 Admin (if you have admin role)

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 38 | Admin page | Dashboard → Admin (if visible) | ☐ | Admin UI loads |
| 39 | Admin actions | Use payments/analytics tabs or any admin action | ☐ | Data loads or expected error |

---

### 2.11 Edge cases & errors

| # | Test | Steps | Pass / Fail | Notes |
|---|------|--------|-------------|--------|
| 40 | 404 | Open /random-page-xyz | ☐ | Custom 404 page, no blank screen |
| 41 | Network offline | Disable network, click around | ☐ | Graceful error or retry, no white screen |
| 42 | Expired session | Stay idle until session expires, then click in dashboard | ☐ | Redirect to login or refresh token |
| 43 | Console errors | During all tests, keep DevTools Console open | ☐ | No uncaught errors; note any expected warnings |

---

## 3. Quick reference — credentials

| What you have | Where it goes |
|---------------|----------------|
| **Project name / ID** | `VITE_SUPABASE_PROJECT_ID` and in URL: `https://<project-id>.supabase.co` |
| **Publishable (anon) key** | `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` |
| **Database password** | Supabase Dashboard → Database → Connection string; or backend only. Not in frontend `.env`. |
| **Secret keys** (e.g. service_role) | Supabase Dashboard, Edge Function secrets, or backend. Never in frontend. |

---

## 4. After QA

- Log failures with: **test #**, **steps**, **expected vs actual**, **browser/OS**.
- Re-test after fixing config (e.g. `.env`, Supabase URL/keys) or code changes.
- For automated runs later: `npm run e2e` (see README; start app with `npm run dev` first).
