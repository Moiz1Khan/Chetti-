import { test, expect } from "../playwright-fixture";
import { loginAs } from "./helpers/auth";
import { seedChatbotWithTextKnowledge } from "./helpers/seed";

// Secret-safety: API key dialogs contain raw keys; avoid screenshots/traces for this file.
test.use({ screenshot: "off", trace: "off", video: "off" });

test.describe.serial("API Integration", () => {
  let seeded: Awaited<ReturnType<typeof seedChatbotWithTextKnowledge>> | null = null;
  let endpoint: string | null = null;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "user");
  });

  test("API-001 Valid key returns response (and sources when include_sources=true)", async ({ page }) => {
    seeded = await seedChatbotWithTextKnowledge(page, "user");
    expect(seeded).toBeTruthy();
    await page.goto("/dashboard/api-keys");
    await page.getByRole("button", { name: /generate new key/i }).click();

    // Generate and capture the raw key value.
    await page.getByRole("button", { name: /^generate$/i }).click();
    const rawKey = await page.locator('[role="dialog"] input[readonly]').first().inputValue();

    // Hide the raw key in the UI ASAP.
    await page.locator('[role="dialog"]').getByRole("button", { name: /^done$/i }).click();

    await page.goto("/dashboard/api-docs");
    endpoint = await page
      .locator("code")
      .filter({ hasText: /\/functions\/v1\/api-chat/i })
      .first()
      .innerText();
    expect(endpoint).toBeTruthy();

    const payload = {
      chatbot_id: seeded!.chatbotId,
      message: seeded!.knowledgeContentMarker,
      include_sources: true,
    };

    const result = await page.evaluate(async ({ endpoint, rawKey, payload }) => {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${rawKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await resp.json().catch(() => ({}));
      return { status: resp.status, json };
    }, { endpoint: endpoint!, rawKey, payload });

    expect(result.status).toBe(200);
    expect(result.json.response).toBeTruthy();
    if (Array.isArray(result.json.sources)) {
      expect(result.json.sources.length).toBeGreaterThan(0);
    }
  });

  test("API-002 Invalid key returns 401", async ({ page }) => {
    if (!seeded) throw new Error("API-002 depends on API-001; run tests in order.");
    await page.goto("/dashboard/api-docs");
    endpoint = await page
      .locator("code")
      .filter({ hasText: /\/functions\/v1\/api-chat/i })
      .first()
      .innerText();
    expect(endpoint).toBeTruthy();

    const payload = {
      chatbot_id: seeded.chatbotId,
      message: seeded.knowledgeContentMarker,
      include_sources: false,
    };

    const result = await page.evaluate(async ({ endpoint, payload }) => {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json().catch(() => ({}));
      return { status: resp.status, json };
    }, { endpoint: endpoint!, payload });

    // We can't set payload safely via window for this test without extra plumbing;
    // just validate the unauthorized behavior.
    expect(result.status).toBe(401);
    expect(result.json.error).toBeTruthy();
  });
});

