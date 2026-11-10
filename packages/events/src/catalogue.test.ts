import { describe, expect, it } from 'vitest';
import { ALLOWED_PAYLOAD_KEYS, EVENT_TOPIC, EVENT_TYPES, payloadSchemas } from './catalogue';
import { TOPICS } from './topics';

describe('event catalogue', () => {
  it('contains every event type in the spec', () => {
    // Given the catalogue
    // When its types are listed
    // Then they match the spec exactly
    expect([...EVENT_TYPES].sort()).toEqual(
      [
        'cycle.data_deleted',
        'cycle.logged',
        'user.deletion_requested',
        'workout.deleted',
        'workout.logged',
        'workout.updated',
      ].sort(),
    );
  });

  it('maps every event type to a non-DLQ topic', () => {
    // Given the type-to-topic map
    const domainTopics: string[] = [TOPICS.workouts, TOPICS.cycle, TOPICS.users];

    // When each type is looked up
    // Then it maps to a domain topic
    for (const type of EVENT_TYPES) {
      expect(domainTopics).toContain(EVENT_TOPIC[type]);
    }
  });

  it('exports the four topics including the dead-letter topic', () => {
    expect(Object.values(TOPICS).sort()).toEqual(
      ['cadence.cycle.v1', 'cadence.dlq.v1', 'cadence.users.v1', 'cadence.workouts.v1'].sort(),
    );
  });

  it('only uses allow-listed payload keys, so no health values can be added unnoticed', () => {
    // Given every payload schema
    // When its keys are compared with the allow-list
    // Then none fall outside it (adding e.g. rpe or distanceM makes this fail)
    for (const type of EVENT_TYPES) {
      for (const key of Object.keys(payloadSchemas[type].shape)) {
        expect(ALLOWED_PAYLOAD_KEYS.has(key), `${type} payload key "${key}"`).toBe(true);
      }
    }
  });

  it('does not allow-list known health fields', () => {
    const healthFields = [
      'rpe',
      'energy',
      'notes',
      'distanceM',
      'durationS',
      'periodStartDate',
      'phase',
    ];
    for (const field of healthFields) {
      expect(ALLOWED_PAYLOAD_KEYS.has(field)).toBe(false);
    }
  });
});
