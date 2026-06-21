# Disaster Recovery Procedures (Disaster Runbooks)

This guide provides step-by-step operational actions to restore services in the event of a catastrophic infrastructure failure.

---

## Runbook 1: PostgreSQL Database Restoration

In case of primary database corruption or server failure:

### Step 1: Provision a clean PostgreSQL server instance.
Ensure matching version parameters (PostgreSQL 16/17 compatible).

### Step 2: Fetch the latest daily dump from Cloudflare R2.
```bash
aws s3 cp s3://bhw-db-backups/daily/db_backup_latest.sql.gz /tmp/db_backup.sql.gz \
  --endpoint-url "${R2_ENDPOINT}" \
  --region "${R2_REGION}"
```

### Step 3: Decompress the backup.
```bash
gunzip /tmp/db_backup.sql.gz
```

### Step 4: Import database tables and schemas into the target database.
```bash
psql "${DATABASE_URL}" -f /tmp/db_backup.sql
```

### Step 5: Verify migration integrity.
Run Drizzle Orm migrations check:
```bash
pnpx drizzle-kit push
```

---

## Runbook 2: Cloudflare R2 Storage Restoration

If storage buckets are deleted or suffer region-wide outages:

### Step 1: Provision replacement R2 buckets.
Update credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`) in environment configurations.

### Step 2: Synchronize files from CRR disaster recovery backup location.
```bash
aws s3 sync s3://bhw-storage-dr-mirror s3://${R2_BUCKET_NAME} \
  --endpoint-url "${R2_ENDPOINT}" \
  --region "${R2_REGION}"
```

---

## Runbook 3: Typesense Search Index Recovery

If search instances become corrupted or loose node states:

### Step 1: Re-initialize collection schemas.
Invoke the admin synchronization action or trigger initialization:
```typescript
import { typesenseSyncService } from "@/services/typesense-sync";
await typesenseSyncService.initializeCollections();
```

### Step 2: Execute background batch indexing from the database.
Submit reindexing queue tasks to BullMQ for complete reindexing:
```typescript
import { searchManager } from "@/modules/infrastructure/search/search-manager";
await searchManager.recoverIndexJobs();
```

---

## Runbook 4: Redis Cache State Recovery

If Redis instances undergo complete data loss:

### Step 1: Spin up replacement Redis/Valkey cluster.
Ensure persistent RDB storage is enabled in `/etc/redis/redis.conf`:
```conf
appendonly yes
appendfsync everysec
```

### Step 2: Restart Next.js services.
The application handles Redis connection attempts automatically and will rebuild cache states on-demand via the L1/L2 Cache Manager lookup fallbacks.
