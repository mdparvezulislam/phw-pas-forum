#!/bin/bash
# Full system backup
# Usage: ./scripts/backup-all.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "  Full System Backup"
echo "  Started: $(date)"
echo "  Output: $BACKUP_DIR"
echo "=========================================="

# Database backup
echo ""
echo "--- Database ---"
bash "$SCRIPT_DIR/backup-db.sh" "$BACKUP_DIR/database"

# Redis backup
echo ""
echo "--- Redis ---"
bash "$SCRIPT_DIR/backup-redis.sh" "$BACKUP_DIR/redis"

# Configuration backup
echo ""
echo "--- Configuration ---"
mkdir -p "$BACKUP_DIR/config"
cp .env.production "$BACKUP_DIR/config/" 2>/dev/null || true
cp .env.example "$BACKUP_DIR/config/" 2>/dev/null || true
cp docker-compose.yml "$BACKUP_DIR/config/" 2>/dev/null || true
cp Dockerfile "$BACKUP_DIR/config/" 2>/dev/null || true

# Generate backup manifest
cat > "$BACKUP_DIR/MANIFEST.txt" << EOF
Backup Timestamp: $(date)
Hostname: $(hostname)
Database Version: $(psql --version 2>/dev/null || echo 'unknown')
Redis Version: $(redis-cli --version 2>/dev/null || echo 'unknown')
EOF

# Create checksums
echo ""
echo "--- Integrity ---"
cd "$BACKUP_DIR"
find . -type f -name "*.dump" -o -name "*.rdb" | while read -r f; do
  sha256sum "$f" >> "checksums.sha256"
done
echo "Checksums generated"

# Calculate total size
echo ""
echo "--- Summary ---"
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Total backup size: $TOTAL_SIZE"
echo "Files:"
find "$BACKUP_DIR" -type f -not -name "*.sha256" | while read -r f; do
  echo "  $(du -h "$f" | cut -f1) $(basename "$f")"
done

echo ""
echo "=========================================="
echo "  Backup Complete: $BACKUP_DIR"
echo "  Total Size: $TOTAL_SIZE"
echo "=========================================="
