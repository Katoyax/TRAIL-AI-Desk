import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { closeMongo, connectMongo } from '../src/db/mongo.mjs';
import { createApiServer } from '../src/app.mjs';
import { toPublicKnowledge, demoKnowledge } from '../src/knowledge.mjs';
import { rankKnowledge } from '../src/rag/retrieval.mjs';

const servers = [];
const quietLogger = { info() {}, warn() {}, error() {} };

async function startApi(options = {}) {
  const server = createApiServer({ logger: quietLogger, aiConfig: {}, ...options });
  server.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

async function chat(base, question, conversation) {
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, ...(conversation ? { conversation } : {}) }),
  });
  return { status: response.status, body: await response.json() };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

test('A. Registrar question retrieves a demo source and marks it unverified', async () => {
  const base = await startApi();
  const { status, body } = await chat(base, "Where is the Registrar's Office?");
  assert.equal(status, 200);
  assert.match(body.answer, /DEMO ONLY/);
  assert.equal(body.sources[0].category, 'Offices');
  assert.equal(body.sources[0].office, 'Registrar’s Office');
  assert.equal(body.sources[0].lastUpdated, 'Demo record — not verified');
  assert.equal(body.sources[0].dataStatus, 'demo_unverified');
  assert.match(body.sources[0].source, /not an official USTP source/);
});

test('B. Certificate of Enrollment requirements retrieve the procedure', async () => {
  const base = await startApi();
  const { status, body } = await chat(base, 'What are the requirements for requesting a Certificate of Enrollment?');
  assert.equal(status, 200);
  assert.equal(body.sources[0].category, 'Procedures');
  assert.match(body.answer, /not been verified by USTP/);
});

test('C. General academic-calendar questions stay in scope and report missing dates', async () => {
  const base = await startApi();
  const { status, body } = await chat(base, 'Are there any university holidays this month?');
  assert.equal(status, 200);
  assert.deepEqual(body.sources, []);
  assert.match(body.answer, /could not find relevant verified information/);
});

test('D. An unrelated laptop question does not match campus records', async () => {
  const base = await startApi();
  const { status, body } = await chat(base, 'Where can I buy a laptop on campus?');
  assert.equal(status, 200);
  assert.deepEqual(body.sources, []);
});

test('a specifically named unknown office does not match the generic Registrar demo directory', async () => {
  const base = await startApi();
  for (const question of ['Where is the quantum computing office?', 'How can I contact the quantum computing office at USTP?']) {
    assert.deepEqual(rankKnowledge(question, demoKnowledge), [], question);
    const { status, body } = await chat(base, question);
    assert.equal(status, 200);
    assert.deepEqual(body.sources, [], question);
    assert.match(body.answer, /could not find relevant verified information/);
  }
});

test('E. Personal academic and financial questions are refused before retrieval', async () => {
  const base = await startApi();
  for (const question of ['What is my grade?', 'What is my class schedule?', 'What subjects am I enrolled in?', 'What is my student balance?', 'Show me my student record.']) {
    const { status, body } = await chat(base, question);
    assert.equal(status, 200, question);
    assert.equal(body.refused, true, question);
    assert.match(body.answer, /does not access personal student records/);
    assert.equal(body.sources[0].dataStatus, 'verified_policy');
  }
});

test('F. Follow-up pronouns reuse the Certificate of Enrollment topic', async () => {
  const base = await startApi();
  const firstQuestion = 'What are the requirements for Certificate of Enrollment?';
  const first = await chat(base, firstQuestion);
  const second = await chat(base, 'Where can I request it?', [
    { role: 'user', content: firstQuestion },
    { role: 'assistant', content: first.body.answer },
  ]);
  assert.equal(second.status, 200);
  assert.equal(second.body.sources[0].title, first.body.sources[0].title);
});

test('empty, malformed, and structurally invalid questions return useful client errors', async () => {
  const base = await startApi();
  const empty = await chat(base, '   ');
  assert.equal(empty.status, 400);
  assert.match(empty.body.error, /Enter a question/);
  const wrongType = await chat(base, 42);
  assert.equal(wrongType.status, 400);
  const malformed = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  const nonObject = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'null' });
  assert.equal(nonObject.status, 400);
});

