#!/bin/bash
# PostgreSQL Restore Script
# Usage: ./scripts/restore-db.sh <backup_file>
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./backups/database/20240101_120000.dump"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env.production" ]; then
  set -a
  source "$PROJECT_DIR/.env.production"
  set +a
fi

echo "=========================================="
echo "  Database Restore"
echo "  File: $BACKUP_FILE"
echo "=========================================="

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo ""
echo "[Restore] WARNING: This will OVERWRITE the current database!"
echo "[Restore] Target: $DATABASE_URL"
echo ""
read -rp "Are you sure? Type 'yes' to continue: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

echo ""
echo "[Restore] Starting restore..."

# Terminate existing connections
psql "${DATABASE_URL}" -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = current_database()
    AND pid <> pg_backend_pid();
" 2>/dev/null || true

# Restore from backup
pg_restore "${DATABASE_URL}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  --jobs=4 \
  "$BACKUP_FILE"

echo ""
echo "[Restore] Completed successfully"
echo "[Restore] Please restart the application to clear any cached data"
echo "=========================================="
