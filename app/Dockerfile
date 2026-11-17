# Bigcapital for Railway: the official server and webapp images, pinned by version and digest,
# in one container behind Caddy. Bump all three pins together and add a CHANGELOG.md entry.
FROM bigcapitalhq/webapp:v0.25.46@sha256:1190ccb2125f2db6b263da4ae715f94ed40927d84a3b48b4573bb251c925ce85 AS webapp
FROM caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0 AS caddy

FROM bigcapitalhq/server:v0.25.46@sha256:b341afc7dbc7db925d314364e190be156075013a4a4ac684bb26a56fa1a7e6ba

# Caddy serves the single-page webapp and proxies /api and /socket to the server.
COPY --from=caddy /usr/bin/caddy /usr/local/bin/caddy
COPY --from=webapp /usr/share/nginx/html /srv/webapp
COPY Caddyfile /etc/caddy/Caddyfile
COPY start.sh redis-forward.js /railway/

# Fixed settings. Every one can be overridden with a Railway variable of the same name.
ENV NODE_ENV=production \
    PORT=8080 \
    DB_USER=root \
    DB_PORT=3306 \
    DB_CHARSET=utf8 \
    SYSTEM_DB_NAME=bigcapital_system \
    TENANT_DB_NAME_PERFIX=bigcapital_tenant_ \
    REDIS_HOST=127.0.0.1 \
    REDIS_PORT=6379 \
    QUEUE_HOST=127.0.0.1 \
    QUEUE_PORT=6379 \
    SIGNUP_DISABLED=true \
    SIGNUP_EMAIL_CONFIRMATION=false \
    BULL_BOARD_ENABLED=false \
    CLICKHOUSE_ENABLED=false \
    EXCHANGE_RATE_SERVICE=open-exchange-rate \
    THROTTLE_GLOBAL_TTL=60000 \
    THROTTLE_GLOBAL_LIMIT=1000 \
    THROTTLE_AUTH_TTL=60000 \
    THROTTLE_AUTH_LIMIT=30 \
    XDG_CONFIG_HOME=/tmp/caddy \
    XDG_DATA_HOME=/tmp/caddy

EXPOSE 8080
CMD ["/bin/sh", "/railway/start.sh"]
