# Gotenberg (PDF rendering for invoices and reports) for the Bigcapital Railway template:
# the official image, pinned by version and digest. Bigcapital uses the Chromium URL route.
FROM gotenberg/gotenberg:8.40.0@sha256:53073e798c8ef39ea2187e44cb67bab77894ea2509100b94c4fe3b461f7b2996

# Listen on Railway's PORT (3000 by default). Private network only: no public domain.
ENV API_PORT_FROM_ENV=PORT \
    PORT=3000
