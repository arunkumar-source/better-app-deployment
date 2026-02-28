import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "@/components/login/login";
import { loginUser } from "@/lib/auth-api";

vi.mock("@/lib/auth-api", () => ({
  loginUser: vi.fn(),
}));

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("Login Page", () => {
  test("login page testing is successful", async () => {
    render(<LoginPage />);

    const mockedLogin = vi.mocked(loginUser);
    mockedLogin.mockResolvedValue({} as Awaited<ReturnType<typeof loginUser>>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Login" })
    ).toBeDefined();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "arun@gmail.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "arun@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("arun@gmail.com", "arun@123");

      expect(pushMock).toHaveBeenCalledWith("/AddWorkKanban");
    });
  });
});
