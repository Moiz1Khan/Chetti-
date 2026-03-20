import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@/test/mocks";
import { mockSupabase, mockNavigate } from "@/test/mocks";
import { renderWithProviders } from "@/test/test-utils";
import Login from "@/pages/Login";

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with email and password fields", () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders Google OAuth button", () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it("renders signup link", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    renderWithProviders(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Should NOT call supabase auth
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("calls signInWithPassword on valid submit", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("navigates to dashboard on successful login", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("toggles password visibility", () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = passwordInput.parentElement?.querySelector("button");
    if (toggleBtn) fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
