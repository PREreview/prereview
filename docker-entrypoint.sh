#!/bin/sh

TRIES=30
DELAY=4
HOST="$PREREVIEW_DB_HOST"
PORT="$PREREVIEW_DB_PORT"
USERNAME="$PREREVIEW_DB_USER"
PASSWORD="$PREREVIEW_DB_PASS"
NAME="$PREREVIEW_DB_NAME"

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

env -i PGPASSWORD="$PASSWORD" /usr/bin/psql -U "$USERNAME" -d "$NAME" -h "$HOST" -p "$PORT" -tAc "SELECT to_regclass('public.users')" | grep -q users

result=$?
if [ $result -ne 0 ]; then
  echo "Initializing database schema"
  npm run db:migrations
  npm run db:init
  if [ $NODE_ENV = "staging" ]; then
    echo "Import legacy data"
    npm run db:import &
  fi
else
  echo "Updating database schema"
  npm run db:migrations
fi

echo "Running => npm run $@"

npm run "$@"
