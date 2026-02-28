"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Work } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { differenceInHours, format, parseISO } from "date-fns";
import { $api } from "@/lib/api-client";
import { EditWorkSheet } from "./edit-sheet";

export function WorkCard({
  work,
  index,
  isUpdating = false,
}: {
  work: Work;
  index: number;
  isUpdating?: boolean;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = $api.useMutation("delete", "/api/delete/{id}");
  const updateMutation = $api.useMutation("patch", "/api/update/{id}");

  // Function to determine card color based on remaining time
  const getCardColor = () => {
    if (!work.endDate) {
      return "bg-white border-gray-200";
    }

    const now = new Date();
    const endTime = new Date(work.endDate);
    const hoursRemaining = differenceInHours(endTime, now);

    if (hoursRemaining <= 2) {
      return "bg-red-50 border-red-300";
    }
    if (hoursRemaining <= 8) {
      return "bg-yellow-50 border-yellow-300";
    }
    return "bg-white border-gray-200";
  };

  // Function to get column title for status indicator
  const getColumnTitle = (status: string) => {
    switch (status) {
      case "backlog":
        return "Backlogs";
      case "todo":
        return "Todo";
      case "in-progress":
        return "In Progress";
      case "done":
        return "Done";
      case "cancelled":
        return "Cancel";
      default:
        return status;
    }
  };

  return (
    <Draggable
      draggableId={work.id}
      index={index}
      isDragDisabled={work.status === "done" || isUpdating}
    >
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`mb-2 transition-all duration-200 ${
              snapshot.isDragging
                ? "rotate-1 scale-105 transform opacity-90 shadow-2xl"
                : "transform hover:scale-102"
            }`}
          >
            <Card
              className={`relative cursor-pointer border p-3 transition-all duration-200 ${
                snapshot.isDragging
                  ? "border-blue-300 bg-white shadow-xl"
                  : `${getCardColor()} hover:border-gray-400 hover:shadow-lg`
              } ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
            >
              {/* Loading overlay for this card */}
              {isUpdating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-blue-500 border-b-2" />
                    <span className="font-medium text-xs">Updating...</span>
                  </div>
                </div>
              )}
              <div {...provided.dragHandleProps}>
                {/* Status indicators */}
                <div className="mb-2 flex items-center gap-2">
                  {work.status === "done" ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      Completed
                    </Badge>
                  ) : (
                    <Badge
                      className="border-black text-black text-xs"
                      variant="outline"
                    >
                      {getColumnTitle(work.status)}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div className="mb-2">
                  <h3
                    className={`font-medium text-black text-sm leading-tight ${
                      snapshot.isDragging ? "text-blue-600" : ""
                    }`}
                  >
                    {work.title}
                  </h3>
                </div>

                {/* Description - more compact */}
                {work.description && (
                  <div className="mb-2">
                    <p className="line-clamp-2 text-gray-600 text-xs leading-relaxed">
                      {work.description}
                    </p>
                  </div>
                )}

                {/* Footer with metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 text-gray-500 text-xs">
                    {work.createdAt && (
                      <span>
                        {format(new Date(work.createdAt), "MMM dd HH:mm")}
                      </span>
                    )}
                    {work.endDate && (
                      <span className="font-medium text-amber-600">
                        Due: {format(parseISO(work.endDate), "MMM dd HH:mm")}
                      </span>
                    )}
                  </div>

                  {/* Action buttons in top right corner */}
                  <div className="flex gap-1">
                    <EditWorkSheet work={work}>
                      <Button
                        className="h-5 w-5 p-0 text-gray-400 hover:bg-gray-100 hover:text-black"
                        size="sm"
                        variant="ghost"
                      >
                        ✏️
                      </Button>
                    </EditWorkSheet>

                    {/* Show Cancel button for todo and in-progress tasks */}
                    {work.status === "todo" || work.status === "in-progress" ? (
                      <Button
                        className="h-5 w-5 p-0 text-gray-400 hover:bg-orange-50 hover:text-orange-600"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          updateMutation.mutate(
                            {
                              params: {
                                path: { id: work.id },
                              },
                              body: {
                                status: "cancelled",
                              },
                            },
                            {
                              onSuccess: () => {
                                queryClient.invalidateQueries({
                                  queryKey: ["get", "/api"],
                                });
                              },
                            }
                          );
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        ❌
                      </Button>
                    ) : (
                      /* Show Delete button for other statuses (done, cancelled, backlog) */
                      <Button
                        className="h-5 w-5 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          deleteMutation.mutate(
                            {
                              params: {
                                path: { id: work.id },
                              },
                            },
                            {
                              onSuccess: () => {
                                queryClient.invalidateQueries({
                                  queryKey: ["get", "/api"],
                                });
                              },
                            }
                          );
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        🗑️
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      }}
    </Draggable>
  );
}
