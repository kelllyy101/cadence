import { describe, expect, it } from 'vitest';
import { EnvError, loadEnv } from './env';

const valid = {
  MONGO_URL: 'mongodb://localhost:27017/cadence?replicaSet=rs0&directConnection=true',
};

describe('loadEnv', () => {
  it('applies defaults when optional variables are missing', () => {
    // Given only the required variables
    // When the environment is loaded
    const env = loadEnv(valid);

    // Then defaults fill the rest
    expect(env.API_PORT).toBe(4000);
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.NODE_ENV).toBe('development');
  });

  it('names MONGO_URL when it is missing', () => {
    // Given no MONGO_URL
    // When the environment is loaded
    // Then it fails naming the variable
    expect(() => loadEnv({})).toThrowError(/MONGO_URL/);
  });

  it('never includes variable values in the error', () => {
    // Given a malformed value that could be a secret
    const source = { ...valid, API_PORT: 'super-secret-value' };

    // When loading fails
    try {
      loadEnv(source);
      expect.fail('expected an error');
    } catch (error) {
      // Then the message names the variable, not the value
      expect(error).toBeInstanceOf(EnvError);
      expect(String(error)).toContain('API_PORT');
      expect(String(error)).not.toContain('super-secret-value');
    }
  });
});
