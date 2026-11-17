# Changelog

Breaking changes are listed first in each entry.

## 2026-11-17: Bigcapital v0.25.46 (first release)

- Bigcapital v0.25.46: `bigcapitalhq/server:v0.25.46@sha256:b341afc7dbc7db925d314364e190be156075013a4a4ac684bb26a56fa1a7e6ba` and `bigcapitalhq/webapp:v0.25.46@sha256:1190ccb2125f2db6b263da4ae715f94ed40927d84a3b48b4573bb251c925ce85`, served together by Caddy 2.11.9.
- MariaDB 11.4.13 (LTS), Gotenberg 8.40.0, Railway Redis and a Railway Bucket.
- Sign-up restricted to `SIGNUP_ALLOWED_EMAILS`; JWT secret and database password generated per deploy.
