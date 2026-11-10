import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'schema');

/** Loads every SDL file in src/schema. The SDL is the source of truth (ADR-0003). */
export function loadTypeDefs(): string[] {
  return readdirSync(schemaDir)
    .filter((file) => file.endsWith('.graphql'))
    .sort()
    .map((file) => readFileSync(join(schemaDir, file), 'utf8'));
}
