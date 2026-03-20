import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@/test/mocks";
import { mockSupabase } from "@/test/mocks";
import { renderWithProviders } from "@/test/test-utils";
import ApiKeysPage from "@/pages/dashboard/ApiKeysPage";

// Mock useAuth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-123", email: "test@test.com" }, loading: false }),
}));

describe("ApiKeysPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it("renders the API Keys heading", async () => {
    renderWithProviders(<ApiKeysPage />);
    expect(screen.getByText("API Keys")).toBeInTheDocument();
  });

  it("shows empty state when no keys exist", async () => {
    renderWithProviders(<ApiKeysPage />);
    await waitFor(() => {
      expect(screen.getByText("No API keys yet")).toBeInTheDocument();
    });
  });

  it("shows generate key button", () => {
    renderWithProviders(<ApiKeysPage />);
    expect(screen.getByText(/generate/i)).toBeInTheDocument();
  });

  it("renders keys list when keys exist", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: "k1", name: "Test Key", key_prefix: "cbai_abc123...", revoked: false, created_at: new Date().toISOString() },
          ],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    renderWithProviders(<ApiKeysPage />);
    await waitFor(() => {
      expect(screen.getByText("Test Key")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });
});
