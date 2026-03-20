# QA Test Cases — Detailed Summary

**Project:** Data Smart Chat  
**Document type:** Test cases list, implementation summary, and run results  
**Date:** March 2026  
**No API keys or secrets are included in this document.**

---

## PART 1 — WHAT WE DID

### 1.1 Objective

We performed full QA and end-to-end (E2E) testing for the Data Smart Chat application as specified: authentication, dashboard, API integrations, UI/UX responsiveness, error handling, and user flows from start to finish.

### 1.2 Test Stack

- **Runner:** Playwright (Node.js)
- **Config:** `playwright.config.ts` — base URL `http://localhost:8080`, 1 worker, 90s timeout per test, trace/video off, screenshot only on failure
- **Fixtures:** `playwright-fixture.ts` re-exports `test` and `expect` from `@playwright/test`
- **Helpers:**
  - **Auth (`e2e/helpers/auth.ts`):** `loginAs(page, "user" | "admin")`, `logout(page)`. Uses env vars `QA_USER_EMAIL`, `QA_USER_PASSWORD`, `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` when set; otherwise signup fallback (one-off account per run).
  - **Seed (`e2e/helpers/seed.ts`):** `seedChatbotWithTextKnowledge(page, "user")` — creates text knowledge and a chatbot linked to it via UI, tagged with `QA_Test_` prefix.
  - **Stream (`e2e/helpers/stream.ts`):** `waitForAssistantMarkdownNonEmpty(page, opts)` — waits for assistant markdown content (no exact AI text matching).

### 1.3 Security (API Keys)

- Playwright config: no trace/video; screenshot only on failure.
- API spec: `test.use({ screenshot: "off", trace: "off", video: "off" })` so API key dialogs are never captured.
- QA report and this summary: no raw API keys or credentials.

### 1.4 Fixes Applied During QA

1. **beforeAll + page:** Playwright does not allow `page` or `context` in `beforeAll`. We moved seeding from `beforeAll` into the first test of each serial suite that needed it:
   - **dashboard.spec.ts:** CHAT-001 runs seed and sets `seeded`; DASH-001 uses it (or runs after login only).
   - **knowledge-base.spec.ts:** KNOW-001 runs seed; KNOW-002 depends on `seeded`.
   - **public-chatbot.spec.ts:** PUBLIC-002 runs seed; PUBLIC-001 has no login/seed.
   - **api.spec.ts:** API-001 runs seed inside the test; API-002 uses `seeded`.

2. **Landing “has navigation links”:** The login entry is a link with `href="/login"` sometimes wrapped in a button. We changed the assertion to use `page.locator('a[href="/login"]')` for a stable selector.

3. **Test timeout:** Login flow waits up to 60s for navigation to `/dashboard`. Default test timeout was 30s. We set `timeout: 90_000` in `playwright.config.ts` so login-dependent tests can complete.

### 1.5 How to Run

1. Start the app: `npm run dev` (serves at `http://localhost:8080`).
2. (Optional) Set env: `QA_USER_EMAIL`, `QA_USER_PASSWORD`, and for admin tests `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`.
3. First time: `npx playwright install chromium`.
4. Run E2E: `npm run e2e` or `npx playwright test`.
5. Headed (see browser): `npm run e2e:headed`.
6. View last report: `npx playwright show-report`.

---

## PART 2 — TEST CASES LIST (DETAILED)

### 2.1 Authentication — `e2e/auth.spec.ts`

| ID        | Title                                              | Steps                                                                 | Expected result                          | Result (last run) |
|-----------|----------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------|-------------------|
| AUTH-001  | Login page renders required fields                 | Go to /login; check Email, Password, Login button visible             | All three visible                        | Passed            |
| AUTH-001B | Signup page renders required fields                | Go to /signup; check Full Name, Email, Password, Create account      | All visible                              | Passed            |
| AUTH-002  | Forgot password page is accessible                 | Go to /forgot-password; check Email field                             | Email field visible                      | Passed            |
| AUTH-004  | Protected route redirects to login when logged out | Go to /dashboard while logged out                                     | Redirect to /login                       | Passed            |
| AUTH-003  | Invalid login shows safe fallback                  | Submit invalid email/password on /login                               | Stay on /login (toast or error)          | Passed            |
| AUTH-005  | Signup validates password length (client-side)     | Submit signup with short password                                    | Stay on /signup (validation)              | Passed            |
| AUTH-006  | Valid user login redirects to dashboard            | loginAs(user); check URL and “Welcome back” heading                   | URL /dashboard, heading visible           | Failed (timeout)  |
| AUTH-007  | Logout returns to landing                         | loginAs(user); logout(); check URL and login link                     | URL /, login link visible                | Failed (timeout)  |

**Notes:** AUTH-006 and AUTH-007 fail when login never reaches dashboard (e.g. missing QA credentials, signup blocked by email verification, or backend not reachable).

---

### 2.2 Landing — `e2e/landing.spec.ts`

