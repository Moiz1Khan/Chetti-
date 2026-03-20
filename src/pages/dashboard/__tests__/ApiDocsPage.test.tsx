import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "@/test/mocks";
import { mockSupabase } from "@/test/mocks";
import { renderWithProviders } from "@/test/test-utils";
import ApiDocsPage from "@/pages/dashboard/ApiDocsPage";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-123" }, loading: false }),
}));

describe("ApiDocsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders API documentation heading", () => {
    renderWithProviders(<ApiDocsPage />);
    expect(screen.getByText("API Documentation")).toBeInTheDocument();
  });

  it("renders overview section", () => {
    renderWithProviders(<ApiDocsPage />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders authentication section", () => {
    renderWithProviders(<ApiDocsPage />);
    expect(screen.getByText("Authentication")).toBeInTheDocument();
  });

  it("renders chat endpoint section", () => {
    renderWithProviders(<ApiDocsPage />);
    expect(screen.getByText("Chat Endpoint")).toBeInTheDocument();
  });

  it("renders error codes section", () => {
    renderWithProviders(<ApiDocsPage />);
    expect(screen.getByText("Error Codes")).toBeInTheDocument();
  });

  it("renders code example tabs", () => {
    renderWithProviders(<ApiDocsPage />);
    expect(screen.getByText("cURL")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
});
