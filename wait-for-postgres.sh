#!/bin/bash

if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

HOST="$DB_HOST"
USER="$DB_USER"
PASSWORD="$DB_PASSWORD"
DBNAME="$DB_NAME"

until PGPASSWORD=$PASSWORD psql -h "$HOST" -U "$USER" -d "$DBNAME" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 5
done

>&2 echo "Postgres is up - executing command"
exec "$@"
