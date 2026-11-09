#!/usr/bin/env bash
# Creates Cadence topics. Idempotent. Keep in sync with packages/events/src/topics.ts.
set -euo pipefail

BOOTSTRAP="${BOOTSTRAP_SERVER:-localhost:9092}"
RETENTION_MS=604800000 # 7 days

for topic in cadence.workouts.v1 cadence.cycle.v1 cadence.users.v1 cadence.dlq.v1; do
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server "$BOOTSTRAP" --create --if-not-exists \
    --topic "$topic" --partitions 3 --replication-factor 1 --config "retention.ms=$RETENTION_MS"
done

/opt/kafka/bin/kafka-topics.sh --bootstrap-server "$BOOTSTRAP" --list
