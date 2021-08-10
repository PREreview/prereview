#!/usr/bin/env bash
set -e

function finish() {
  echo "Stopping all containers"
  make logs stop
}

trap finish EXIT

export IMAGE_TAG="${IMAGE_TAG:-local}"
export TARGET="${TARGET:-prod}"

make start wait-healthy
