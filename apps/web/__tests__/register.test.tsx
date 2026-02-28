import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { registerUser } from "@/lib/auth-api";
import RegisterPage from "@/components/register/register";

vi.mock("@/lib/auth-api", () => ({
  registerUser: vi.fn(),
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

describe("register Page", () => {
  test("register page testing is successful", async () => {
    render(<RegisterPage />);

    const mockedLogin = vi.mocked(registerUser);
    mockedLogin.mockResolvedValue(
      {} as Awaited<ReturnType<typeof registerUser>>
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Create Account" })
    ).toBeDefined();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Arun" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "arun@gmail.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "arun@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(
        "Arun",
        "arun@gmail.com",
        "arun@123"
      );

      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });
});
