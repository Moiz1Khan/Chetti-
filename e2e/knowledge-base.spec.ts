import { test, expect } from "../playwright-fixture";
import { loginAs } from "./helpers/auth";
import { seedChatbotWithTextKnowledge } from "./helpers/seed";

test.describe.serial("Knowledge Base", () => {
  let seeded: Awaited<ReturnType<typeof seedChatbotWithTextKnowledge>> | null = null;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "user");
  });

  test("KNOW-001 Shows processed knowledge as Ready and preview contains extracted content", async ({ page }) => {
    seeded = await seedChatbotWithTextKnowledge(page, "user");
    expect(seeded).toBeTruthy();
    await page.goto("/dashboard/knowledge");

    const row = page.locator("div").filter({ has: page.locator(`text=${seeded!.knowledgeName}`) }).first();
    await expect(row.getByText("Ready", { exact: true })).toBeVisible({ timeout: 30_000 });

    // Click preview (Eye icon button) which should be before the trash icon.
    const iconButtons = row.locator("button");
    await iconButtons.first().click();

    await expect(page.getByText(seeded!.knowledgeName, { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(seeded!.knowledgeContentMarker, { exact: false })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("KNOW-002 Delete knowledge removes the record", async ({ page }) => {
    if (!seeded) throw new Error("KNOW-002 depends on KNOW-001.");
    await page.goto("/dashboard/knowledge");

    const row = page.locator("div").filter({ has: page.locator(`text=${seeded!.knowledgeName}`) }).first();
    const iconButtons = row.locator("button");
    const trashButton = iconButtons.last();

    await trashButton.click();

    // Confirm in the alert dialog.
    await page.getByRole("button", { name: /^Delete$/i }).click();

    // Row should eventually disappear.
    await expect(page.getByText(seeded!.knowledgeName, { exact: true })).toHaveCount(0, { timeout: 60_000 });
  });
});

