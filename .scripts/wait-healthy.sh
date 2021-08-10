#!/usr/bin/env bash
set -e

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
