/**
 * Kafka topics. Breaking payload changes get a new suffix (`.v2`); additive changes stay put.
 * Keep in sync with infra/kafka/create-topics.sh.
 */
export const TOPICS = {
  workouts: 'cadence.workouts.v1',
  cycle: 'cadence.cycle.v1',
  users: 'cadence.users.v1',
  dlq: 'cadence.dlq.v1',
} as const;

export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
