# Backup Strategy & Configurations

This document outlines the backup schedule, mechanisms, and retention policy to guarantee disaster recovery of the platform.

---

## 1. Backup Schedule & Matrix

| Service | Target Asset | Frequency | Strategy | Target Storage | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | Database Schemas & Rows | Hourly | WAL-G continuous archiving + Daily `pg_dump` | R2 Backup Bucket | 30 days daily, 12 months monthly |
| **Cloudflare R2** | Attachments, Avatars, Listings | Daily | S3 Cross-Region Replication (CRR) | AWS S3 Bucket | Versioning enabled (keep 90 days) |
| **Redis / Valkey** | Session keys, Rate limits, Cache | Daily | RDB Snapshot (`BGSAVE`) | Local persistent disk | 7 days |
| **Typesense** | Search config, synonyms, schema | Daily | Config schema JSON export | Git Repository | Infinite (version-controlled) |
| **Audit Logs** | Security and compliance logs | Daily | Partition dump (pg_dump of old partitions) | Glacier Cold Storage | 7 years |

---

## 2. Backup Execution Scripts

### PostgreSQL Backup Script (`backup-db.sh`)
This script runs in a daily cron job container adjacent to the PostgreSQL database server.

```bash
#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"
R2_BUCKET="s3://bhw-db-backups"

mkdir -p "${BACKUP_DIR}"

# Run compression pg_dump
pg_dump "${DATABASE_URL}" --no-owner --no-acl | gzip > "${BACKUP_FILE}"

# Upload to Cloudflare R2
aws s3 cp "${BACKUP_FILE}" "${R2_BUCKET}/daily/" \
  --endpoint-url "${R2_ENDPOINT}" \
  --region "${R2_REGION}"

# Clean up local backup file
rm -f "${BACKUP_FILE}"

echo "[Backup] Database backup completed and uploaded successfully."
```

### Redis Backup Script (`backup-redis.sh`)
```bash
#!/usr/bin/env bash
set -eo pipefail

redis-cli -u "${REDIS_URL}" BGSAVE

# Wait for completion
while [ "$(redis-cli -u "${REDIS_URL}" INFO persistence | grep rdb_bgsave_in_progress | cut -d: -f2 | tr -d '\r')" = "1" ]; do
  sleep 1
done

# Copy dump.rdb to backup location
aws s3 cp /var/lib/redis/dump.rdb "s3://bhw-redis-backups/daily/redis_dump_$(date +%Y%m%d).rdb" \
  --endpoint-url "${R2_ENDPOINT}"
```

---

## 3. Monitoring & Alerting
- All backup cron jobs must emit a heart-beat alert to Sentry and healthcheck endpoints.
- If a backup fails to report completion within 60 minutes of its schedule, pager duties are activated.
