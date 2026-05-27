#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

RUN_DATE="$(TZ=Asia/Ho_Chi_Minh date +%F)"
LOG_FILE="$LOG_DIR/daily-$RUN_DATE.log"
DELAY_SECONDS=$((RANDOM % 3600))

{
  echo "[$(TZ=Asia/Ho_Chi_Minh date '+%F %T %Z')] Scheduled run starting after ${DELAY_SECONDS}s delay"
} >> "$LOG_FILE"

sleep "$DELAY_SECONDS"

cd "$ROOT_DIR" || exit 1

WALLET_CONCURRENCY="${WALLET_CONCURRENCY:-2}" npm start >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

{
  echo "[$(TZ=Asia/Ho_Chi_Minh date '+%F %T %Z')] Scheduled run finished with exit code $EXIT_CODE"
} >> "$LOG_FILE"

dotenvx run --ignore=MISSING_ENV_FILE -f .env -f .env.example -- node scripts/send-telegram-report.js "$LOG_FILE" "$EXIT_CODE" >> "$LOG_FILE" 2>&1

exit "$EXIT_CODE"
