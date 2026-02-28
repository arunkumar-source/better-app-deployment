import { describe, expect, test, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddWork } from "@/components/AddWork/add-work";
import { KanbanBoard } from "@/components/AddWork/kanban-board";
import { $api } from "@/lib/api-client";

const mutateAsyncMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock("@/lib/api-client", () => ({
  $api: {
    useMutation: vi.fn(),
    useQuery: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

const END_DATE_REGEX = /end date/i;
const LOADING_TEXT = /Loading tasks/i;

describe("AddWork Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("submits form successfully", async () => {
    const onOpenChangeMock = vi.fn();

    vi.mocked($api.useMutation).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as any);

    render(<AddWork open={true} onOpenChange={onOpenChangeMock} />);

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Test Task" },
    });

    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "This is a test description" },
    });

    fireEvent.change(screen.getByLabelText(END_DATE_REGEX), {
      target: { value: "2026-03-01" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "in-progress" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Work" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });
});

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows loading state", () => {
    vi.mocked($api.useQuery).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    render(<KanbanBoard />);

    expect(screen.getByText(LOADING_TEXT)).toBeDefined();
  });
});
