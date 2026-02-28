// import { authSchema } from "@repo/db";
// import { sign} from "hono/jwt";
// import { adminMiddleware } from "./adminMiddleware";

// import { serve } from "@hono/node-server";
import { db, schema } from "@repo/db";
import { Scalar } from "@scalar/hono-api-reference";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  describeRoute,
  openAPIRouteHandler,
  resolver,
  validator,
} from "hono-openapi";

dotenv.config();

import { auth } from "@repo/auth";
import { userWorksSchema, WorkSchema } from "@repo/shared";
//JWT
import type { Variables } from "hono/types";
import { z } from "zod";
//middleware
import { authMiddleware } from "./auth";

interface AppVariables extends Variables {
  user: string;
}

const app = new Hono<{ Variables: AppVariables }>().basePath("/api");

app.use("*", logger());

// CORS middleware
const corsOptions = cors({
  origin: [
    "http://localhost:3000",
    "mobile://",
    "exp://",
    "http://192.168.29.224:8081",
  ],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposeHeaders: ["user"],
  credentials: true,
});

// Apply CORS globally
app.use("*", corsOptions);

app.use("*", logger());

// Handle preflight OPTIONS for /auth/*
app.options("/auth/*", (c) => {
  return c.body(null, 204);
});

// Auth routes with CORS - mount under /api/auth/*
app.options("/auth/*", (c) => c.body(null, 204)); // preflight handled
app.all("/auth/*", (c) => auth.handler(c.req.raw)); // actual auth routes

// Protected routes for user works
app.get(
  "/",
  describeRoute({
    responses: {
      200: {
        description: "User works list",
        content: {
          "application/json": {
            schema: resolver(z.array(WorkSchema)),
          },
        },
      },
      400: { description: "Invalid data" },
      401: { description: "Unauthorized - No user ID in context" },
      500: { description: "Server error" },
    },
  }),
  authMiddleware,
  async (c) => {
    const userId = c.get("user");

    if (!userId) {
      return c.json({ message: "Unauthorized - No user ID in context" }, 401);
    }

    const works = await db
      .select()
      .from(schema.workDB)
      .where(eq(schema.workDB.usersId, userId));

    return c.json(works);
  }
);
app.post(
  "/add",
  describeRoute({
    responses: {
      201: {
        description: "Added to the DB",
        content: { "application/json": { schema: resolver(userWorksSchema) } },
      },
      400: { description: "Invalid data" },
      401: { description: "Unauthorized - No user ID in context" },
      500: { description: "Server error" },
    },
  }),
  validator("json", userWorksSchema),
  authMiddleware,
  async (c) => {
    const { title, status, description, endDate } = await c.req.valid("json");
    const userId = c.get("user");
    if (!(title && status)) {
      return c.json({ message: "Invalid data" }, 400);
    }

    const work = {
      id: crypto.randomUUID(),
      title,
      usersId: userId,
      status,
      description: description || null,
      endDate: endDate ? new Date(endDate) : null,
      createdAt: new Date(),
    };

    await db.insert(schema.workDB).values(work);
    return c.json(work, 201);
  }
);

app.patch(
  "/update/:id",
  describeRoute({
    responses: {
      200: {
        description: "Work updated",
        content: { "application/json": { schema: resolver(userWorksSchema) } },
      },
      400: { description: "Invalid data" },
      401: { description: "Unauthorized - No user ID in context" },
      404: { description: "Work not found" },
      500: { description: "Server error" },
    },
  }),
  validator("json", userWorksSchema),
  authMiddleware,
  async (c) => {
    const id = c.req.param("id");
    const updates = await c.req.valid("json");

    if (!(id && updates)) {
      return c.json({ message: "Invalid request" }, 400);
    }

    try {
      const processedUpdates = {
        ...updates,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined,
      };

      const work = await db
        .update(schema.workDB)
        .set(processedUpdates)
        .where(eq(schema.workDB.id, id))
        .returning();
      if (!work || work.length === 0) {
        return c.json({ message: "Not found" }, 404);
      }

      return c.json(work[0]);
    } catch (error) {
      console.error("Update error:", error);
      return c.json(
        { message: "Internal server error", error: String(error) },
        500
      );
    }
  }
);

app.delete(
  "/delete/:id",
  describeRoute({
    responses: {
      204: { description: "Work deleted" },
      401: { description: "Unauthorized - No user ID in context" },
      404: { description: "Work not found" },
      500: { description: "Server error" },
    },
  }),
  authMiddleware,
  async (c) => {
    const id = c.req.param("id");
    await db.delete(schema.workDB).where(eq(schema.workDB.id, id));
    return c.body(null, 204);
  }
);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [
        { url: "http://localhost:3000/api", description: "Local Server" },
      ],
    },
  })
);

app.get(
  "/scalar-docs",
  Scalar((c) => ({
    url: new URL("/api/openapi", c.req.url).toString(),
    theme: "deepSpace",
    layout: "modern",
  }))
);

// const _server = serve({
//   fetch: app.fetch,
//   port: 4000,
// });

// console.log("Server is running on http://localhost:4000/api");

export default app;
