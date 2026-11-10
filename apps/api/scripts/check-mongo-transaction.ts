// Dev check: proves the local MongoDB replica set supports multi-document transactions.
// Usage: pnpm --filter @cadence/api check:mongo   (reads MONGO_URL, defaults to the Compose port)
import { MongoClient } from 'mongodb';

const url =
  process.env['MONGO_URL'] ??
  'mongodb://localhost:27018/cadence?replicaSet=rs0&directConnection=true';
const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });

try {
  const db = client.db('cadence_dev_checks');
  const session = client.startSession();
  const marker = `check-${Date.now()}`;
  await session.withTransaction(async () => {
    await db.collection('check_a').insertOne({ marker }, { session });
    await db.collection('check_b').insertOne({ marker }, { session });
  });
  await session.endSession();
  const found = await Promise.all([
    db.collection('check_a').countDocuments({ marker }),
    db.collection('check_b').countDocuments({ marker }),
  ]);
  await db.dropDatabase();
  if (found[0] !== 1 || found[1] !== 1) throw new Error('transaction did not commit both writes');
  console.log('ok: two-collection transaction committed');
} catch (error) {
  console.error(`failed: ${error instanceof Error ? error.name : 'unknown error'}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
