import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  MONGODB_TARGET,
  validateMongoConfig,
} from '../src/config.mjs';
import { connectMongo } from '../src/db/mongo.mjs';

const approvedUri =
  'mongodb+srv://trail_db:test-password@cluster1.9duxxbp.mongodb.net/';

test('MongoDB validation preserves explicit demo mode only when live settings are absent', () => {
  assert.deepEqual(validateMongoConfig({}), {
    mode: 'demo',
    uri: null,
    databaseName: null,
  });
  assert.throws(
    () => validateMongoConfig({}, { allowDemo: false }),
    /Live MongoDB configuration is required/,
  );
  assert.throws(
    () => validateMongoConfig({ MONGODB_DATABASE: 'trail_db' }),
    /MONGODB_URI is required/,
  );
});

test('MongoDB validation requires the approved explicit database name', () => {
  assert.throws(
    () => validateMongoConfig({ MONGODB_URI: approvedUri }),
    /MONGODB_DATABASE is required/,
  );

  for (const databaseName of ['trail_ai_desk', 'trail_ai_desk_dev']) {
    assert.throws(
      () => validateMongoConfig({
        MONGODB_URI: approvedUri,
        MONGODB_DATABASE: databaseName,
      }),
      /MONGODB_DATABASE must be trail_db/,
    );
  }

  const target = validateMongoConfig({
    MONGODB_URI: approvedUri,
    MONGODB_DATABASE: 'trail_db',
  });
  assert.equal(target.mode, 'live');
  assert.equal(target.databaseName, MONGODB_TARGET.databaseName);
});

test('MongoDB validation enforces the approved SRV host, username, password, and URI database', () => {
  const invalidUris = [
    'mongodb://trail_db:test-password@cluster1.9duxxbp.mongodb.net/',
    'mongodb+srv://trail_db:test-password@other.example.net/',
    'mongodb+srv://other:test-password@cluster1.9duxxbp.mongodb.net/',
    'mongodb+srv://trail_db@cluster1.9duxxbp.mongodb.net/',
    'mongodb+srv://trail_db:YOUR_URL_ENCODED_PASSWORD@cluster1.9duxxbp.mongodb.net/',
    'mongodb+srv://trail_db:test-password@cluster1.9duxxbp.mongodb.net/trail_ai_desk',
  ];

  for (const uri of invalidUris) {
    let error;
    try {
      validateMongoConfig({ MONGODB_URI: uri, MONGODB_DATABASE: 'trail_db' });
    } catch (caught) {
      error = caught;
    }
    assert.ok(error instanceof Error);
    assert.match(error.message, /MongoDB connection configuration/);
    assert.equal(error.message.includes(uri), false);
    assert.equal(error.message.includes('test-password'), false);
  }
});

test('MongoDB connection initialization selects only the validated trail_db target', async () => {
  let selectedDatabase;
  let connected = false;
  const collection = {
    createIndex: async () => 'test-index',
    estimatedDocumentCount: async () => 1,
    insertMany: async () => {
      throw new Error('Demo seeding was not expected.');
    },
  };
  const database = { collection: () => collection };
  const clientFactory = () => ({
    connect: async () => { connected = true; },
    db: (name) => {
      selectedDatabase = name;
      return database;
    },
    close: async () => {},
  });

  const connection = await connectMongo({
    uri: approvedUri,
    databaseName: 'trail_db',
    logger: { info() {}, error() {} },
    clientFactory,
  });

  assert.equal(connected, true);
  assert.equal(selectedDatabase, 'trail_db');
  assert.equal(connection.database, database);
});

test('Admin provisioning rejects a legacy database target before password input or database work', () => {
  const serverDirectory = fileURLToPath(new URL('..', import.meta.url));
  const result = spawnSync(
    process.execPath,
    [
      'src/auth/provision.mjs',
      '--email', 'admin@example.test',
      '--name', 'Test Admin',
      '--role', 'admin',
    ],
    {
      cwd: serverDirectory,
      env: {
        ...process.env,
        MONGODB_URI: approvedUri,
        MONGODB_DATABASE: 'trail_ai_desk',
      },
      encoding: 'utf8',
      timeout: 5000,
    },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /MONGODB_DATABASE must be trail_db/);
  assert.equal(result.stdout.includes('New password'), false);
  assert.equal(result.stderr.includes(approvedUri), false);
  assert.equal(result.stderr.includes('test-password'), false);
});
