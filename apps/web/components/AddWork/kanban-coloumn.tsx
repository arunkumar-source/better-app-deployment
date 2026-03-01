"use client";

// src/features/works/components/kanban-column.tsx
import { Droppable } from "@hello-pangea/dnd";
import type { Work } from "@repo/shared";
import { Card } from "@workspace/ui/components/card";
import { WorkCard } from "@/components/AddWork/work-card";

interface Props {
  status: string;
  title: string;
  works: Work[];
  onOperationStart?: () => void;
  onOperationEnd?: () => void;
  isBoardLoading?: boolean;
}

export function KanbanColumn({ title, status, works, onOperationStart, onOperationEnd, isBoardLoading }: Props) {
  return (
    <Card className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
          {works.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[600px] flex-1 space-y-2 rounded p-2 transition-all duration-200 ${
              snapshot.isDraggingOver
                ? "border border-gray-300 bg-gray-50"
                : "border border-gray-200 bg-gray-50"
            }`}
          >
            {works.length === 0 && !snapshot.isDraggingOver && (
              <div className="py-8 text-center text-gray-400">
                <p className="text-xs">No tasks</p>
              </div>
            )}

            {works.length === 0 && snapshot.isDraggingOver && (
              <div className="py-8 text-center text-gray-500">
                <p className="font-medium text-xs">Drop here</p>
              </div>
            )}

            {works.map((work, index) => (
              <WorkCard
                index={index}
                key={work.id}
                work={work}
                onOperationStart={onOperationStart}
                onOperationEnd={onOperationEnd}
                isBoardLoading={isBoardLoading}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
}
