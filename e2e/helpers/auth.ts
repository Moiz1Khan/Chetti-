import type { Page } from "@playwright/test";

type AccountRole = "user" | "admin";

type AccountCreds = { email: string; password: string };

function envAccount(role: AccountRole): AccountCreds | null {
  const emailVar = role === "user" ? "QA_USER_EMAIL" : "QA_ADMIN_EMAIL";
  const passVar = role === "user" ? "QA_USER_PASSWORD" : "QA_ADMIN_PASSWORD";
  const email = process.env[emailVar];
  const password = process.env[passVar];
  if (!email || !password) return null;
  return { email, password };
}

const DEFAULT_PASSWORD = "QaE2EPass!123";

const cached: Partial<Record<AccountRole, AccountCreds>> = {};

function escapeForRegex(literal: string) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getAccount(role: AccountRole): AccountCreds {
  const env = envAccount(role);
  if (env) return env;
  const fromCache = cached[role];
  if (!fromCache) {
    throw new Error(
      `Missing creds for ${role}. Set QA_USER_EMAIL/QA_USER_PASSWORD (and QA_ADMIN_EMAIL/QA_ADMIN_PASSWORD for admin) or allow signup fallback.`,
    );
  }
  return fromCache;
}

export async function loginAs(page: Page, role: AccountRole) {
  const env = envAccount(role);
  if (env) {
    cached[role] = env; // so logout can reliably locate user dropdown
    await loginWithCreds(page, env);
    return;
  }

  // Signup fallback: create a new user (once per run) and then login.
  if (!cached[role]) {
    const unique = Date.now().toString(36);
    const email = `qa_${role}_${unique}@example.com`;
    cached[role] = { email, password: DEFAULT_PASSWORD };

    await signupViaUI(page, { email, password: DEFAULT_PASSWORD, fullName: "QA E2E User" });
  }

  await loginWithCreds(page, cached[role]!);
}

export async function logout(page: Page) {
  const { email } = getAccount("user");

  // Trigger the user dropdown. UI may show email or display name (e.g. "MK Moiz Khan").
  const emailRegex = new RegExp(escapeForRegex(email), "i");
  const nameRegex = /moiz|khan|mk|user|account|profile/i; // fallback when UI shows display name
  const menuTrigger = page
    .getByRole("button", { name: emailRegex })
    .or(page.getByRole("button", { name: nameRegex }).first());
  await menuTrigger.click();
  await page.getByRole("menuitem", { name: /sign out/i }).click();

  await page.waitForURL("/", { timeout: 60_000 });
}

async function loginWithCreds(page: Page, creds: AccountCreds) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: /login/i }).click();

  // Protected routes resolve after AuthContext loads.
  await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 60_000 });
}

async function signupViaUI(
  page: Page,
  opts: { email: string; password: string; fullName: string },
) {
  await page.goto("/signup");
  await page.getByLabel("Full Name").fill(opts.fullName);
  await page.getByLabel("Email").fill(opts.email);
  await page.getByLabel("Password").fill(opts.password);
  await page.getByRole("button", { name: /create account/i }).click();

  // UI navigates to /login after signup attempt.
  await page.waitForURL(/\/login/, { timeout: 60_000 });
}


