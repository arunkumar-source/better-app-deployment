import { z } from "zod";

export const WorkStatusSchema = z.enum([
  "backlog",
  "todo",
  "in-progress",
  "done",
  "cancelled",
]);

export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "name is required"),
  email: z.string().email("Invalid email address").min(1, "email is required"),
  password: z.string().min(1, "password is required"),
  role: z.enum(["user", "admin"]).optional().default("user"),
  created_at: z.string().optional(),
});

export const WorkSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
  status: WorkStatusSchema,
  createdAt: z.string(),
  endDate: z.string().optional(),
});

export const userWorksSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: WorkStatusSchema.optional(),
  endDate: z.string().optional(),
});

export const userRegisterSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  role: true,
});

export type Work = z.infer<typeof WorkSchema>;
export type WorkStatus = z.infer<typeof WorkStatusSchema>;
export type User = z.infer<typeof UserSchema>;
