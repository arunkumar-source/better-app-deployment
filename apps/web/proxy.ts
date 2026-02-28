import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("__Secure-better-auth.session_token")?.value || 
                req.cookies.get("better-auth.session_token")?.value;

  const protectedRoutes = ["/AddWorkKanban", "/Dash"];
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
