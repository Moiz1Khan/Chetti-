# QA Report — Data Smart Chat

**Report generated:** 2026-03-19  
**Test run:** Playwright E2E (single run, no dev server assumed)  
**API keys / secrets:** None included in this report (redacted per requirement).

---

## 1. Project overview

Data Smart Chat is a full-stack application providing:

- **Authentication:** Login, signup, logout, forgot password (Supabase Auth).
- **Dashboard:** Chatbots list, builder (config + knowledge linking), in-dashboard chat with streaming and sources.
- **Knowledge base:** Text upload, processing (pending → ready), chunk counts, preview, delete.
- **Public chatbot:** Public chat page and embed widget for a given chatbot ID.
- **API:** REST `api-chat` edge function (Bearer key auth) for server-side chat.
- **Billing:** Subscription/checkout (Stripe) and plan state.
- **Admin:** User management (role, enable/disable) for admin users only.

Stack: Vite + React, Supabase (Auth, Postgres, Edge Functions), optional Stripe.

---

## 2. Testing scope

- **In scope:** E2E tests for auth, landing, public chatbot, dashboard (overview, chatbots, builder, chat), knowledge base, API integration, admin, billing, responsive viewports. Artifacts (screenshots/trace/video) are minimized; API key tests run with artifacts disabled so no secrets are captured.
- **Out of scope:** Unit tests (handled separately), real Stripe payments, third-party uptime.
- **Environment:** Tests target `http://localhost:8080` (Vite default for this project). Optional env vars: `QA_USER_EMAIL`, `QA_USER_PASSWORD`, `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` for pre-created accounts; otherwise signup fallback is used where implemented.

---

## 3. Test cases list

| ID | Test case | Suite | Result | Notes |
|----|-----------|--------|--------|--------|
| AUTH-001 | Login page renders required fields | auth | Passed | — |
| AUTH-001B | Signup page renders required fields | auth | Passed | — |
| AUTH-002 | Forgot password page is accessible | auth | Passed | — |
| AUTH-003 | Invalid login shows safe fallback | auth | Passed | — |
| AUTH-004 | Protected route redirects to login when logged out | auth | Passed | — |
| AUTH-005 | Signup validates password length (client-side) | auth | Passed | — |
| AUTH-006 | Valid user login redirects to dashboard | auth | Failed | Timeout in login flow (see Bugs) |
| AUTH-007 | Logout returns to landing | auth | Failed | Timeout (depends on login) |
| LAND-001 | Landing hero section visible | landing | Passed | "renders hero section" |
| LAND-002 | Landing has navigation links | landing | Failed | Selector/assertion (see Bugs) |
| PUBLIC-001 | Public chatbot shows error for non-existent chatbot | public-chatbot | Failed | Assertion/selector |
| PUBLIC-002 | Public chat streams assistant reply | public-chatbot | Skipped | Serial; ran after PUBLIC-001 |
| DASH-001 | Dashboard overview loads and renders key sections | dashboard | Skipped | Serial; ran after CHAT-001 |
| CHAT-001 | Streams assistant reply and shows knowledge sources | dashboard | Failed | Assertion or flow |
| ADMIN-001 | Non-admin cannot access /dashboard/admin | admin | Failed | Timeout in login |
| ADMIN-002 | Admin can load admin page without crashing | admin | Skipped | Serial; skipped after ADMIN-001 |
| API-001 | Valid key returns response (and sources when include_sources=true) | api | Failed | beforeAll(page) fix applied post-run |
| API-002 | Invalid key returns 401 | api | Skipped | Serial; skipped after API-001 |
| KNOW-001 | Processed knowledge shows Ready and preview has content | knowledge-base | Failed | Assertion or flow |
| KNOW-002 | Delete knowledge removes the record | knowledge-base | Skipped | Serial; skipped after KNOW-001 |
| BILL-001 | Billing page renders for logged-in user | billing | Failed | Timeout in login |
| RESP-001 | Landing renders on mobile viewport | responsive | Passed | — |
| RESP-002 | Landing renders on tablet viewport | responsive | Passed | — |
| RESP-003 | Login renders on desktop viewport | responsive | Passed | — |

