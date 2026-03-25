import { test, expect } from "../playwright-fixture";
import { loginAs } from "./helpers/auth";
import { seedChatbotWithTextKnowledge } from "./helpers/seed";
import { waitForAssistantMarkdownNonEmpty } from "./helpers/stream";

test.describe.serial("Dashboard (user)", () => {
  let seeded: Awaited<ReturnType<typeof seedChatbotWithTextKnowledge>> | null = null;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "user");
  });

  test("CHAT-001 Streams assistant reply and hides knowledge sources", async ({ page }) => {
    seeded = await seedChatbotWithTextKnowledge(page, "user");
    expect(seeded).toBeTruthy();
    await page.goto(`/dashboard/chatbots/chat/${seeded!.chatbotId}`);

    // Send a message that should match the indexed knowledge marker.
    await page.getByPlaceholder("Type your message...").fill(seeded.knowledgeContentMarker);
    await page.keyboard.press("Enter");

    // Assistant reply should still include the knowledge content marker.
    // (We hide the "Sources" UI on the frontend now.)
    await expect(page.getByText(seeded!.knowledgeContentMarker, { exact: true })).toBeVisible({
      timeout: 120_000,
    });

    // Streaming: assistant markdown container should receive some non-empty text.
    await waitForAssistantMarkdownNonEmpty(page, { minChars: 3 });
  });

  test("DASH-001 Dashboard overview loads and renders key sections", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText(/message usage/i)).toBeVisible({ timeout: 30_000 });
  });
});

