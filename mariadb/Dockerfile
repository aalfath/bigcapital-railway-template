# MariaDB for the Bigcapital Railway template: the official image, pinned by version and digest
# (11.4 LTS). Bump the tag and digest together, and add a CHANGELOG.md entry.
FROM mariadb:11.4.13@sha256:5e73baf8179b29f115101bb102763a47a017361f3e9792daccba6646c3ab1532

COPY railway.cnf /etc/mysql/conf.d/zz-railway.cnf

# The system database Bigcapital expects. Organisations get their own databases
# (bigcapital_tenant_*), created by the app as root.
ENV MARIADB_DATABASE=bigcapital_system \
    MARIADB_AUTO_UPGRADE=1

EXPOSE 3306
CMD ["mariadbd"]
