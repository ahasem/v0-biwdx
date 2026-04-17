// ============================================================
// Next.js 16 Proxy Middleware
// This file handles route protection and authentication redirects
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/security",
  "/organizations",
  "/settings",
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Public routes that don't require any authentication check
const publicRoutes = ["/", "/api", "/_next", "/favicon.ico", "/icon"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes and static files
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session token (better-auth uses this cookie name)
  const sessionToken =
    request.cookies.get("hasem.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && sessionToken) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const redirectUrl = callbackUrl || "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - icon files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon).*)",
  ],
};
