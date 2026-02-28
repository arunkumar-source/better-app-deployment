import type { Work } from "@repo/shared";

const KEY = "works";

export const storage = {
  get(): Work[] {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  },
  set(data: Work[]) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
  del(id: string) {
    const works = this.get();
    const filteredWorks = works.filter((work) => work.id !== id);
    this.set(filteredWorks);
  },
};
