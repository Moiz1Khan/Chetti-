import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "@/test/mocks";
import { mockSupabase } from "@/test/mocks";
import { renderWithProviders } from "@/test/test-utils";
import BillingPage from "@/pages/dashboard/BillingPage";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-123", email: "test@test.com" }, loading: false }),
}));

describe("BillingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { subscribed: false, product_id: null, subscription_end: null },
      error: null,
    });
  });

  it("renders billing heading", () => {
    renderWithProviders(<BillingPage />);
    expect(screen.getByText("Billing")).toBeInTheDocument();
  });

  it("renders all three plan cards", async () => {
    renderWithProviders(<BillingPage />);
    await waitFor(() => {
      expect(screen.getAllByText("Free").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Pro")).toBeInTheDocument();
      expect(screen.getByText("Agency")).toBeInTheDocument();
    });
  });

  it("shows free as current plan for unsubscribed users", async () => {
    renderWithProviders(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Current Plan: Free/)).toBeInTheDocument();
    });
  });

  it("shows prices correctly", async () => {
    renderWithProviders(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("$0")).toBeInTheDocument();
      expect(screen.getByText("$29")).toBeInTheDocument();
      expect(screen.getByText("$99")).toBeInTheDocument();
    });
  });

  it("calls check-subscription on mount", async () => {
    renderWithProviders(<BillingPage />);
    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith("check-subscription");
    });
  });

  it("shows active subscription state", async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: {
        subscribed: true,
        product_id: "prod_UAPii7iQr8WcJO",
        subscription_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      error: null,
    });

    renderWithProviders(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Current Plan: Pro/)).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });
});
