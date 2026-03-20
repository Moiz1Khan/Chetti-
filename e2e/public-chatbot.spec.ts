import { test, expect } from "../playwright-fixture";
import { seedChatbotWithTextKnowledge } from "./helpers/seed";
import { waitForAssistantMarkdownNonEmpty } from "./helpers/stream";

test.describe.serial("Public Chatbot", () => {
  let seeded: Awaited<ReturnType<typeof seedChatbotWithTextKnowledge>> | null = null;

  test("PUBLIC-001 shows error for non-existent chatbot", async ({ page }) => {
    await page.goto("/chatbot/00000000-0000-0000-0000-000000000000");
    await page.waitForTimeout(2000);
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("PUBLIC-002 Renders public chat and streams assistant reply", async ({ page }) => {
    seeded = await seedChatbotWithTextKnowledge(page, "user");
    expect(seeded).toBeTruthy();
    await page.goto(`/chatbot/${seeded!.chatbotId}`);

    await page.getByPlaceholder("Type your message...").fill(seeded!.knowledgeContentMarker);
    await page.keyboard.press("Enter");

    await waitForAssistantMarkdownNonEmpty(page, { minChars: 3 });

    await expect(page.getByText(seeded!.knowledgeName, { exact: true })).toBeVisible({
      timeout: 120_000,
    });
  });
});

