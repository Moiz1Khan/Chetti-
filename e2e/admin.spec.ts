import { test, expect } from "../playwright-fixture";
import { loginAs } from "./helpers/auth";

test.describe.serial("Admin", () => {
  test("ADMIN-001 Non-admin can’t access /dashboard/admin", async ({ page }) => {
    await loginAs(page, "user");
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /access denied/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/admin privileges/i)).toBeVisible({ timeout: 30_000 });
  });

  test("ADMIN-002 Admin can load admin page without crashing", async ({ page }) => {
    if (!process.env.QA_ADMIN_EMAIL || !process.env.QA_ADMIN_PASSWORD) {
      test.skip(true, "QA_ADMIN_EMAIL/QA_ADMIN_PASSWORD not provided; cannot validate admin role-based flows");
    }
    await loginAs(page, "admin");
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 30_000 });
  });
});

