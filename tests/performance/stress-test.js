// k6 Stress Test Script
// Run: k6 run tests/performance/stress-test.js
//
// Tests system behavior under extreme conditions
// Simulates sudden traffic spikes

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "30s", target: 200 },
    { duration: "30s", target: 500 },
    { duration: "1m", target: 2000 },
    { duration: "1m", target: 5000 },
    { duration: "2m", target: 5000 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(90)<5000"],
    http_req_failed: ["rate<0.10"],
  },
};

export default function () {
  const endpoints = [
    { url: `${BASE_URL}/`, method: "GET" },
    { url: `${BASE_URL}/forums`, method: "GET" },
    { url: `${BASE_URL}/api/health`, method: "GET" },
    { url: `${BASE_URL}/auth/login`, method: "GET" },
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const res = http.request(endpoint.method, endpoint.url);

  check(res, {
    "status is acceptable": (r) => r.status < 500,
    "response time acceptable": (r) => r.timings.duration < 10000,
  });

  errorRate.add(res.status >= 500);
  responseTime.add(res.timings.duration);

  sleep(Math.random() * 2);
}
