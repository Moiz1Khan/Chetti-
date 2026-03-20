import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000, // Login/navigation can take up to 60s; allow buffer.
  workers: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080",
    // Security: keep artifacts minimal to avoid capturing sensitive UI (e.g. API keys).
    trace: "off",
    video: "off",
    screenshot: "only-on-failure",
  },
  reporter: [["html", { open: "never" }]],
});
