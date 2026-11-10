import { MongoClient } from 'mongodb';
import dns from 'node:dns';
import { ensureAuthIndexes } from '../auth/store.mjs';
import { validateMongoConfig } from '../config.mjs';
import { demoKnowledge } from '../knowledge.mjs';

export async function connectMongo({
  uri = process.env.MONGODB_URI,
  databaseName = process.env.MONGODB_DATABASE,
  timeoutMS = 5000,
  logger = console,
  clientFactory = (clientUri, options) => new MongoClient(clientUri, options),
} = {}) {
  const target = validateMongoConfig({
    MONGODB_URI: uri,
    MONGODB_DATABASE: databaseName,
  });

  if (target.mode === 'demo') {
    logger.info('MONGODB_URI is unset; using bundled demo knowledge in read-only mode.');
    return null;
  }

  let client;

  try {
    // Optional DNS configuration for MongoDB Atlas
    const dnsServer = process.env.MONGODB_DNS_SERVER?.trim();

    if (dnsServer) {
      dns.setServers([dnsServer]);
    }

    // MongoDB connection settings
    client = clientFactory(target.uri, {
      serverSelectionTimeoutMS: timeoutMS,
      ...(process.env.MONGODB_IPV4_ONLY === 'true'
        ? { family: 4 }
        : {}),
    });

    await client.connect();

    const database = client.db(target.databaseName);
    const knowledge = database.collection('knowledge');

    // Knowledge indexes
    await knowledge.createIndex({ category: 1, active: 1 });
    await knowledge.createIndex({ keywords: 1 });
    await knowledge.createIndex({ dataStatus: 1, active: 1 });

    // Knowledge source indexes
    const sources = database.collection('knowledge_sources');

    await sources.createIndex({
      isActive: 1,
      verificationStatus: 1,
      sourceType: 1,
      nextCheck: 1,
    });

    await sources.createIndex({ category: 1, isActive: 1 });
    await sources.createIndex(
      { sourceUrl: 1 },
      { sparse: true }
    );

    // Knowledge version indexes
    await database.collection('knowledge_versions').createIndex(
      { sourceId: 1, version: 1 },
      { unique: true }
    );

    // Knowledge chunk indexes
    const chunks = database.collection('knowledge_chunks');

    await chunks.createIndex(
      { versionId: 1, index: 1 },
      { unique: true }
    );

    await chunks.createIndex({ sourceId: 1, versionId: 1 });

    await chunks.createIndex(
      { title: 'text', content: 'text', keywords: 'text' },
      {
        weights: { title: 4, keywords: 3, content: 1 },
        name: 'knowledge_chunk_text',
      }
    );

    await chunks.createIndex({ embeddingModel: 1 });

    // Preserve existing authentication indexes
    await ensureAuthIndexes(database);

    // Only seed demo records when explicitly enabled
    if (
      process.env.MONGODB_SEED_DEMO === 'true' &&
      (await knowledge.estimatedDocumentCount()) === 0
    ) {
      await knowledge.insertMany(
        demoKnowledge.map((record) => ({ ...record }))
      );

      logger.info(
        'Seeded the knowledge collection with clearly labeled demo records.'
      );
    }

    logger.info('MongoDB connected.');

    return { client, database };

  } catch {
    logger.error('MongoDB live connection failed; configured live mode was not replaced with demo mode.');

    await client?.close().catch(() => {});

    throw new Error('MongoDB live connection failed.');
  }
}

export async function closeMongo(connection) {
  await connection?.client?.close();
}
