#!/usr/bin/env bash
set -e

function finish() {
  echo "Stopping all containers"
  docker-compose logs
  docker-compose down
}

trap finish EXIT

export IMAGE_TAG="${IMAGE_TAG:-local}"

docker-compose up --detach
container=prereview

timeout --foreground 20 bash << EOT
  while true; do
    current=\$(docker inspect "${container}" | jq -r '.[0].State.Health.Status')
    echo "${container} is in state: \${current}"
    if [ "\$current" == "healthy" ]; then
      break
    fi
    sleep 1
  done
EOT
