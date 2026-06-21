# Load Testing Plan

This document outlines the load testing protocol to validate the platform's capacity to scale to 100,000+ concurrent users and millions of posts.

---

## 1. Load Testing Targets

- **Low Load**: 100 concurrent virtual users (VUs) - Baseline latency monitoring.
- **Medium Load**: 1,000 concurrent VUs - Average production operations.
- **High Scale**: 10,000 concurrent VUs - Spike event simulation.
- **Extreme Scale**: 100,000 concurrent VUs - Multi-cluster bottleneck identification.

---

## 2. Benchmark Goals

- **API response latency**: < 200ms (P95)
- **Search latency**: < 100ms (P95)
- **HTML loading time**: < 1.5s (P95)
- **Database CPU utilization**: < 70% under 10k VUs.
- **Redis cache hits ratio**: > 85%

---

## 3. k6 Test Script Template (`load-test.js`)

Run this test script using the `k6` CLI tool to simulate heavy community actions.

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp up to 100 VUs
    { duration: '5m', target: 1000 },  // scale to 1000 VUs
    { duration: '5m', target: 10000 }, // scale to 10000 VUs (spike)
    { duration: '2m', target: 0 },     // cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
  },
};

export default function () {
  const BASE_URL = 'http://localhost:3000';
  
  // 1. Get homepage (Static asset caching)
  const homeRes = http.get(BASE_URL + '/');
  check(homeRes, { 'status is 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Perform search (Typesense)
  const searchRes = http.get(BASE_URL + '/api/search?q=marketplace');
  check(searchRes, { 'search is 200': (r) => r.status === 200 });
  sleep(2);

  // 3. View thread (Cache manager L1/L2 hits)
  const threadRes = http.get(BASE_URL + '/forums/general/threads/welcome-thread');
  check(threadRes, { 'thread loads 200': (r) => r.status === 200 });
  sleep(3);
}
```

To execute the load test:
```bash
k6 run load-test.js
```
