import type { Page } from "@playwright/test";

export async function waitForAssistantMarkdownNonEmpty(
  page: Page,
  opts: { timeoutMs?: number; minChars?: number } = {},
) {
  const { timeoutMs = 120_000, minChars = 3 } = opts;

  await page.waitForFunction(
    ({ minChars }) => {
      const els = Array.from(document.querySelectorAll("div.prose"));
      return els.some((el) => (el.textContent || "").trim().length >= minChars);
    },
    { timeout: timeoutMs },
    { minChars },
  );
}

