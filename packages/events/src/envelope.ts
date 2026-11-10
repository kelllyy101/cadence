import { z } from 'zod';
import { EVENT_VERSION, payloadSchemas, type EventType } from './catalogue';

/** Fields every event carries, whatever its type. */
const baseEnvelope = {
  eventId: z.uuid({ version: 'v7' }),
  occurredAt: z.iso.datetime({ offset: true }),
  userId: z.string().min(1),
};

function variant<T extends EventType>(type: T) {
  return z.strictObject({
    ...baseEnvelope,
    type: z.literal(type),
    version: z.literal(EVENT_VERSION[type]),
    payload: payloadSchemas[type],
  });
}

/** The full event schema: a union discriminated by `type`. */
export const eventSchema = z.discriminatedUnion('type', [
  variant('workout.logged'),
  variant('workout.updated'),
  variant('workout.deleted'),
  variant('cycle.logged'),
  variant('cycle.data_deleted'),
  variant('user.deletion_requested'),
]);

export type CadenceEvent = z.infer<typeof eventSchema>;

/** An event narrowed to one type, e.g. `EventOf<'workout.logged'>`. */
export type EventOf<T extends EventType> = Extract<CadenceEvent, { type: T }>;
