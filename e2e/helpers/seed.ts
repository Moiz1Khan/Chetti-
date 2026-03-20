import { expect, type Page } from "@playwright/test";
import { loginAs } from "./auth";

type SeededChatbot = {
  chatbotId: string;
  chatbotName: string;
  knowledgeName: string;
  knowledgeContentMarker: string;
};

function uniqueSuffix() {
  // Avoid leaking secrets; randomness is only for record tagging.
  return Date.now().toString(36);
}

async function waitForRowHasStatus(page: Page, fileName: string, status: string) {
  const row = page.locator("div").filter({ has: page.locator(`text=${fileName}`) }).first();
  // Row can contain multiple "Ready" nodes (badge, label); use .first() so locator is unique.
  await expect(row.getByText(status, { exact: true }).first()).toBeVisible({ timeout: 120_000 });
}

export async function seedChatbotWithTextKnowledge(page: Page, role: "user"): Promise<SeededChatbot> {
  const suffix = uniqueSuffix();
  const knowledgeName = `QA_Test_Knowledge_${suffix}`;
  const knowledgeContentMarker = `QATestMarker${suffix}`;
  const knowledgeContent = `Chetti QA marker: ${knowledgeContentMarker}. This is deterministic test content for RAG.`;
  const chatbotName = `QA_Test_Chatbot_${suffix}`;

  await loginAs(page, role);

  // 1) Create knowledge (Text tab)
  await page.goto("/dashboard/knowledge");
  await page.getByRole("button", { name: /add knowledge/i }).click();
  await page.getByRole("tab", { name: /text/i }).click();

  // Fill dialog fields
  // Inputs don't use Radix Label "for" linkage; use placeholders instead.
  await page.getByPlaceholder("Company FAQ").fill(knowledgeName);
  await page.getByPlaceholder("Paste your text content here...").fill(knowledgeContent);

  await page.getByRole("button", { name: /upload & process/i }).click();

  // Wait for index to complete
  await waitForRowHasStatus(page, knowledgeName, "Ready");

  // 2) Create chatbot and link the ready knowledge before saving
  await page.goto("/dashboard/chatbots/builder/new");

  // Basic fields
  await page.getByPlaceholder("My Support Bot").fill(chatbotName);
  // System Prompt optional (skip); we only need RAG + streaming smoke.

  // Link knowledge (item may be disabled until ready; wait for it to be clickable)
  await page.getByRole("tab", { name: /know/i }).click();
  const knowledgeItem = page.locator("label").filter({ hasText: knowledgeName }).first();
  await expect(knowledgeItem).toBeEnabled({ timeout: 60_000 });
  await knowledgeItem.click();

  await page.getByRole("button", { name: /save/i }).click();

  // After save for new bot, it navigates away from /new to /builder/:id
  await page.waitForURL(/\/dashboard\/chatbots\/builder\/.+$/, { timeout: 120_000 });

  const url = page.url();
  const match = url.match(/builder\/([^/]+)/);
  if (!match?.[1]) throw new Error("Failed to extract chatbot id from URL after save.");

  const chatbotId = match[1];
  return { chatbotId, chatbotName, knowledgeName, knowledgeContentMarker };
}

