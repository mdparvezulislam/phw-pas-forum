import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedPrefixes = [
    "/dashboard",
    "/profile/settings",
    "/orders",
    "/conversations",
    "/bookmarks",
    "/watched",
    "/reputation",
    "/achievements",
    "/leaderboards",
  ];

  const authPrefixes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ];

  if (!isLoggedIn && protectedPrefixes.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && authPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api/auth|images).*)", "/"],
};
