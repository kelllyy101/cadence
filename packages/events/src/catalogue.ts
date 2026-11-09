import { z } from 'zod';
import { TOPICS, type Topic } from './topics';

/**
 * Event payload schemas. Payloads are deliberately thin: identifiers and non-sensitive metadata
 * only, never health values. Consumers read the source of truth from the database.
 * Every schema is strict, so unexpected keys are rejected rather than silently passed on.
 */
export const payloadSchemas = {
  'workout.logged': z.strictObject({
    workoutId: z.string().min(1),
    kind: z.enum(['run', 'strength']),
  }),
  'workout.updated': z.strictObject({
    workoutId: z.string().min(1),
    kind: z.enum(['run', 'strength']),
  }),
  'workout.deleted': z.strictObject({
    workoutId: z.string().min(1),
  }),
  'cycle.logged': z.strictObject({
    change: z.enum(['created', 'updated', 'deleted']),
  }),
  'cycle.data_deleted': z.strictObject({}),
  'user.deletion_requested': z.strictObject({
    requestId: z.string().min(1),
  }),
} as const;

export type EventType = keyof typeof payloadSchemas;

export const EVENT_TYPES = Object.keys(payloadSchemas) as EventType[];

/** Which topic each event type is published to. */
export const EVENT_TOPIC: Record<EventType, Topic> = {
  'workout.logged': TOPICS.workouts,
  'workout.updated': TOPICS.workouts,
  'workout.deleted': TOPICS.workouts,
  'cycle.logged': TOPICS.cycle,
  'cycle.data_deleted': TOPICS.cycle,
  'user.deletion_requested': TOPICS.users,
};

/** Supported schema version per event type. Bump together with a new topic suffix. */
export const EVENT_VERSION: Record<EventType, 1> = {
  'workout.logged': 1,
  'workout.updated': 1,
  'workout.deleted': 1,
  'cycle.logged': 1,
  'cycle.data_deleted': 1,
  'user.deletion_requested': 1,
};

/**
 * Every payload key any event may carry. Adding a key means reviewing it against the privacy
 * rules first; the allow-list test fails otherwise.
 */
export const ALLOWED_PAYLOAD_KEYS: ReadonlySet<string> = new Set([
  'workoutId',
  'kind',
  'change',
  'requestId',
]);