| ID       | Title                | Steps                          | Expected result     | Result (last run) |
|----------|----------------------|--------------------------------|---------------------|-------------------|
| LAND-001  | Renders hero section | Go to /; check h1 visible     | Hero heading visible| Passed            |
| LAND-002  | Has navigation links | Go to /; check login link      | Link to /login visible | Failed then fixed (selector) |

**Notes:** LAND-002 was updated to use `a[href="/login"]` for stability.

---

### 2.3 Public Chatbot — `e2e/public-chatbot.spec.ts`

| ID         | Title                                      | Steps                                                                 | Expected result                    | Result (last run) |
|------------|--------------------------------------------|-----------------------------------------------------------------------|------------------------------------|-------------------|
| PUBLIC-001  | Shows error for non-existent chatbot       | Go to /chatbot/00000000-0000-0000-0000-000000000000; wait; check body | Body has content (error/empty UI)   | Failed (beforeAll) then fixed |
| PUBLIC-002  | Renders public chat and streams reply     | Seed; go to /chatbot/:id; send message; wait for stream + sources     | Stream and knowledge name visible   | Skipped (after PUBLIC-001)     |

**Notes:** PUBLIC-001 does not require login. PUBLIC-002 seeds chatbot + knowledge and then asserts streaming and sources.

---

### 2.4 Dashboard (user) — `e2e/dashboard.spec.ts`

| ID        | Title                                              | Steps                                                                 | Expected result                          | Result (last run) |
|-----------|----------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------|-------------------|
| CHAT-001   | Streams assistant reply and shows knowledge sources| loginAs; seed; go to /dashboard/chatbots/chat/:id; send marker message| Knowledge name and streamed markdown     | Failed (beforeAll) then fixed |
| DASH-001   | Dashboard overview loads and renders key sections  | loginAs; go to /dashboard; check “Welcome back” and “message usage”     | Sections visible                         | Skipped (after CHAT-001)      |

**Notes:** Seeding is done inside CHAT-001; DASH-001 only needs login (beforeEach).

---

### 2.5 Knowledge Base — `e2e/knowledge-base.spec.ts`

| ID        | Title                                                    | Steps                                                                 | Expected result                    | Result (last run) |
|-----------|----------------------------------------------------------|-----------------------------------------------------------------------|------------------------------------|-------------------|
| KNOW-001   | Shows processed knowledge as Ready and preview content   | loginAs; seed; go to /dashboard/knowledge; find row; open preview      | “Ready”, name and content in preview| Failed (beforeAll) then fixed |
| KNOW-002   | Delete knowledge removes the record                      | Go to knowledge; delete seeded row; confirm                           | Row gone                            | Skipped (after KNOW-001)       |

**Notes:** Seed runs in KNOW-001; KNOW-002 uses same `seeded` and deletes that knowledge.

---

### 2.6 API Integration — `e2e/api.spec.ts`

| ID     | Title                                                    | Steps                                                                 | Expected result                    | Result (last run) |
|--------|----------------------------------------------------------|-----------------------------------------------------------------------|------------------------------------|-------------------|
| API-001 | Valid key returns response (and sources when requested) | loginAs; seed; go to API keys; generate key; call api-chat with key  | 200, response (+ sources)         | Failed (timeout in beforeEach) |
| API-002 | Invalid key returns 401                                  | Same endpoint with Bearer invalid_key                                 | 401 and error message              | Skipped (after API-001)        |

**Notes:** No screenshots/trace/video for this file. Seeding moved into API-001. Failures were due to login timeout in beforeEach.

---

### 2.7 Admin — `e2e/admin.spec.ts`

| ID        | Title                                          | Steps                                                    | Expected result                    | Result (last run) |
|-----------|------------------------------------------------|----------------------------------------------------------|------------------------------------|-------------------|
| ADMIN-001  | Non-admin cannot access /dashboard/admin       | loginAs(user); go to /dashboard/admin                   | “Access denied” and admin-privileges text | Failed (timeout in login) |
| ADMIN-002  | Admin can load admin page without crashing     | If QA_ADMIN_* set: loginAs(admin); go to /dashboard/admin| “Admin dashboard” heading visible  | Skipped (after ADMIN-001)      |

**Notes:** ADMIN-002 is skipped when `QA_ADMIN_EMAIL` / `QA_ADMIN_PASSWORD` are not set.

---

### 2.8 Billing — `e2e/billing.spec.ts`

| ID       | Title                                  | Steps                                          | Expected result      | Result (last run) |
|----------|----------------------------------------|------------------------------------------------|----------------------|-------------------|
| BILL-001  | Billing page renders for logged-in user| loginAs(user); go to /dashboard/billing       | “Billing” heading    | Failed (timeout in login) |

---

### 2.9 Responsive UI — `e2e/responsive.spec.ts`

| ID       | Title                              | Steps                                      | Expected result     | Result (last run) |
|----------|------------------------------------|--------------------------------------------|---------------------|-------------------|
| RESP-001  | Landing renders on mobile          | Viewport 375×812; go to /; check h1        | h1 visible          | Passed            |
| RESP-002  | Landing renders on tablet          | Viewport 768×1024; go to /; check h1       | h1 visible          | Passed            |
| RESP-003  | Login renders on desktop           | Viewport 1280×720; go to /login; check form| Email + Login button| Passed            |

