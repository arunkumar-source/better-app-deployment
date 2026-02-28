import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./lib/auth-client";

export default async function middleware(req: NextRequest) {
  const token = await auth.getSession(undefined, {
    headers: req.headers,
  });

  const protectedRoutes = ["/AddWorkKanban", "/Dash"];
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
