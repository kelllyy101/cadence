import { describe, expect, it } from 'vitest';
import { fixedClock, systemClock } from './clock';

describe('clock', () => {
  it('returns the injected instant from a fixed clock', () => {
    // Given a clock fixed at a known instant
    const at = new Date('2026-10-01T08:30:00.000Z');
    const clock = fixedClock(at);

    // When it is read twice
    const first = clock();
    const second = clock();

    // Then both reads return that instant
    expect(first.toISOString()).toBe('2026-10-01T08:30:00.000Z');
    expect(second.toISOString()).toBe('2026-10-01T08:30:00.000Z');
  });

  it('is not affected when a caller mutates a returned date', () => {
    // Given a fixed clock
    const clock = fixedClock(new Date('2026-10-01T00:00:00.000Z'));

    // When a caller mutates the date it received
    clock().setUTCFullYear(1999);

    // Then the next read is unchanged
    expect(clock().getUTCFullYear()).toBe(2026);
  });

  it('reads the current time from the system clock', () => {
    // Given the system clock
    const before = Date.now();

    // When it is read
    const now = systemClock().getTime();

    // Then the result lies between the surrounding reads
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});
