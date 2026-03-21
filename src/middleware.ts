import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/leaderboard" ||
    pathname.startsWith("/u/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/leaderboard") ||
    pathname.startsWith("/api/users/") ||
    pathname.startsWith("/api/sync") ||
    pathname === "/api/health" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Protected routes require auth cookie
  const token = request.cookies.get("lb_token")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
