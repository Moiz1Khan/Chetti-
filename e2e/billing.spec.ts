import { test, expect } from "../playwright-fixture";
import { loginAs } from "./helpers/auth";

test.describe.serial("Billing", () => {
  test("BILL-001 Billing page renders for logged-in user", async ({ page }) => {
    await loginAs(page, "user");
    await page.goto("/dashboard/billing");
    await expect(page.getByRole("heading", { name: /billing/i })).toBeVisible({ timeout: 30_000 });
  });
});

