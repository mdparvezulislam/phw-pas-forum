#!/bin/bash
# Redis Backup Script
# Usage: ./scripts/backup-redis.sh [output_dir]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env.production" ]; then
  set -a
  source "$PROJECT_DIR/.env.production"
  set +a
fi

BACKUP_DIR="${1:-./backups/redis}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

mkdir -p "$BACKUP_DIR"

REDIS_CLI="redis-cli"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_URL_FINAL="${REDIS_URL:-redis://${REDIS_HOST}:${REDIS_PORT}}"

echo "[Backup] Starting Redis backup..."
echo "[Backup] Server: $REDIS_URL_FINAL"

# Trigger RDB save
redis-cli -u "$REDIS_URL_FINAL" SAVE
echo "[Backup] RDB save triggered"

# Get RDB path and copy
RDB_PATH=$(redis-cli -u "$REDIS_URL_FINAL" CONFIG GET dir | tail -1)
RDB_FILE="${RDB_PATH}/dump.rdb"

if [ -f "$RDB_FILE" ]; then
  cp "$RDB_FILE" "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
  echo "[Backup] RDB copied: $(du -h "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb" | cut -f1)"

  # Upload to R2 if configured
  if [ -n "${R2_ENDPOINT:-}" ] && [ -n "${R2_BUCKET_NAME:-}" ]; then
    aws s3 cp "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb" \
      "s3://${R2_BUCKET_NAME}/backups/redis/redis_${TIMESTAMP}.rdb" \
      --endpoint-url "$R2_ENDPOINT"
    echo "[Backup] Upload to R2 completed"
  fi
else
  echo "[Backup] WARNING: RDB file not found at $RDB_FILE"
fi

# Backup AOF if enabled
AOF_FILE="${RDB_PATH}/appendonly.aof"
if [ -f "$AOF_FILE" ]; then
  gzip -c "$AOF_FILE" > "${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof.gz"
  echo "[Backup] AOF backup created"
fi

# Cleanup
find "$BACKUP_DIR" -name "*.rdb" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.aof.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "[Backup] Redis backup completed"
exit 0
