import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enhancedRateLimiter } from "@/modules/performance/security/rate-limiter";
import { getEnv } from "@/validations/env";
import { logger } from "@/lib/logger";

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
  "/seller",
  "/admin",
];

const authPrefixes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

const rateLimitedPaths = new Map([
  ["/api/auth/login", { key: "LOGIN" as const, maxPerWindow: 5 }],
  ["/api/auth/register", { key: "REGISTER" as const, maxPerWindow: 3 }],
  ["/api/search", { key: "SEARCH" as const, maxPerWindow: 30 }],
  ["/api/ai", { key: "AI" as const, maxPerWindow: 5 }],
]);

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

function generateCSP(): string {
  const env = getEnv();
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.sentry.io https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.sentry.io https://api.stripe.com https://*.typesense.net ws://localhost:* wss://*",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  if (env.CSP_REPORT_URI) {
    directives.push(`report-uri ${env.CSP_REPORT_URI}`);
    directives.push(`report-to csp-endpoint`);
  }

  return directives.join("; ");
}

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  const isApiRoute = pathname.startsWith("/api/");
  const rateLimitConfig = isApiRoute ? rateLimitedPaths.get(pathname) : null;

  if (rateLimitConfig && getEnv().RATE_LIMIT_ENABLED) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";

    const identifier = isLoggedIn ? `user:${req.auth?.user?.id}` : `ip:${ip}`;

    const result = await enhancedRateLimiter.check(
      rateLimitConfig.key,
      identifier,
      { max: rateLimitConfig.maxPerWindow },
    );

    if (!result.allowed) {
      logger.warn("[Middleware] Rate limit exceeded", {
        path: pathname,
        identifier: identifier.substring(0, 20),
      });

      const rateLimitResponse = NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.reset),
          },
        },
      );

      addSecurityHeaders(rateLimitResponse.headers);
      return rateLimitResponse;
    }

    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.reset));
  }

  if (isApiRoute && !rateLimitConfig && getEnv().RATE_LIMIT_ENABLED) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";

    const result = await enhancedRateLimiter.checkPerIP(ip);

    if (!result.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (!isLoggedIn && protectedPrefixes.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && authPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  addSecurityHeaders(response.headers);
  return response;
});

function addSecurityHeaders(headers: Headers): void {
  const env = getEnv();

  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }

  if (env.CSP_ENFORCE) {
    headers.set("Content-Security-Policy", generateCSP());
  }

  headers.set(
    "X-Robots-Tag",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api/auth|images).*)", "/"],
};
