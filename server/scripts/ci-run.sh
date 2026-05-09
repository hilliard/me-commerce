#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Please provide a test database URL in CI environment variable." >&2
  exit 1
fi

ROOT_DIR=$(pwd)
SERVER_DIR="$ROOT_DIR/server"
FRONTEND_PORT=${FRONTEND_PORT:-5173}
CLIENT_DIR="$ROOT_DIR/client"

echo "=== Step 1: Migrate DB ==="
cd "$SERVER_DIR"
npm run db:push

echo "=== Step 2: Seed Admin ==="
npm run admin:seed

echo "=== Step 3: Build/Start Frontend ==="
if [[ -f "$CLIENT_DIR/package.json" ]]; then
  if grep -q '"build"' "$CLIENT_DIR/package.json"; then
    cd "$CLIENT_DIR"
    npm ci --silent
    npm run build
    FRONTEND_CMD="npx serve -s dist -l $FRONTEND_PORT"
  elif grep -q '"dev"' "$CLIENT_DIR/package.json"; then
    cd "$CLIENT_DIR"
    npm ci --silent
    FRONTEND_CMD="npm run dev"
  else
    FRONTEND_CMD=""
  fi
else
  FRONTEND_CMD=""
fi

if [[ -n "$FRONTEND_CMD" ]]; then
  echo "Starting frontend: $FRONTEND_CMD"
  bash -lc "$FRONTEND_CMD" &
  FRONTEND_PID=$!
  echo "Frontend PID: $FRONTEND_PID"
else
  echo "No frontend start script found; continuing without frontend server."
fi

echo "=== Step 4: Wait for Frontend ==="
if [ -n "${FRONTEND_CMD}" ]; then
  echo "Waiting for port $FRONTEND_PORT..."
  for i in {1..60}; do
    if nc -z localhost "$FRONTEND_PORT"; then
      echo "Frontend ready on port $FRONTEND_PORT"; break
    fi
    sleep 1
  done
fi

echo "=== Step 5: Run E2E Tests (Playwright) ==="
npm run --prefix server test:e2e

echo "=== Step 6: Cleanup ==="
if [[ -n "${FRONTEND_PID:-}" ]]; then
  kill "$FRONTEND_PID" || true
fi

echo "CI script completed"
