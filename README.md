[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/bigcapital-1?utm_medium=integration&utm_source=button&utm_campaign=bigcapital)

# Bigcapital on Railway

This repo deploys [Bigcapital](https://github.com/bigcapitalhq/bigcapital), open-source double-entry accounting, invoicing and financial reporting (an alternative to QuickBooks, Xero and Wave), on [Railway](https://railway.com).

## What the template deploys

| Service | Source | Notes |
|---|---|---|
| **Bigcapital** | this repo, `app/` | Bigcapital **v0.25.46**: the official `bigcapitalhq/server` and `bigcapitalhq/webapp` images, pinned by version and digest, in one container. Caddy serves the webapp and proxies `/api` and `/socket` to the server, so the app and its API share one public domain. Health check `/api/system_db`. Runs the database migrations on every start |
| **MariaDB** | this repo, `mariadb/` | Official `mariadb:11.4.13` (LTS), pinned by digest. Volume at `/var/lib/mysql` (data in `/var/lib/mysql/data`). Holds the system database and one database per organisation |
| **Redis** | Railway Redis | Job queues (organisation setup, emails, reports), cache and rate limits. Volume at `/data`, password protected |
| **Gotenberg** | this repo, `gotenberg/` | Official `gotenberg/gotenberg:8.40.0`, pinned by digest. Renders invoices, receipts and reports as PDF. Private network only |
| **Bucket** | Railway Bucket | Attachments (S3-compatible, private) |

Every piece of state is in MariaDB, Redis or the bucket, so redeploys and restarts keep your books.

## Variables

Only one prompt: **`SIGNUP_ALLOWED_EMAILS`**, your email address. Sign-up is closed to everyone else, so nobody can register on your instance before you. The rest is set for you:

| Variable (Bigcapital service) | Default | Purpose |
|---|---|---|
| `SIGNUP_ALLOWED_EMAILS` | *(you enter it)* | Comma-separated emails allowed to register |
| `APP_JWT_SECRET` | `${{secret(64)}}` | Signs login tokens; generated per deploy |
| `DB_HOST` / `DB_PASSWORD` | `${{MariaDB.RAILWAY_PRIVATE_DOMAIN}}` / `${{MariaDB.MARIADB_ROOT_PASSWORD}}` | MariaDB over the private network. Bigcapital creates one database per organisation, so it connects as root |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Redis over the private network (a small forwarder in the container adds the password and IPv6, which Bigcapital's Redis client lacks) |
| `GOTENBERG_URL` | `http://${{Gotenberg.RAILWAY_PRIVATE_DOMAIN}}:3000` | PDF renderer |
| `S3_*` | `${{Bucket.*}}` | Attachment storage |
| `PORT` | `8080` | Port Caddy listens on |

`MARIADB_ROOT_PASSWORD` on the MariaDB service is `${{secret(32)}}`. There are no default passwords anywhere.

Fixed settings live in `app/Dockerfile` (`SIGNUP_DISABLED=true`, database names, throttling, ClickHouse analytics off). Each can be overridden with a Railway variable of the same name. Optional features you can add later on the Bigcapital service: SMTP for invites and emailed invoices (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SECURE`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`), exchange rates (`OPEN_EXCHANGE_RATE_APP_ID`), Plaid bank feeds (`BANK_FEED_ENABLED`, `PLAID_*`). See Bigcapital's [`.env.example`](https://github.com/bigcapitalhq/bigcapital/blob/develop/.env.example).

## First setup

1. Open the Bigcapital service's URL and choose **Sign up** (`/auth/register`) with the email you entered in `SIGNUP_ALLOWED_EMAILS`.
2. Set up your organisation (name, country, base currency, fiscal year). Bigcapital creates its database in a few seconds.
3. To invite colleagues, add SMTP settings (above), then invite them from Preferences → Users. To let more people register on their own, add their emails to `SIGNUP_ALLOWED_EMAILS`, or set `SIGNUP_ALLOWED_DOMAINS`.

## Updates

All app services build from this repo. When a new Bigcapital release is tested, the pins in the Dockerfiles are bumped on `main` and Railway shows an "update available" notice on your project. Read [CHANGELOG.md](CHANGELOG.md) first, then apply it when it suits you. Migrations run automatically when the new version starts. Back up MariaDB before major updates.

## Layout

```
app/        Dockerfile (server + webapp + Caddy), Caddyfile, start.sh, redis-forward.js
mariadb/    Dockerfile, railway.cnf
gotenberg/  Dockerfile
```

Licence of this wrapper: MIT. Bigcapital itself is AGPL-3.0.
