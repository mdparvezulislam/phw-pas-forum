# Security Testing Plan

This document details tests to run to ensure validation of authentication, authorization, rate-limiting, and input sanitization boundaries.

---

## 1. OWASP Top 10 Coverage

| Hazard Category | Mitigation Implementation | Testing Method |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Server-side role validation (RBAC, `requirePermission`) | Attempt post requests using a GUEST token on `/admin` API routes. Verify that status 403 / 401 is returned. |
| **A02: Cryptographic Failures** | Hashing passwords with `bcryptjs` + HTTPS forced headers. | Verify database tables contain no plaintext passwords or secrets. |
| **A03: Injection** | SQL binding via Drizzle ORM query builders. | Send mock inputs containing SQL injection strings (`' OR '1'='1`) to search inputs and post actions. |
| **A04: Insecure Design** | Strict Zod validation schemas. | Send empty payloads or types (e.g. number for email fields) and verify Zod returns 400 Bad Request. |
| **A05: Security Misconfiguration** | Next.js CSP, HSTS headers, Hiding Stacktraces in production. | Run curl checks to inspect response headers: `curl -I http://localhost:3000`. Verify CSP & HSTS are present. |

---

## 2. Specific SRE Security Verification Runs

### Run 1: Rate Limiting Verification
Use an automated curl loop to verify route-level rate limiting:
```bash
for i in {1..150}; do
  curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/api/auth/login
done
```
**Expected Result**: The first 100 requests (or limit threshold) return 200/302, and subsequent requests return `429 Too Many Requests`.

### Run 2: Session Hijack & Revocation Verification
- Log in and copy the `next-auth.session-token` cookie value.
- Make an authenticated request using the token.
- Call `sessionSecurityService.revokeSession(token)`.
- Make the request again with the same token.
- **Expected Result**: Second request returns 401 Unauthorized because the session is blacklisted in Redis and deleted from the DB.
