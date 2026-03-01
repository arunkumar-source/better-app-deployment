"use client";

import type { Work, WorkStatus } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { useForm } from "react-hook-form";
import { $api } from "@/lib/api-client";

interface FormValues {
  description: string;
  endDate?: string;
  endTime?: string;
  status: WorkStatus;
  title: string;
}

function formatDateForInputs(isoString?: string) {
  if (!isoString) {
    return { date: "", time: "" };
  }

  const local = new Date(isoString);

  const date = local.toLocaleDateString("en-CA");
  const time = local.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { date, time };
}

export function EditWorkSheet({
  work,
  children,
  onOperationStart,
  onOperationEnd,
}: {
  work: Work;
  children: React.ReactNode;
  onOperationStart?: () => void;
  onOperationEnd?: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateWork } = $api.useMutation(
    "patch",
    "/api/update/{id}"
  );

  // ✅ Convert UTC → local for display
  const { date, time } = formatDateForInputs(work.endDate);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    values: {
      title: work.title ?? "",
      description: work.description ?? "",
      status: work.status ?? "todo",
      endDate: date,
      endTime: time,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    let finalEndDate: string | undefined;
    if (data.endDate && data.endTime) {
      const localDate = new Date(`${data.endDate}T${data.endTime}:00`);
      finalEndDate = localDate.toISOString();
    } else if (data.endDate) {
      const localDate = new Date(data.endDate);
      finalEndDate = localDate.toISOString();
    }

    onOperationStart?.();

    await updateWork(
      {
        params: {
          path: { id: work.id },
        },
        body: {
          title: data.title,
          description: data.description,
          status: data.status,
          endDate: finalEndDate,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["get", "/api"] });
        },
        onSettled: () => {
          onOperationEnd?.();
        },
      }
    );
  });

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="p-6">
        <SheetHeader>
          <SheetTitle>Edit Work</SheetTitle>
          <SheetDescription>Update work item details</SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-6 text-white" onSubmit={onSubmit}>
          {/* Title */}
          <div>
            <label className="mb-1 block font-medium text-sm" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters long",
                },
              })}
            />
            {formState.errors.title && (
              <p className="mt-1 text-red-500 text-sm">
                {formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              className="mb-1 block font-medium text-sm"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters long",
                },
              })}
              className="h-24 w-full resize-none rounded-md border border-gray-300 bg-black p-2 text-white"
            />
            {formState.errors.description && (
              <p className="mt-1 text-red-500 text-sm">
                {formState.errors.description.message}
              </p>
            )}
          </div>

          {/* End Date & Time */}
          <div>
            <label
              className="mb-1 block font-medium text-sm"
              htmlFor="end-date"
            >
              End Date (Optional)
            </label>
            <div className="space-y-2">
              <Input
                id="end-date"
                type="date"
                {...register("endDate")}
                className="bg-black text-white"
                min={new Date().toISOString().split("T")[0]}
              />
              <Input
                type="time"
                {...register("endTime")}
                className="bg-black text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="mb-1 block font-medium text-sm">Status</div>
            <select
              {...register("status")}
              className="w-full rounded-md border bg-black p-2 text-white"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancel</option>
            </select>
          </div>

          <Button disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
