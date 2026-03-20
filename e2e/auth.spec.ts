import { test, expect } from "../playwright-fixture";
import { loginAs, logout } from "./helpers/auth";

test.describe("Authentication", () => {
  test("AUTH-001 Login page renders required fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("AUTH-001B Signup page renders required fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("AUTH-002 Forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("AUTH-004 Protected route redirects to login when logged out", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/login/);
  });

  test("AUTH-003 Invalid login shows safe fallback", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /login/i }).click();
    // Should show toast or stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test("AUTH-005 Signup validates password length (client-side)", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /create account/i }).click();
    // Should stay on signup page due to validation
    await expect(page).toHaveURL(/signup/);
  });

  test("AUTH-006 Valid user login redirects to dashboard", async ({ page }) => {
    await loginAs(page, "user");
    await expect(page).toHaveURL(/\/dashboard(\/|$)/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("AUTH-007 Logout returns to landing", async ({ page }) => {
    await loginAs(page, "user");
    await logout(page);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
  });
});

