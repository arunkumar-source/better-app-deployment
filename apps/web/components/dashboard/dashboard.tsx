"use client";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { $api } from "@/lib/api-client";
import { getStatusData } from "@/lib/dashdata";
import type { Work } from "@repo/shared";

// Helper functions extracted outside component
const collectDatesFromWorks = (works: Work[]) => {
  const dateSet = new Set<string>();
  const today = new Date().toISOString().split("T")[0];
  if (today) {
    dateSet.add(today);
  }

  for (const work of works) {
    const date = work.endDate
      ? new Date(work.endDate)
      : new Date(work.createdAt);
    if (date && !Number.isNaN(date.getTime())) {
      const dateStr = date.toISOString().split("T")[0];
      if (dateStr) {
        dateSet.add(dateStr);
      }
    }
  }

  return Array.from(dateSet).sort();
};

const initializeStatusMap = (dates: string[]) => {
  interface StatusMap {
    [key: string]: {
      todo: number;
      "in-progress": number;
      done: number;
      backlog: number;
      cancelled: number;
    };
  }
  const statusMap: StatusMap = {};

  for (const date of dates) {
    statusMap[date] = {
      todo: 0,
      "in-progress": 0,
      done: 0,
      backlog: 0,
      cancelled: 0,
    };
  }

  return statusMap;
};

const countTasksPerDate = (
  works: Work[],
  statusMap: {
    [key: string]: {
      todo: number;
      "in-progress": number;
      done: number;
      backlog: number;
      cancelled: number;
    };
  }
) => {
  for (const work of works) {
    const targetDate = work.endDate
      ? new Date(work.endDate)
      : new Date(work.createdAt);
    if (!targetDate || Number.isNaN(targetDate.getTime())) {
      continue;
    }

    const dateStr = targetDate.toISOString().split("T")[0];
    if (!dateStr) {
      continue;
    }

    if (statusMap[dateStr] && work.status in statusMap[dateStr]) {
      statusMap[dateStr][work.status as keyof (typeof statusMap)[string]]++;
    }
  }
};

const getStatusOverTimeData = (works: Work[]) => {
  const dates = collectDatesFromWorks(works);
  const statusMap = initializeStatusMap(dates);
  countTasksPerDate(works, statusMap);

  return dates.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    ...statusMap[date],
  }));
};

const formatDate = (work: Work) => {
  if (work.endDate) {
    return `Due: ${new Date(work.endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  if (work.createdAt) {
    return `Created: ${new Date(work.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return "No date";
};

const getBadgeColor = (statusKey: string) => {
  if (statusKey === "todo") {
    return "bg-yellow-500";
  }
  if (statusKey === "in-progress") {
    return "bg-blue-500";
  }
  if (statusKey === "done") {
    return "bg-green-500";
  }
  if (statusKey === "backlog") {
    return "bg-gray-500";
  }
  return "bg-red-500"; // cancelled
};

const statuses = ["todo", "in-progress", "done", "backlog", "cancelled"];

export default function Dashboard() {
  const { data: works = [], isLoading, error } = $api.useQuery("get", "/api");

  const status = getStatusData(works);
  const statusOverTimeData = getStatusOverTimeData(works);
  const backlogCount = works.filter((w) => w.status === "backlog").length;
  const cancelledCount = works.filter((w) => w.status === "cancelled").length;

  return (
    <div className="space-y-6 p-6">
      <h1 className="font-semibold text-2xl">Dashboard</h1>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border border-gray-300 bg-white p-4 text-black">
          <p className="text-sm">Todo</p>
          <p className="font-bold text-2xl">{status.todo}</p>
        </Card>
        <Card className="border border-gray-300 bg-white p-4 text-black">
          <p className="text-sm">In Progress</p>
          <p className="font-bold text-2xl">{status["in-progress"]}</p>
        </Card>
        <Card className="border border-gray-300 bg-white p-4 text-black">
          <p className="text-sm">Done</p>
          <p className="font-bold text-2xl">{status.done}</p>
        </Card>
        <Card className="border border-gray-300 bg-white p-4 text-black">
          <p className="text-sm">Backlog</p>
          <p className="font-bold text-2xl">{backlogCount}</p>
        </Card>
        <Card className="border border-gray-300 bg-white p-4 text-black">
          <p className="text-sm">Cancelled</p>
          <p className="font-bold text-2xl">{cancelledCount}</p>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-6 bg-white text-black lg:grid-cols-2">
        {/* RADAR */}
        <ResponsiveContainer height={400} width="100%">
          <Card className="border border-gray-300 bg-white text-black">
            <div className="p-4">
              <p className="mb-4 font-medium text-black">
                Task Status Overview
              </p>
              <ChartContainer
                className="h-75 w-full"
                config={{
                  Todo: { label: "Todo" },
                  "In Progress": { label: "In-Progress" },
                  Done: { label: "Done" },
                  Backlog: { label: "Backlog" },
                  Cancelled: { label: "Cancelled" },
                }}
              >
                <RadarChart
                  data={[
                    { subject: "Todo", value: status.todo },
                    { subject: "In Progress", value: status["in-progress"] },
                    { subject: "Done", value: status.done },
                    { subject: "Backlog", value: backlogCount },
                    { subject: "Cancelled", value: cancelledCount },
                  ]}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} />
                  <Radar
                    dataKey="value"
                    fill="#0088FE"
                    fillOpacity={0.6}
                    stroke="#0088FE"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </div>
          </Card>
        </ResponsiveContainer>

        {/* LINE CHART */}
        <ResponsiveContainer height={400} width="100%">
          <Card className="border border-gray-300 bg-white text-black">
            <div className="p-4">
              <p className="mb-4 font-medium text-black">Status Over Time</p>
              <ChartContainer
                className="h-75 w-full"
                config={{
                  todo: { label: "Todo", color: "#EAB308" },
                  inProgress: { label: "In Progress", color: "#3B82F6" },
                  done: { label: "Done", color: "#10B981" },
                  backlog: { label: "Backlog", color: "#6B7280" },
                  cancelled: { label: "Cancelled", color: "#EF4444" },
                }}
              >
                <LineChart data={statusOverTimeData}>
                  <XAxis
                    angle={-45}
                    dataKey="date"
                    height={60}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="todo"
                    dot={false}
                    stroke="#EAB308"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    dataKey="in-progress"
                    dot={false}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    dataKey="done"
                    dot={false}
                    stroke="#10B981"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    dataKey="backlog"
                    dot={false}
                    stroke="#6B7280"
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    dataKey="cancelled"
                    dot={false}
                    stroke="#EF4444"
                    strokeWidth={2}
                    type="linear"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </Card>
        </ResponsiveContainer>
      </div>

      {/* WORK LISTS */}
      <div className="mt-20 space-y-6">
        {statuses.map((statusKey) => {
          const filteredWorks = works.filter((w) => w.status === statusKey);
          return (
            <Card
              key={statusKey}
              className="border border-gray-300 bg-white p-4 text-black"
            >
              <p className="mb-4 font-medium text-black">
                {statusKey
                  .replace("-", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                ({filteredWorks.length})
              </p>
              <div className="space-y-3">
                {filteredWorks.length > 0 ? (
                  filteredWorks.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded-lg border border-gray-300 p-3"
                    >
                      <div>
                        <p className="font-medium">{w.title}</p>
                        <p className="text-gray-600 text-xs">{formatDate(w)}</p>
                      </div>
                      <Badge
                        className={`${getBadgeColor(statusKey)} text-white`}
                      >
                        {w.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No {statusKey} items</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
