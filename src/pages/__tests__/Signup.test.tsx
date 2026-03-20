import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@/test/mocks";
import { mockSupabase } from "@/test/mocks";
import { renderWithProviders } from "@/test/test-utils";
import Signup from "@/pages/Signup";

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form with all fields", () => {
    renderWithProviders(<Signup />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("validates minimum password length", async () => {
    renderWithProviders(<Signup />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("calls signUp with correct data", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ error: null });
    renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "john@example.com",
          password: "password123",
          options: expect.objectContaining({
            data: { full_name: "John Doe" },
          }),
        })
      );
    });
  });

  it("renders login link", () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
});
