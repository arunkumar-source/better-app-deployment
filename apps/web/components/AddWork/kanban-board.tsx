"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import type { Work } from "@repo/shared";
import { useState } from "react";
import { $api } from "@/lib/api-client";
import { KanbanColumn } from "./kanban-coloumn";

// ✅ match OpenAPI enum exactly
type WorkStatus = "backlog" | "todo" | "in-progress" | "done" | "cancelled";

const COLUMNS: { id: WorkStatus; title: string }[] = [
  { id: "backlog", title: "Backlogs" },
  { id: "todo", title: "Todo" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
  { id: "cancelled", title: "Cancel" },
];

export function KanbanBoard() {
  // ✅ GET /api
  const { data: works = [], isLoading, refetch } = $api.useQuery("get", "/api");

  // API now correctly returns an array of Work objects
  const worksArray: Work[] = works;

  // ✅ PATCH /api/update/{id}
  const { mutate: updateWork } = $api.useMutation("patch", "/api/update/{id}");

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { draggableId, destination, source } = result;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const work = worksArray.find((w) => w.id === draggableId);
    if (!work || work.status === "done") {
      return;
    }

    const newStatus = destination.droppableId as WorkStatus;

    if (work.status !== newStatus) {
      setUpdatingTaskId(work.id);

      updateWork(
        {
          params: {
            path: { id: work.id },
          },
          body: {
            status: newStatus,
          },
        },
        {
          onSuccess: () => {
            refetch();
          },
          onSettled: () => {
            setUpdatingTaskId(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        Loading tasks...
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="text-center text-red-500">
  //       Failed to load tasks
  //       <button onClick={() => refetch()}>Try Again</button>
  //     </div>
  //   )
  // }

  return (
    <div className="relative min-h-[600px]">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              updatingTaskId={updatingTaskId}
              works={worksArray.filter((w) => w.status === col.id)}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
