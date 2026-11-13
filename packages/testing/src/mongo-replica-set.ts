import { MongoDBContainer } from '@testcontainers/mongodb';

/** Same image as docker-compose.yml, so tests and the local stack behave alike. */
export const MONGO_IMAGE = 'mongo:8.0.32';

export interface MongoReplicaSet {
  /** Connection string for a single-node replica set (transactions work). */
  connectionString: string;
  stop(): Promise<void>;
}

/**
 * Starts a throwaway MongoDB 8 single-node replica set in Docker. Testcontainers waits for the
 * server to accept connections and for `rs.initiate()` to succeed before resolving.
 */
export async function startMongoReplicaSet(): Promise<MongoReplicaSet> {
  const container = await new MongoDBContainer(MONGO_IMAGE).start();
  // The replica set registers its member by container hostname, which the host cannot resolve.
  // directConnection keeps the driver on the mapped port; a single node still allows transactions.
  const connectionString = `${container.getConnectionString()}/?directConnection=true`;
  return {
    connectionString,
    stop: async () => {
      await container.stop();
    },
  };
}
