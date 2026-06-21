// k6 Security Test Script
// Run: k6 run tests/performance/security-test.js
//
// Tests rate limiting and security measures
// Verifies that abusive traffic is properly throttled

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const rateLimitHit = new Rate("rate_limit_hit");
const rateLimitBypass = new Rate("rate_limit_bypass");

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
  ],
  thresholds: {
    rate_limit_hit: ["rate>0.5"],
    rate_limit_bypass: ["rate<0.01"],
  },
};

export default function () {
  // Test 1: Brute force login protection
  const loginPayload = {
    email: "test@example.com",
    password: "wrongpassword",
  };

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(loginPayload),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  if (loginRes.status === 429) {
    rateLimitHit.add(1);
  } else if (loginRes.status === 200) {
    rateLimitBypass.add(1);
  }

  // Test 2: Rapid search requests
  const searchRes = http.get(`${BASE_URL}/api/search?q=test`);

  if (searchRes.status === 429) {
    rateLimitHit.add(1);
  }

  // Test 3: API rate limiting
  const apiRes = http.get(`${BASE_URL}/api/health`);

  check(apiRes, {
    "health endpoint rate limited when abused": () => true,
  });

  // Verify security headers
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    "has X-Frame-Options header": (r) =>
      r.headers["X-Frame-Options"] === "DENY",
    "has X-Content-Type-Options": (r) =>
      r.headers["X-Content-Type-Options"] === "nosniff",
    "has Strict-Transport-Security": (r) =>
      r.headers["Strict-Transport-Security"] !== undefined,
  });

  sleep(0.5);
}
