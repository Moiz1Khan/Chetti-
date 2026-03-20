import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import "@/test/mocks";
import { renderWithAuth } from "@/test/test-utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { mockSupabase } from "@/test/mocks";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner while auth is loading", () => {
    // Auth loading state: onAuthStateChange fires but getSession hasn't resolved
    mockSupabase.auth.getSession.mockReturnValue(new Promise(() => {})); // never resolves
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated", async () => {
    const mockSession = { user: { id: "123", email: "test@test.com" } };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      cb("SIGNED_IN", mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for auth to resolve - the content should appear
    // Since the mock fires synchronously, content should be present
    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
  });
});
