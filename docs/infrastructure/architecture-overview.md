# Infrastructure Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
├─────────────────────────────────────────────────────────┤
│                    Next.js 16 (Standalone)               │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐  │
│  │ Server  │ │ Server   │ │ Route   │ │ Middleware   │  │
│  │ Actions │ │ Comps    │ │ Handlers│ │ (Auth,RL)   │  │
│  └────┬────┘ └────┬─────┘ └────┬────┘ └──────┬──────┘  │
│       │           │            │              │         │
│  ┌────▼───────────▼────────────▼──────────────▼──────┐  │
│  │              Performance Module                    │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │  │
│  │  │Cache │ │Queue │ │Search│ │Media │ │Security   │  │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └────┬───┘   │
│  │     │        │        │        │          │        │
│  │  ┌──▼────────▼────────▼────────▼──────────▼────┐   │
│  │  │          Services Layer                      │   │
│  │  └──────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────┘
│                         │
├─────────────────────────┼─────────────────────────────────┤
│              ┌──────────▼──────────┐                      │
│              │     PostgreSQL      │                      │
│              │  (Primary + Read    │                      │
│              │   Replica Ready)    │                      │
│              └─────────────────────┘                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  Redis   │  │Typesense │  │  R2/S3   │               │
│  │(Cache+Q) │  │ (Search) │  │ (Storage)│               │
│  └──────────┘  └──────────┘  └──────────┘               │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component    | Technology        | Purpose                     |
|-------------|-------------------|-----------------------------|
| App Server  | Next.js 16        | SSR, SSG, API, Actions     |
| Database    | PostgreSQL 16     | Primary data store          |
| Cache       | Redis 7           | Caching, sessions, queues   |
| Search      | Typesense 28      | Full-text search            |
| Storage     | Cloudflare R2     | File/Media storage          |
| CDN         | Cloudflare        | Static assets, caching      |
| Monitoring  | Sentry + OTel     | Error tracking, tracing     |
| Queue       | BullMQ + Redis    | Background jobs             |

## Caching Architecture

### Cache Layers

1. **Browser Cache** - Static assets (immutable, 1 year)
2. **CDN Cache** - Images, public pages
3. **Redis Cache** - Application data (tagged, TTL-based)
4. **In-Memory** - Server request deduplication (React cache)

### Cache Tag Strategy

```
Cache Key: cache:{namespace}:{id}
Tag Key:   tag:{tag_name} -> Set of cache keys

Invalidation:
  Event -> Tag(s) -> Invalidate all keys with matching tags
```

### Cache Profiles

| Profile        | TTL    | Stale TTL | Tags                        |
|---------------|--------|-----------|-----------------------------|
| User Profile  | 300s   | 600s      | user                        |
| Forum Tree    | 900s   | 1800s     | forum, category             |
| Thread List   | 300s   | 600s      | thread, forum               |
| Post List     | 120s   | 240s      | post, thread                |
| Leaderboard   | 300s   | 600s      | leaderboard, user           |
| Trending      | 300s   | 600s      | trending, thread            |

## Queue Architecture

### Queue Names and Priorities

| Queue            | Concurrency | Priority | Max Attempts |
|-----------------|-------------|----------|--------------|
| email           | 5           | medium   | 3            |
| notification    | 10          | high     | 3            |
| ai              | 3           | low      | 3            |
| search-index    | 10          | medium   | 5            |
| analytics       | 5           | low      | 3            |
| moderation      | 5           | high     | 3            |
| marketplace     | 5           | medium   | 3            |
| image-processing| 3           | low      | 3            |
| leaderboard     | 1           | low      | 3            |
| aggregation     | 2           | low      | 3            |
| audit-log       | 10          | low      | 3            |
| cleanup         | 1           | low      | 2            |

## Security Architecture

### Defense Layers

1. **CDN** - DDoS protection, WAF, bot management
2. **Middleware** - Auth, rate limiting, security headers
3. **Server Actions** - CSRF protection (built-in)
4. **Validation** - Zod schema validation
5. **RBAC** - Server-side permission enforcement
6. **Rate Limiting** - Global, per-user, per-IP, per-endpoint
7. **Audit Logging** - All security events logged

### Rate Limit Tiers

