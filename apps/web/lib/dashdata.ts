import type { Work } from "@repo/shared";

export function getStatusData(works: Work[]) {
  return {
    todo: works.filter((w) => w.status === "todo").length,
    "in-progress": works.filter((w) => w.status === "in-progress").length,
    done: works.filter((w) => w.status === "done").length,
  };
}

export function getDateData(works: Work[]) {
  const map: Record<string, number> = {};

  for (const w of works) {
    if (!w.createdAt) {
      continue;
    }

    const date = new Date(w.createdAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const dateStr = date.toLocaleDateString();
    map[dateStr] = (map[dateStr] || 0) + 1;
  }

  return Object.entries(map).map(([date, count]) => ({
    date,
    count,
  }));
}
