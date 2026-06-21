#!/bin/bash
# Database migration script
# Usage: ./scripts/migrate.sh [up|down|create]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ -f ".env.production" ]; then
  set -a
  source ".env.production"
  set +a
fi

MIGRATIONS_DIR="./src/db/migrations"

case "${1:-up}" in
  up)
    echo "[Migration] Running pending migrations..."
    npx drizzle-kit migrate
    echo "[Migration] Completed"
    ;;

  down)
    echo "[Migration] Reverting last migration..."
    LAST_MIGRATION=$(ls -1 "$MIGRATIONS_DIR" | grep -E '^\d+' | sort | tail -1)
    if [ -n "$LAST_MIGRATION" ]; then
      echo "[Migration] Reverting: $LAST_MIGRATION"
      npx drizzle-kit drop
      echo "[Migration] Reverted"
    else
      echo "[Migration] No migrations to revert"
    fi
    ;;

  create)
    echo "[Migration] Generating new migration from schema changes..."
    npx drizzle-kit generate
    echo "[Migration] Migration files created in $MIGRATIONS_DIR"
    ;;

  check)
    echo "[Migration] Checking migration status..."
    npx drizzle-kit check
    ;;

  status)
    echo "[Migration] Current migration status:"
    ls -1 "$MIGRATIONS_DIR" | grep -E '^\d+' | sort
    ;;

  *)
    echo "Usage: $0 [up|down|create|check|status]"
    exit 1
    ;;
esac