| Endpoint          | Window    | Max  |
|------------------|-----------|------|
| Login            | 15 min    | 5    |
| Register         | 60 min    | 3    |
| Password Reset   | 15 min    | 3    |
| Search           | 60 sec    | 30   |
| Messaging        | 60 sec    | 20   |
| Forum Post       | 60 sec    | 10   |
| Marketplace      | 60 sec    | 10   |
| AI               | 60 sec    | 5    |

### Global Limits

| Limit       | Window | Max   |
|------------|--------|-------|
| Global     | 60s    | 1000  |
| Per User   | 60s    | 100   |
| Per IP     | 60s    | 200   |

## Database Architecture

### Index Strategy

All major query paths covered with B-tree indexes.
Covering indexes for high-traffic queries.
BRIN indexes for time-series data.
GIN indexes for text search (pg_trgm).

### Materialized Views

| View                   | Refresh  | Purpose                      |
|-----------------------|----------|------------------------------|
| mv_thread_stats       | 5 min    | Forum listing stats          |
| mv_user_stats         | 5 min    | User profiles, leaderboards  |
| mv_listing_stats      | 5 min    | Marketplace listings         |
| mv_leaderboard_reputation | 1 hr | Reputation leaderboard       |
| mv_leaderboard_sellers    | 1 hr | Seller leaderboard           |
| mv_daily_analytics    | Daily    | Admin analytics              |
| mv_marketplace_analytics | Daily  | Marketplace analytics        |

## Monitoring Stack

### Health Checks

- `/api/health` - Database, Redis, Typesense, Storage, Circuit Breakers, Queues
- Returns status: healthy/degraded/unhealthy
- Protected by optional Bearer token

### Metrics Tracked

- Redis cache hit rate
- Queue sizes and failure counts
- Circuit breaker states
- Database query performance
- API endpoint response times
- Error rates by component

### Alerting Thresholds

| Metric                 | Warning        | Critical       |
|-----------------------|----------------|----------------|
| Database latency      | >1s            | >5s            |
| Cache hit rate        | <80%           | <60%           |
| Queue failures        | >10/5min       | >50/5min       |
| Circuit breaker open  | 1 service      | 3+ services    |
| Error rate            | >1%            | >5%            |
| Response time p95     | >2s            | >5s            |

## High Availability

### Failure Strategy

1. **Single Service Failure** - Circuit breaker opens, fallback activated
2. **Graceful Degradation** - Non-critical features disabled, core features remain
3. **Fallback Systems** - Stale cache serves as fallback
4. **Recovery** - Automatic retry with exponential backoff

### Circuit Breaker Configuration

| Parameter          | Value  |
|-------------------|--------|
| Error Threshold   | 5      |
| Reset Timeout     | 30s    |
| Half-Open Max     | 3      |
| Monitoring Window | 60s    |

### Retry Policy

| Parameter      | Value     |
|---------------|-----------|
| Max Attempts  | 3         |
| Base Delay    | 1s        |
| Max Delay     | 30s       |
| Backoff Factor| 2x        |

## Performance Targets

- Response time p95 < 500ms (cached), < 2s (uncached)
- 100,000 concurrent users
- 10,000 requests/second per instance
- Database query time p95 < 100ms
- Cache hit rate > 90%

## Deployment Architecture

```yaml
services:
  app:
    image: bhw-pas:latest
    replicas: 3-10 (auto-scaled)
    env_file: .env.production
    depends_on:
      - postgres
      - redis
      - typesense

  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: bhw_pas
    
  redis:
    image: valkey/valkey:8
    volumes:
      - redisdata:/data

  typesense:
    image: typesense/typesense:28
    volumes:
      - typesensedata:/data

  # Queue workers run in same app process
  # No separate worker containers needed
```

## Disaster Recovery

### Backup Schedule

| Data          | Frequency | Retention | Method              |
|--------------|-----------|-----------|---------------------|
| Database     | 6 hours   | 30 days   | pg_dump             |
| WAL Archiving| Continuous| 7 days    | pg_archive          |
| Redis        | 1 hour    | 24 hours  | RDB snapshots       |
| Files        | 24 hours  | 30 days   | R2 bucket replication|
| Audit Logs   | 24 hours  | 90 days   | pg_dump (separate)  |

### Recovery Procedures

1. Database: Restore latest pg_dump, apply WAL to point-in-time
2. Redis: Restore RDB snapshot or rebuild from database
3. Cache: Warm cache on startup (automatic on first request)
4. Search: Run `bulkSync` for all Typesense collections
5. Files: Restore from R2 bucket replication
