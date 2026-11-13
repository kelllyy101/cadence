import type { TestProject } from 'vitest/node';
import { startMongoReplicaSet } from './mongo-replica-set';
import './vitest-context';

/**
 * Vitest `globalSetup`: starts one MongoDB replica set for the whole run and hands its
 * connection string to tests via `inject('mongoUrl')`. Returns the teardown.
 */
export default async function mongoGlobalSetup(project: TestProject): Promise<() => Promise<void>> {
  const mongo = await startMongoReplicaSet();
  project.provide('mongoUrl', mongo.connectionString);
  return () => mongo.stop();
}
