import { MongoClient } from 'mongodb';
import { demoKnowledge } from '../knowledge.mjs';
import { ensureAuthIndexes } from '../auth/store.mjs';

export async function connectMongo({
  uri = process.env.MONGODB_URI,
  databaseName = process.env.MONGODB_DATABASE || 'trail_ai_desk',
  timeoutMS = 5000,
  logger = console,
} = {}) {
  if (!uri) {
    logger.info('MONGODB_URI is unset; using bundled demo knowledge in read-only mode.');
    return null;
  }

  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: timeoutMS });
    await client.connect();
    const database = client.db(databaseName);
    const knowledge = database.collection('knowledge');
    await knowledge.createIndex({ category: 1, active: 1 });
    await knowledge.createIndex({ keywords: 1 });
    await knowledge.createIndex({ dataStatus: 1, active: 1 });
    const sources = database.collection('knowledge_sources');
    await sources.createIndex({ isActive: 1, verificationStatus: 1, sourceType: 1, nextCheck: 1 });
    await sources.createIndex({ category: 1, isActive: 1 });
    await sources.createIndex({ sourceUrl: 1 }, { sparse: true });
    await database.collection('knowledge_versions').createIndex({ sourceId: 1, version: 1 }, { unique: true });
    const chunks = database.collection('knowledge_chunks');
    await chunks.createIndex({ versionId: 1, index: 1 }, { unique: true });
    await chunks.createIndex({ sourceId: 1, versionId: 1 });
    await chunks.createIndex({ title: 'text', content: 'text', keywords: 'text' }, { weights: { title: 4, keywords: 3, content: 1 }, name: 'knowledge_chunk_text' });
    await chunks.createIndex({ embeddingModel: 1 });
    await ensureAuthIndexes(database);
    if (await knowledge.estimatedDocumentCount() === 0) {
      await knowledge.insertMany(demoKnowledge.map((record) => ({ ...record })));
      logger.info('Seeded the knowledge collection with clearly labeled demo records.');
    }
    logger.info('MongoDB connected.');
    return { client, database };
  } catch (error) {
    logger.error(`MongoDB connection failed (${error.name}); using demo fallback.`);
    await client?.close().catch(() => {});
    return null;
  }
}

export async function closeMongo(connection) {
  await connection?.client?.close();
}
