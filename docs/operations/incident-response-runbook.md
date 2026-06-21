# Incident Response Runbook

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| SEV1 | Complete platform outage | < 5 minutes | Database down, app unreachable, data loss |
| SEV2 | Major feature degraded | < 15 minutes | Search down, marketplace unavailable, auth broken |
| SEV3 | Partial degradation | < 1 hour | Slow queries, high error rate, queue backup |
| SEV4 | Minor issue | < 24 hours | UI bug, cosmetic issue, non-critical feature |

## Incident Response Workflow

### 1. DETECT

**Automated Detection:**
- Health check failures (PagerDuty/Slack alert)
- Error rate spikes (Sentry alert)
- Queue failure thresholds exceeded
- Security event detected
- Cost budget threshold exceeded

**Manual Detection:**
- User reports via support channels
- Team member observation
- Monitoring dashboard review

### 2. TRIAGE

**Initial Assessment:**
```
1. Check /api/health endpoint
2. Review Sentry for error patterns
3. Check queue metrics
4. Review recent deployments
5. Check infrastructure metrics (CPU, memory, connections)
```

**Determine Severity:**
- Is the platform completely unavailable? → SEV1
- Is a core feature broken? → SEV2
- Is performance degraded? → SEV3
- Is it a cosmetic issue? → SEV4

**Assign Responder:**
- SEV1: On-call SRE + Engineering Lead
- SEV2: On-call Engineer
- SEV3: Engineering team during business hours
- SEV4: Product team next sprint

### 3. CONTAIN

**General Containment Steps:**
```
1. Isolate affected service
2. Enable circuit breaker if applicable
3. Scale up if under load
4. Rate limit abusive traffic
5. Rollback recent deployment if suspicious
```

**Service-Specific Containment:**

#### Database Failure
```yaml
symptoms:
  - Health check shows database unhealthy
  - Queries timing out
  - Connection pool exhausted

containment:
  1. Kill long-running queries: SELECT pg_terminate_backend(pid)
  2. Reduce connection pool: DATABASE_MAX_CONNECTIONS=10
  3. Failover to read replica if available
  4. Enable read-only mode if primary is degraded
```

#### Redis Failure
```yaml
symptoms:
  - Cache service reports disconnected
  - Rate limiting disabled
  - Queue system unavailable

containment:
  1. App continues without cache (degraded mode)
  2. Rate limiting falls back to in-memory
  3. Queue jobs will retry on reconnect
```

#### Search Failure
```yaml
symptoms:
  - Search returns errors
  - Search health check fails

containment:
  1. Fall back to database LIKE queries
  2. Disable search-dependent features
  3. Queue pending index jobs for replay
```

#### Application Server Failure
```yaml
symptoms:
  - HTTP 502/503 errors
  - High CPU/memory usage
  - Slow response times

containment:
  1. Restart application container
  2. Scale up replicas
  3. Enable response compression
  4. Reduce request body limits
```

### 4. RECOVER

**Recovery Steps by Service:**

#### Database Recovery
```bash
# Option 1: Restart service
docker compose restart postgres

# Option 2: Failover (if replica configured)
# Update DATABASE_URL to point to replica

# Option 3: Restore from backup
# 1. Download latest backup from R2
# 2. Run pg_restore
# 3. Run data integrity checks
```

#### Redis Recovery
```bash
# Option 1: Restart service
docker compose restart redis

# Option 2: Restore from RDB
# 1. Stop Redis container
# 2. Copy latest RDB backup
# 3. Start Redis container

# Option 3: Clear and rebuild
redis-cli FLUSHALL
# Caches will rebuild on demand
```

#### Application Recovery
```bash
# Option 1: Restart
docker compose restart app

# Option 2: Rollback
# Deploy previous Docker image tag

# Option 3: Scale up
docker compose up -d --scale app=5
```

### 5. POSTMORTEM

**Postmortem Template:**

```markdown
# Incident Postmortem

## Summary
- Date: YYYY-MM-DD
- Duration: X hours Y minutes
- Severity: SEV1/SEV2/SEV3/SEV4
- Responder: @name

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Detection |
| HH:MM | Triage started |
| HH:MM | Containment applied |
| HH:MM | Recovery started |
| HH:MM | Service restored |

## Root Cause
[Detailed explanation of what caused the incident]

## Impact
- Users affected: X
- Features affected: [list]
- Data loss: Yes/No
- Financial impact: $X

## Resolution
[Step-by-step resolution actions]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action] | @owner | YYYY-MM-DD | [ ] Open |

## Lessons Learned
[What went well, what could be improved]
```

## Runbook Automation

### Common Recovery Scripts

```bash
# Quick health check
curl -s http://localhost:3000/api/health | jq .

# Restart all services
docker compose restart

# Rollback to previous version
docker compose down app
docker compose up -d app

# Scale up for load
docker compose up -d --scale app=5

# Check logs for errors
docker compose logs --tail=100 app | grep -i error

# Kill hanging DB queries
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid() AND query_start < now() - interval '5 minutes'"
```

## On-Call Procedures

### Before On-Call Shift
- [ ] Verify monitoring dashboards are accessible
- [ ] Confirm contact channels are working (Slack, phone)
- [ ] Review recent deployments and changes
- [ ] Check for any existing incidents
- [ ] Verify backup status

### During On-Call Shift
- [ ] Monitor Slack alerts channel
- [ ] Review Sentry for new issues
- [ ] Check health dashboard hourly
- [ ] Respond to alerts within SLO
- [ ] Document any incidents

### After On-Call Shift
- [ ] Handoff documentation to next engineer
- [ ] Update runbook with any new findings
- [ ] Schedule any follow-up work

## Escalation Contacts

```yaml
primary:
  - role: "SRE On-Call"
    channel: "#ops-oncall"
    response_sla: "5 minutes"

secondary:
  - role: "Engineering Lead"
    channel: "#engineering"
    response_sla: "15 minutes"

tertiary:
  - role: "CTO"
    channel: "#leadership"
    response_sla: "30 minutes"
```
