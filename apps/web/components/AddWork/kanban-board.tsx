"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import type { Work } from "@repo/shared";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const { data: works = [], isLoading, error } = $api.useQuery("get", "/api");

  const worksArray: Work[] = works;

  const { mutate: updateWork } = $api.useMutation("patch", "/api/update/{id}");

  const [boardState, setBoardState] = useState({
  isLoading: false,
});

const handleOperationStart = () => {
  setBoardState(prev => ({
    ...prev,
    isLoading: true,
  }));
};

const handleOperationEnd = () => {
  setBoardState(prev => ({
    ...prev,
    isLoading: false,
  }));
};

  const onDragEnd = (result: DropResult) => {
    if (boardState.isLoading) {
      return;
    }
    
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
      handleOperationStart();

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
            queryClient.invalidateQueries({ queryKey: ["get", "/api"] });
          },
          onSettled: () => {
            handleOperationEnd();
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

  if (error) {
    return (
      <div className="text-center text-red-500">
        Failed to load tasks
        <div className="flex justify-center items-center">
          <button
            className="relative border border-red-500 bg-red-500 text-white bottom-0 m-9 px-2 py-1 rounded-lg"
            onClick={() =>
              queryClient.refetchQueries({ queryKey: ["get", "/api"] })
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[600px]">
      {/* Board loading overlay */}
      {boardState.isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-blue-500 border-b-2" />
            <span className="font-medium text-gray-700">Updating board...</span>
          </div>
        </div>
      )}
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              works={worksArray.filter((w) => w.status === col.id)}
              onOperationStart={handleOperationStart}
              onOperationEnd={handleOperationEnd}
              isBoardLoading={boardState.isLoading}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
