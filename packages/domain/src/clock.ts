/**
 * A clock returns the current time. Domain code never reads the system time directly:
 * callers inject a clock so behaviour is deterministic in tests.
 */
export type Clock = () => Date;

/** The real clock, for use at the edges of the system (apps), never inside domain logic. */
export const systemClock: Clock = () => new Date();

/** A clock frozen at the given instant. Useful in tests and scripts. */
export function fixedClock(at: Date): Clock {
  const frozen = new Date(at.getTime());
  return () => new Date(frozen.getTime());
}
