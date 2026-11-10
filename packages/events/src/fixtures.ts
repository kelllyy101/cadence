import type { EventType } from './catalogue';

/** Synthetic identifiers for tests. Not real users or data. */
export const SAMPLE_EVENT_ID = '01890a5d-ac96-774b-bcce-b302099a8057';
export const SAMPLE_USER_ID = 'user_synthetic_001';

const samplePayloads: Record<EventType, Record<string, unknown>> = {
  'workout.logged': { workoutId: 'wo_001', kind: 'run' },
  'workout.updated': { workoutId: 'wo_001', kind: 'strength' },
  'workout.deleted': { workoutId: 'wo_001' },
  'cycle.logged': { change: 'created' },
  'cycle.data_deleted': {},
  'user.deletion_requested': { requestId: 'del_001' },
};

/** A valid raw message for the given type, as a consumer would receive it. */
export function sampleMessage(type: EventType): Record<string, unknown> {
  return {
    eventId: SAMPLE_EVENT_ID,
    type,
    version: 1,
    occurredAt: '2026-10-01T08:30:00.000Z',
    userId: SAMPLE_USER_ID,
    payload: { ...samplePayloads[type] },
  };
}
