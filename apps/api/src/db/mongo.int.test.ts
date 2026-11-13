import { MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

describe('MongoDB test harness', () => {
  let client: MongoClient;
  const db = () => client.db('harness_check');

  beforeAll(async () => {
    client = new MongoClient(inject('mongoUrl'), { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  });

  afterAll(async () => {
    await db().dropDatabase();
    await client.close();
  });

  async function countBoth(marker: string): Promise<[number, number]> {
    return Promise.all([
      db().collection('check_a').countDocuments({ marker }),
      db().collection('check_b').countDocuments({ marker }),
    ]);
  }

  it('commits a two-collection transaction on the replica set', async () => {
    // Given a transaction session
    const marker = 'commit';
    const session = client.startSession();

    // When both inserts run in one transaction
    try {
      await session.withTransaction(async () => {
        await db().collection('check_a').insertOne({ marker }, { session });
        await db().collection('check_b').insertOne({ marker }, { session });
      });
    } finally {
      await session.endSession();
    }

    // Then both writes are visible after commit
    expect(await countBoth(marker)).toEqual([1, 1]);
  });

  it('rolls back every write when the transaction throws', async () => {
    // Given a transaction that fails after the first insert
    const marker = 'rollback';
    const session = client.startSession();

    // When it runs
    try {
      await expect(
        session.withTransaction(async () => {
          await db().collection('check_a').insertOne({ marker }, { session });
          throw new Error('boom');
        }),
      ).rejects.toThrow('boom');
    } finally {
      await session.endSession();
    }

    // Then neither collection holds the write
    expect(await countBoth(marker)).toEqual([0, 0]);
  });
});
