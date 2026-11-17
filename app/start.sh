#!/bin/sh
# Start script for the Bigcapital Railway template.
set -eu
cd /app/packages/server

# The webapp expects the API on the same origin.
: "${BASE_URL:=https://${RAILWAY_PUBLIC_DOMAIN:-localhost}}"
export BASE_URL
# Gotenberg (PDF) fetches the rendered invoice HTML from the server's private port.
: "${GOTENBERG_DOCS_URL:=http://${RAILWAY_PRIVATE_DOMAIN:-localhost}:3000/public/}"
export GOTENBERG_DOCS_URL

if [ -z "${APP_JWT_SECRET:-}" ]; then
  echo "APP_JWT_SECRET is empty: refusing to start." >&2
  exit 1
fi
if [ -z "${SIGNUP_ALLOWED_EMAILS:-}${SIGNUP_ALLOWED_DOMAINS:-}" ] && [ "${SIGNUP_DISABLED}" = "true" ]; then
  echo "Note: SIGNUP_ALLOWED_EMAILS is empty, so nobody can register. Set it to your email address." >&2
fi

if [ -n "${REDIS_URL:-}" ]; then
  node /railway/redis-forward.js &
fi

# Database migrations (system, then every organisation). MariaDB may still be starting.
i=0
until node dist/cli.js system:migrate:latest; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then echo "Database not reachable, giving up." >&2; exit 1; fi
  echo "Waiting for the database ($i/30)..."
  sleep 5
done
node dist/cli.js tenants:migrate:latest

PORT=3000 node dist/main.js &
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &

# Exit as soon as any process stops, so Railway restarts the container.
wait -n
echo "A process exited; stopping the container." >&2
exit 1