---

## PART 3 — HOW IT WENT (RUN SUMMARY)

### 3.1 Last Run (from your terminal output)

- **Total tests:** 24
- **Passed:** 10
- **Failed:** 9
- **Did not run:** 5 (skipped due to serial dependency after a failure)

### 3.2 Passed (10)

- AUTH-001, AUTH-001B, AUTH-002, AUTH-004, AUTH-003, AUTH-005  
- LAND-001 (renders hero section)  
- RESP-001, RESP-002, RESP-003  

### 3.3 Failed (9) and Root Causes

1. **ADMIN-001** — Timeout in `loginAs` (waitForURL /dashboard).
2. **AUTH-006** — Timeout in `loginAs`.
3. **AUTH-007** — Timeout in `loginAs` (logout test depends on login).
4. **BILL-001** — Timeout in `loginAs`.
5. **CHAT-001** — Error: “context and page fixtures are not supported in beforeAll” → **fixed** by moving seed into test.
6. **KNOW-001** — Same beforeAll error → **fixed**.
7. **Landing “has navigation links”** — getByRole('link', { name: /login/i }) not found → **fixed** with `a[href="/login"]`.
8. **PUBLIC-001** — Same beforeAll error → **fixed** (no beforeAll in public-chatbot; PUBLIC-001 has no login).
9. **API-001** — Timeout in beforeEach (loginAs).

### 3.4 Did Not Run (5)

- ADMIN-002 (after ADMIN-001 failed)  
- API-002 (after API-001 failed)  
- DASH-001 (after CHAT-001 failed)  
- KNOW-002 (after KNOW-001 failed)  
- PUBLIC-002 (after PUBLIC-001 failed)  

These run only when the previous test in their serial suite succeeds.

### 3.5 Summary Table (All Cases)

| Suite        | Test ID   | Description (short)                          | Result   |
|-------------|------------|-----------------------------------------------|----------|
| auth        | AUTH-001   | Login page fields                             | Passed   |
| auth        | AUTH-001B  | Signup page fields                            | Passed   |
| auth        | AUTH-002   | Forgot password accessible                    | Passed   |
| auth        | AUTH-003   | Invalid login fallback                        | Passed   |
| auth        | AUTH-004   | Protected route → login                      | Passed   |
| auth        | AUTH-005   | Signup password validation                    | Passed   |
| auth        | AUTH-006   | Valid login → dashboard                       | Failed   |
| auth        | AUTH-007   | Logout → landing                             | Failed   |
| landing     | LAND-001   | Hero section                                  | Passed   |
| landing     | LAND-002   | Navigation links                              | Failed→Fixed |
| public-chatbot | PUBLIC-001 | Non-existent chatbot error                  | Failed→Fixed |
| public-chatbot | PUBLIC-002 | Public chat streams                          | Did not run |
| dashboard   | CHAT-001   | Chat streams + sources                        | Failed→Fixed |
| dashboard   | DASH-001   | Dashboard overview                            | Did not run |
| knowledge-base | KNOW-001 | Knowledge Ready + preview                     | Failed→Fixed |
| knowledge-base | KNOW-002 | Delete knowledge                              | Did not run |
| api         | API-001    | Valid key → response                          | Failed   |
| api         | API-002    | Invalid key → 401                            | Did not run |
| admin       | ADMIN-001  | Non-admin blocked from admin                  | Failed   |
| admin       | ADMIN-002  | Admin loads admin page                        | Did not run |
| billing     | BILL-001   | Billing page for user                         | Failed   |
| responsive  | RESP-001   | Mobile landing                               | Passed   |
| responsive  | RESP-002   | Tablet landing                               | Passed   |
| responsive  | RESP-003   | Desktop login                                | Passed   |

---

## PART 4 — FILES REFERENCE

- **Config:** `playwright.config.ts`
- **Specs:** `e2e/auth.spec.ts`, `e2e/landing.spec.ts`, `e2e/public-chatbot.spec.ts`, `e2e/dashboard.spec.ts`, `e2e/knowledge-base.spec.ts`, `e2e/api.spec.ts`, `e2e/admin.spec.ts`, `e2e/billing.spec.ts`, `e2e/responsive.spec.ts`
- **Helpers:** `e2e/helpers/auth.ts`, `e2e/helpers/seed.ts`, `e2e/helpers/stream.ts`
- **Reports:** `QA_REPORT.md` (verdict and recommendations), this file (`QA_TEST_CASES_SUMMARY.md`)

---

## PART 5 — NEXT STEPS

1. **Ensure app and backend are running** at `http://localhost:8080` with valid Supabase (and env).
2. **Set QA credentials** (`QA_USER_EMAIL`, `QA_USER_PASSWORD`) for a verified account to avoid signup/email-verification blocks.
3. **Re-run:** `npm run e2e` after the fixes; expect more passes if login succeeds.
4. **Re-assess production readiness** when login-dependent tests pass and pass rate is high.

---

*End of QA Test Cases Summary. No API keys or secrets are included.*
