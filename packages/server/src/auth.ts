import { auth } from "@repo/auth";
import type { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  console.log("Auth middleware - Headers:", Object.fromEntries(c.req.raw.headers.entries()));
  
  // 1️⃣ First try normal cookie-based session (Web)
  let session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  console.log("Auth middleware - Cookie session:", session?.user ? "Found" : "Not found");

  // 2️⃣ If no cookie session, try Bearer token (Mobile)
  if (!session?.user) {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      session = await auth.api.getSession({
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });
      console.log("Auth middleware - Bearer session:", session?.user ? "Found" : "Not found");
    }
  }

  if (!session?.user) {
    console.log("Auth middleware - Unauthorized");
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", session.user.id);
  await next();
};
