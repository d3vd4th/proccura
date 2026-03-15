#!/bin/bash
set -e

# Create additional databases on first startup
# The default "postgres" database is created automatically

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE proccura_auth;
    CREATE DATABASE proccura_vendor;
EOSQL
