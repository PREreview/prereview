#!/bin/sh

TRIES=30
DELAY=4
HOST="$PREREVIEW_DB_HOST"
PORT="$PREREVIEW_DB_PORT"
USER="$PREREVIEW_DB_USER"
PASS="$PREREVIEW_DB_PASS"
NAME="$PREREVIEW_DB_NAME"

# For copying from another postgres database
FROM_HOST=${IMPORT_FROM_HOST:-$PREREVIEW_DB_HOST}
FROM_PORT=${IMPORT_FROM_PORT:-$PREREVIEW_DB_PORT}
FROM_USER=${IMPORT_FROM_USER:-$PREREVIEW_DB_USER}
FROM_PASS=${IMPORT_FROM_PASS:-$PREREVIEW_DB_PASS}
FROM_NAME=${IMPORT_FROM_NAME:-production}

wait_for() {
  echo "Waiting for service => HOST: $HOST, PORT: $PORT"
  for i in $(seq $TRIES); do
    nc -z "$HOST" "$PORT" >/dev/null 2>&1

    result=$?
    if [ $result -eq 0 ]; then
      echo "Service is up!"
      return 0
    fi
    sleep "$DELAY"
    echo "Retrying..."
  done
  echo "Operation timed out" >&2
  exit 1
}

wait_for

if [ $NODE_ENV = "staging" ] && [ -z $IMPORT_SOURCES ]; then
  echo "Copying existing database to staging"
  env -i PGPASSWORD="$FROM_PASS" /usr/bin/pg_dump -U "$FROM_USER" -d "$FROM_NAME" -h "$FROM_HOST" -p "$FROM_PORT" -O -f /tmp/import.sql
  env -i PGPASSWORD="$PASS" /usr/bin/psql -U "$USER" -d "$NAME" -h "$HOST" -p "$PORT" -tAc "DROP TABLE $NAME; CREATE TABLE $NAME"
  env -i PGPASSWORD="$PASS" /usr/bin/psql -U "$USER" -d "$NAME" -h "$HOST" -f /tmp/import.sql
else
  env -i PGPASSWORD="$PASS" /usr/bin/psql -U "$USER" -d "$NAME" -h "$HOST" -p "$PORT" -tAc "SELECT to_regclass('public.users')" | grep -q users
  
  result=$?
  if [ $result -ne 0 ]; then
    echo "Initializing database schema"
    npm run db:migrations
    npm run db:init
    if [ $NODE_ENV = "staging" ]; then
      echo "Import legacy data"
      npm run db:import &
    elif [ $NODE_ENV = "development" ]; then
      echo "Generate seeds"
      npm run db:seeds &
    fi
  else
    echo "Updating database schema"
    npm run db:migrations
  fi
fi

echo "Running => npm run $@"

npm run "$@"
