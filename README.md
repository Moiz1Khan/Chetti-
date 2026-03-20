# Welcome to your Lovable project

TODO: Document your project here

## E2E testing (Playwright)

- **Server**: Start the app before running E2E so it is available at `http://localhost:8080`:
  - `npm run dev` (Vite is configured to use port 8080)
- **Optional env (recommended for CI/staging)**: Pre-created accounts avoid signup/email verification.
  - `QA_USER_EMAIL`, `QA_USER_PASSWORD` — regular user
  - `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` — admin (for admin tests)
  - If unset, tests use signup fallback where supported.
- **Install browsers** (first time): `npx playwright install chromium`
- **Run E2E**: `npm run e2e` or `npx playwright test`
- **Headed (see browser)**: `npm run e2e:headed`
- **Custom base URL**: `PLAYWRIGHT_BASE_URL=https://your-app.example.com npx playwright test`