test('an explicitly unconfigured MongoDB uses bundled demo records', async () => {
  const connection = await connectMongo({ uri: undefined, databaseName: undefined, logger: quietLogger });
  assert.equal(connection, null);
  const base = await startApi({ connection });
  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.database, 'demo-fallback');
  assert.equal((await chat(base, 'Where is the Registrar Office?')).body.sources[0].dataStatus, 'demo_unverified');
  await closeMongo(connection);
});

test('a configured MongoDB connection failure does not silently start demo mode', async () => {
  let closeAttempted = false;
  const clientFactory = () => ({
    connect: async () => { throw new Error('fictional-sensitive-driver-detail'); },
    close: async () => { closeAttempted = true; },
  });
  const messages = [];
  const logger = {
    info: (message) => messages.push(message),
    error: (message) => messages.push(message),
  };

  await assert.rejects(
    connectMongo({
      uri: 'mongodb+srv://trail_db:test-password@cluster1.9duxxbp.mongodb.net/',
      databaseName: 'trail_db',
      logger,
      clientFactory,
    }),
    /MongoDB live connection failed\./,
  );
  assert.equal(closeAttempted, true);
  assert.equal(messages.some((message) => /demo fallback/i.test(message)), false);
  assert.equal(messages.some((message) => message.includes('fictional-sensitive-driver-detail')), false);
});

test('a MongoDB query failure switches an active API to demo fallback', async () => {
  const connection = {
    database: { collection: () => ({ find: () => ({ limit: () => ({ toArray: async () => { throw new Error('database disconnected'); } }) }) }) },
    client: { close: async () => {} },
  };
  const base = await startApi({ connection });
  const before = await (await fetch(`${base}/health`)).json();
  assert.equal(before.database, 'connected');
  const knowledge = await (await fetch(`${base}/api/knowledge`)).json();
  assert.equal(knowledge.database, 'demo-fallback');
  assert.ok(knowledge.items.some((item) => item.dataStatus === 'demo_unverified'));
});

test('AI API failure returns 503 instead of leaving a request pending', async () => {
  const base = await startApi({ aiConfig: { OPENAI_API_KEY: 'test-key', OPENAI_BASE_URL: 'http://127.0.0.1:1/v1', OPENAI_MODEL: 'test' } });
  const { status, body } = await chat(base, "Where is the Registrar's Office?");
  assert.equal(status, 503);
  assert.match(body.error, /AI service is temporarily unavailable/);
});

test('AI receives retrieved context and cannot leak the server key in the response', async () => {
  let providerRequest;
  const provider = createHttpServer(async (request, response) => {
    let raw = '';
    for await (const part of request) raw += part;
    providerRequest = { authorization: request.headers.authorization, body: JSON.parse(raw) };
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ choices: [{ message: { content: 'DEMO / UNVERIFIED: verify this with the Registrar.' } }] }));
  });
  provider.listen(0, '127.0.0.1');
  await new Promise((resolve) => provider.once('listening', resolve));
  servers.push(provider);
  const providerUrl = `http://127.0.0.1:${provider.address().port}/v1`;
  const base = await startApi({ aiConfig: { OPENAI_API_KEY: 'server-only-test-secret', OPENAI_BASE_URL: providerUrl, OPENAI_MODEL: 'test-model' } });
  const { status, body } = await chat(base, 'What are the requirements for Certificate of Enrollment?');
  assert.equal(status, 200);
  assert.equal(providerRequest.authorization, 'Bearer server-only-test-secret');
  assert.match(providerRequest.body.messages.at(-1).content, /DEMO ONLY/);
  assert.match(providerRequest.body.messages[0].content, /Answer ONLY/);
  assert.equal(JSON.stringify(body).includes('server-only-test-secret'), false);
  assert.equal(body.sources[0].dataStatus, 'demo_unverified');
});

test('official status requires explicit review metadata, and demo status cannot be overridden', () => {
  const base = { title: 'Example', category: 'Policies', content: 'Example only.', source: 'Example source', lastUpdated: '2026-09-28', dataStatus: 'verified', metadata: { verifiedAt: '2026-09-28T00:00:00Z', verifiedBy: 'University reviewer' } };
  assert.equal(toPublicKnowledge(base).dataStatus, 'verified');
  assert.equal(toPublicKnowledge({ ...base, metadata: {} }).dataStatus, 'unverified');
  assert.equal(toPublicKnowledge({ ...base, demo: true }).dataStatus, 'demo_unverified');
});