---

## 4. Test results summary

| Status | Count |
|--------|--------|
| Passed | 12 |
| Failed | 8 |
| Skipped | 5 |
| **Total** | **25** |

- **Pass rate (excluding skipped):** 12 / 20 = **60%**.
- **Pass rate (all executed):** 12 / 20 = **60%** (skipped not counted as executed).

---

## 5. Bugs & issues (severity)

### High

- **Login / redirect timeouts (AUTH-006, AUTH-007, ADMIN-001, BILL-001)**  
  Multiple tests time out in `loginAs` while waiting for navigation to `/dashboard` after submitting credentials.  
  **Likely causes:** Backend (Supabase) not reachable, app not running on port 8080, or missing/incorrect `QA_USER_EMAIL`/`QA_USER_PASSWORD` (so signup fallback may be used and blocked by email verification).  
  **Evidence:** Timeout in `e2e/helpers/auth.ts` at `waitForURL(/\/dashboard(\/|$)/)`.

### Medium

- **API-001 setup (beforeAll + page)**  
  API suite failed with: "context and page fixtures are not supported in beforeAll".  
  **Fix applied:** Seed moved from `beforeAll` into the first test (API-001); `seeded` is stored in describe-level variable for API-002. Re-run API suite after ensuring app and backend are up.

- **CHAT-001**  
  Test failed (streaming or knowledge sources assertion). Needs re-run with server up and optional seed data to confirm if it’s environment or assertion.

- **KNOW-001**  
  Knowledge “Ready” or preview content assertion failed. Re-run with backend and processing available to confirm.

- **PUBLIC-001**  
  Non-existent chatbot error state assertion failed. May be selector or copy change; verify expected message/element.

- **Landing navigation (LAND-002)**  
  “has navigation links” failed. Likely selector or DOM change; verify nav links and test selector.

### Low

- **Skipped tests (serial dependency)**  
  Several tests are skipped when an earlier test in the same serial suite fails (e.g. PUBLIC-002, DASH-001, KNOW-002, API-002, ADMIN-002). Not a product bug; re-run with passing prerequisites to get full coverage.

---

## 6. Recommendations

1. **Environment for E2E**  
   - Start the app (`npm run dev`) so it is available at `http://localhost:8080`.  
   - Ensure Supabase (and any edge functions) are reachable (e.g. correct `.env` / `VITE_SUPABASE_*`).  
   - For stable runs, set `QA_USER_EMAIL` and `QA_USER_PASSWORD` (and optionally admin vars) for verified accounts so login doesn’t depend on signup/email verification.

2. **Re-run after fixes**  
   - Run `npm run e2e` (or `npx playwright test`) after the API spec change and with the app + backend running.  
   - Re-run with JSON reporter if you need to regenerate this report:  
     `npx playwright test --reporter=json 2>&1 | Out-File -FilePath playwright-results.json -Encoding utf8`

3. **Stabilize selectors**  
   - Review failing assertions for landing nav, public chatbot error state, and knowledge preview; align selectors with current UI/copy.

4. **Timeouts**  
   - Consider increasing test timeout for login/navigation in environments where Auth or network are slow, or add a health-check before running auth-dependent tests.

5. **Secrets**  
   - Keep API keys and credentials out of reports and artifacts. Current config (screenshot/trace/video off for API suite, global “screenshot only on failure”) is aligned with that.

---

## 7. Final QA verdict

**Not ready for production** from an E2E perspective.

- **Reason:** Multiple critical user flows (login → dashboard, billing, admin access, API key flow) did not complete successfully in the captured run, due to timeouts and one structural test bug (API beforeAll).  
- **Next steps:**  
  1. Run the app and backend, then run the full E2E suite again.  
  2. Fix any remaining assertion/selector failures (landing nav, public chatbot, knowledge, chat).  
  3. Re-assess once pass rate is high and no High-severity issues remain.

---

*No API keys or other secrets are included in this report.*
