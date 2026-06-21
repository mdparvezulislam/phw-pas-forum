#!/bin/bash
# PostgreSQL Backup Script
# Usage: ./scripts/backup-db.sh [output_dir]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment
if [ -f "$PROJECT_DIR/.env.production" ]; then
  set -a
  source "$PROJECT_DIR/.env.production"
  set +a
fi

BACKUP_DIR="${1:-./backups/database}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${TIMESTAMP}.dump"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

mkdir -p "$BACKUP_DIR"

echo "[Backup] Starting PostgreSQL backup..."
echo "[Backup] Output: $BACKUP_FILE"

pg_dump "${DATABASE_URL}" \
  --format=custom \
  --file="$BACKUP_FILE" \
  --verbose \
  --no-owner \
  --no-privileges \
  --no-tablespaces \
  --compress=9

echo "[Backup] Backup completed: $(du -h "$BACKUP_FILE" | cut -f1)"

# Upload to R2 if configured
if [ -n "${R2_ENDPOINT:-}" ] && [ -n "${R2_BUCKET_NAME:-}" ]; then
  echo "[Backup] Uploading to R2..."
  aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET_NAME}/backups/database/${TIMESTAMP}.dump" \
    --endpoint-url "$R2_ENDPOINT" \
    --storage-class STANDARD
  echo "[Backup] Upload to R2 completed"
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "*.dump" -type f -mtime +$RETENTION_DAYS -delete
echo "[Backup] Cleaned up backups older than $RETENTION_DAYS days"

# Generate backup report
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[Backup] Report:"
echo "  File: $BACKUP_FILE"
echo "  Size: $BACKUP_SIZE"
echo "  Timestamp: $TIMESTAMP"

exit 0
