// k6 Load Test Script
// Run: k6 run tests/performance/load-test.js
//
// Targets:
// - Homepage: 1000 concurrent users
// - Search: 500 concurrent users
// - API: 500 concurrent users
// - Auth: 200 concurrent users

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const apiCalls = new Counter("api_calls");

export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "5m", target: 500 },
    { duration: "2m", target: 1000 },
    { duration: "5m", target: 1000 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
    errors: ["rate<0.05"],
  },
};

export default function () {
  group("Homepage", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/`);
    const duration = Date.now() - start;

    check(res, {
      "homepage status is 200": (r) => r.status === 200,
      "homepage loads fast": (r) => duration < 3000,
    });

    responseTime.add(duration);
    errorRate.add(res.status !== 200);
    apiCalls.add(1);
  });

  group("Forum Listing", () => {
    const res = http.get(`${BASE_URL}/forums`);

    check(res, {
      "forum listing status is 200": (r) => r.status === 200,
    });

    responseTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  group("Search", () => {
    const searchTerms = ["test", "help", "marketplace", "premium", "guide"];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const res = http.get(`${BASE_URL}/api/search?q=${term}&page=1`);

    check(res, {
      "search returns results": (r) => r.status === 200,
      "search responds fast": (r) => r.timings.duration < 2000,
    });

    responseTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  group("Auth Endpoints", () => {
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
      email: `user${Math.floor(Math.random() * 10000)}@test.com`,
      password: "testpassword123",
    });

    check(loginRes, {
      "login handled gracefully": (r) =>
        r.status === 401 || r.status === 429 || r.status === 200,
    });
  });

  group("API Health", () => {
    const res = http.get(`${BASE_URL}/api/health`);

    check(res, {
      "health endpoint responds": (r) => r.status === 200,
    });

    const body = res.json();
    check(res, {
      "health status valid": () =>
        body.status === "healthy" || body.status === "degraded",
    });
  });

  sleep(Math.random() * 3 + 1);
}
