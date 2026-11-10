import { describe, expect, it } from 'vitest';
import { EVENT_TYPES } from './catalogue';
import { sampleMessage } from './fixtures';
import { parseEvent } from './parse';

describe('parseEvent', () => {
  it.each(EVENT_TYPES)('accepts a valid %s message', (type) => {
    // Given a well-formed message of this type
    const raw = sampleMessage(type);

    // When it is parsed
    const result = parseEvent(raw);

    // Then it succeeds with the type preserved
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.event.type).toBe(type);
  });

  it('narrows the payload type for workout.logged', () => {
    // Given a valid workout.logged message
    const result = parseEvent(sampleMessage('workout.logged'));

    // When the caller switches on the event type
    // Then the payload fields are typed for that event
    if (!result.ok) throw new Error('expected ok');
    if (result.event.type === 'workout.logged') {
      const kind: 'run' | 'strength' = result.event.payload.kind;
      expect(kind).toBe('run');
    }
  });

  it('rejects an unknown event type without throwing', () => {
    // Given a message with a type outside the catalogue
    const raw = { ...sampleMessage('workout.logged'), type: 'workout.exploded' };

    // When it is parsed
    const result = parseEvent(raw);

    // Then a failure value is returned
    expect(result.ok).toBe(false);
  });

  it('rejects a message with a missing eventId', () => {
    // Given a message without an eventId
    const { eventId: _omitted, ...raw } = sampleMessage('workout.logged');

    // When it is parsed
    const result = parseEvent(raw);

    // Then the failure points at eventId
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.issues.map((i) => i.path)).toContain('eventId');
  });

  it('rejects an eventId that is not a UUID v7', () => {
    // Given a message with a v4 UUID
    const raw = {
      ...sampleMessage('workout.logged'),
      eventId: '3b241101-e2bb-4255-8caf-4136c566a962',
    };

    // When it is parsed
    // Then it fails
    expect(parseEvent(raw).ok).toBe(false);
  });

  it('rejects an extra payload key', () => {
    // Given a payload carrying a field outside its schema
    const raw = sampleMessage('workout.logged');
    raw.payload = { workoutId: 'wo_001', kind: 'run', rpe: 7 };

    // When it is parsed
    const result = parseEvent(raw);

    // Then it fails
    expect(result.ok).toBe(false);
  });

  it('rejects an unsupported schema version', () => {
    // Given a message claiming version 2
    const raw = { ...sampleMessage('cycle.logged'), version: 2 };

    // When it is parsed
    // Then it fails
    expect(parseEvent(raw).ok).toBe(false);
  });

  it('never includes the offending value in issues', () => {
    // Given a payload with an invalid value that looks like health data
    const raw = sampleMessage('workout.logged');
    raw.payload = { workoutId: 'wo_001', kind: 'run', notes: 'felt dizzy' };

    // When it is parsed
    const result = parseEvent(raw);

    // Then the issues mention paths and codes, not the value
    expect(JSON.stringify(result)).not.toContain('felt dizzy');
  });

  it('rejects non-object input', () => {
    // Given input that is not an object
    // When each is parsed
    // Then each fails without throwing
    for (const raw of [null, undefined, 'text', 42, []]) {
      expect(parseEvent(raw).ok).toBe(false);
    }
  });
});
