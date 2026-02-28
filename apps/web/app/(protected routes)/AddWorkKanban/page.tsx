"use client";

import { useState } from "react";
import { AddWork } from "@/components/AddWork/add-work";
import { KanbanBoard } from "@/components/AddWork/kanban-board";

export default function AddWorkKanbanPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-6 p-5">
      <h1 className="mt-4 text-center font-mono font-semibold text-4xl">
        Track your work Here!
      </h1>

      <h1 className="text-center font-mono font-semibold text-2xl">
        Manage status of your Works without Notebook or pen 📝
      </h1>

      <div className="flex justify-end">
        <AddWork onOpenChange={setOpen} open={open} />
      </div>

      <div className="w-full rounded-2xl border border-black p-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
