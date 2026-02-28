"use client";

import type { WorkStatus } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { $api } from "@/lib/api-client";

interface AddWorkProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

interface FormValues {
  description: string;
  endDate: string;
  endTime: string;
  status: WorkStatus;
  title: string;
}

export function AddWork({ open, onOpenChange }: AddWorkProps) {
  const queryClient = useQueryClient();
  const createWork = $api.useMutation("post", "/api/add");

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      endDate: "",
      endTime: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const endDate =
        data.endDate && data.endTime
          ? `${data.endDate}T${data.endTime}:00`
          : data.endDate;

      await createWork.mutateAsync({
        body: {
          title: data.title,
          description: data.description,
          status: data.status,
          endDate,
        },
      });

      // Invalidate cache to refetch the works list
      queryClient.invalidateQueries({ queryKey: ["get", "/api"] });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create work:", error);
    }
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-black/80">
          Add Work
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add work here</DialogTitle>
          <DialogDescription>
            Add new task to the kanban board
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          {/* Title */}
          <div className="space-y-1">
            <Input
              {...form.register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
              placeholder="Title"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <textarea
              {...form.register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
              })}
              className="h-24 w-full resize-none rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Description"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* End Date + Time */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="date">
              End Date (Optional)
            </label>

            <Input
              id="date"
              type="date"
              {...form.register("endDate")}
              min={new Date().toISOString().split("T")[0]}
            />

            <Input type="time" {...form.register("endTime")} />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <select
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-black"
              {...form.register("status")}
            >
              <option value="backlog">Backlog</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Submit */}
          <Button
            className="w-full bg-black text-white hover:bg-black/80 disabled:opacity-50"
            disabled={createWork.isPending}
            type="submit"
          >
            {createWork.isPending ? "Adding..." : "Add Work"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
