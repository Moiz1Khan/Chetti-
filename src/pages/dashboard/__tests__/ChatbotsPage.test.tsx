import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "@/test/mocks";
import { mockSupabase } from "@/test/mocks";
import { renderWithProviders } from "@/test/test-utils";
import ChatbotsPage from "@/pages/dashboard/ChatbotsPage";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-123" }, loading: false }),
}));

describe("ChatbotsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it("renders My Chatbots heading", () => {
    renderWithProviders(<ChatbotsPage />);
    expect(screen.getByText("My Chatbots")).toBeInTheDocument();
  });

  it("shows empty state when no chatbots", async () => {
    renderWithProviders(<ChatbotsPage />);
    await waitFor(() => {
      expect(screen.getByText("No chatbots yet")).toBeInTheDocument();
    });
  });

  it("shows create chatbot button", () => {
    renderWithProviders(<ChatbotsPage />);
    expect(screen.getByText(/create chatbot/i)).toBeInTheDocument();
  });

  it("renders chatbot cards when data exists", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "bot-1",
              name: "Support Bot",
              description: "Helps customers",
              status: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    renderWithProviders(<ChatbotsPage />);
    await waitFor(() => {
      expect(screen.getByText("Support Bot")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });
});
