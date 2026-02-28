import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

// Work status enum
export const workStatusDB = pgEnum("work_status", [
  "backlog",
  "todo",
  "in-progress",
  "done",
  "cancelled",
]);

// Work table with description and endDate fields
export const workDB = pgTable("works", {
  id: text("id").primaryKey(),
  usersId: text("usersId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: workStatusDB("status").notNull().default("todo"),
  endDate: timestamp("endDate", {
    withTimezone: true,
  }),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  // TODO: trigger new migration generation
});
