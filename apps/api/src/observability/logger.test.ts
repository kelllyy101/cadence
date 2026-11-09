import { Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createLogger } from './logger';

function capture(): { lines: () => string; stream: Writable } {
  let out = '';
  const stream = new Writable({
    write(chunk: Buffer, _enc, done) {
      out += chunk.toString();
      done();
    },
  });
  return { lines: () => out, stream };
}

describe('logger redaction', () => {
  it('never writes health values, even when nested', () => {
    // Given a logger writing to a captured stream
    const { lines, stream } = capture();
    const log = createLogger({ level: 'info', destination: stream });

    // When a call includes health fields at several depths (synthetic values)
    log.info(
      { rpe: 7, input: { notes: 'synthetic-note-123', distanceM: 5000 }, a: { b: { energy: 3 } } },
      'workout logged',
    );

    // Then none of the values appear
    const output = lines();
    expect(output).toContain('workout logged');
    expect(output).not.toContain('synthetic-note-123');
    expect(output).not.toMatch(/"rpe":7|"distanceM":5000|"energy":3/);
    expect(output).toContain('[redacted]');
  });

  it('drops GraphQL variables and AI prompts', () => {
    const { lines, stream } = capture();
    const log = createLogger({ level: 'info', destination: stream });

    log.info({ variables: { input: { rpe: 9 } }, req: { prompt: 'synthetic prompt text' } }, 'op');

    expect(lines()).not.toContain('synthetic prompt text');
    expect(lines()).not.toContain('"rpe":9');
  });
});
