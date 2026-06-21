# Disaster Recovery Plan

## Recovery Objectives

| Metric           | Target       |
|-----------------|--------------|
| Recovery Point  | < 6 hours    |
| Recovery Time   | < 1 hour     |
| Data Loss       | < 6 hours    |
| Service Outage  | < 30 minutes |

## Backup Strategy

### Database Backups

```bash
# Full backup (every 6 hours)
pg_dump -Fc -d "$DATABASE_URL" -f /backups/db/daily/dump_$(date +%Y%m%d_%H%M).dump

# WAL archiving (continuous)
archive_command = 'cp %p /backups/db/wal/%f'

# Point-in-time recovery
pg_restore -d "$DATABASE_URL" --clean --if-exists /backups/db/daily/latest.dump
```

### Redis Backups

```bash
# Trigger RDB save
redis-cli SAVE

# Backup RDB file
cp /var/lib/redis/dump.rdb /backups/redis/dump_$(date +%Y%m%d_%H%M).rdb
```

### File Backups

```bash
# Sync R2 buckets to backup location
aws s3 sync s3://bhw-pas-media s3://bhw-pas-backups/media --source-region auto
```

## Recovery Procedures

### 1. Database Failure

```yaml
symptoms:
  - Health check reports database as unhealthy
  - Queries timeout or fail
  - Error rate increases above threshold

actions:
  1. Verify connection pool is not exhausted
  2. Check PostgreSQL logs for errors
  3. Failover to read replica if available
  4. Restore from latest backup if primary is lost
  5. Run REINDEX on affected tables
  6. Warm caches by triggering reads
```

### 2. Redis Failure

```yaml
symptoms:
  - Cache service reports disconnected
  - Rate limiting disabled (pass-through)
  - Queue system unavailable

actions:
  1. Restart Redis service
  2. If data lost, caches will rebuild on demand
  3. Queue jobs will be retried on reconnect
  4. Rate limiting falls back to pass-through
  5. Sessions fall back to database (next-auth JWT)
```

### 3. Typesense Failure

```yaml
symptoms:
  - Search returns errors
  - Search health check fails
  - Index jobs failing

actions:
  1. Verify Typesense is running
  2. Check disk space and memory
  3. Restart Typesense service
  4. Run bulk sync to rebuild collections
  5. Search falls back to database LIKE queries
```

### 4. Application Failure

```yaml
symptoms:
  - HTTP 502/503 errors
  - Health check failing
  - High memory usage

actions:
  1. Check application logs for errors
  2. Verify environment variables
  3. Restart application container
  4. Scale up if under load
  5. Rollback deployment if recent change
```

## Incident Response

### Severity Levels

| Level | Description          | Response Time |
|-------|---------------------|---------------|
| P0    | Complete outage     | < 5 minutes   |
| P1    | Major feature down  | < 15 minutes  |
| P2    | Partial degradation | < 1 hour      |
| P3    | Minor issue         | < 24 hours    |
| P4    | Cosmetic            | Next sprint   |

### Incident Response Steps

1. **Detect** - Automated health checks, Sentry alerts, logging
2. **Diagnose** - Check health endpoint, logs, metrics
3. **Respond** - Execute recovery procedure
4. **Resolve** - Verify system is healthy
5. **Review** - Post-mortem, update runbooks

## Data Integrity

### Verification

```bash
# Check database integrity
psql -d "$DATABASE_URL" -c "SELECT count(*) FROM users;"

# Verify backup integrity
pg_restore -l /backups/db/latest.dump | head -20

# Check file storage
aws s3 ls s3://bhw-pas-media --summarize
```

### Consistency Checks

- Daily: Row count validation between primary tables
- Weekly: Sample data comparison between DB and search index
- Monthly: Full backup restore and verification
