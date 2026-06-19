import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/error",
  "/api/auth",
];

const guestOnlyPaths = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const { pathname } = url;

  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico";

  if (isStaticAsset) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const isGuestOnly = guestOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const authCookie = request.cookies.get(
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  );

  if (isGuestOnly && authCookie) {
    return NextResponse.redirect(new URL("/", url));
  }

  if (isPublic) {
    return NextResponse.next();
  }

  const protectedPaths = ["/settings", "/profile/edit"];

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtected && !authCookie) {
    return NextResponse.redirect(new URL("/auth/login", url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
