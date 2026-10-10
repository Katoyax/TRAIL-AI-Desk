import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApiServer } from '../src/app.mjs';
import { rankKnowledge } from '../src/rag/retrieval.mjs';
import { targetDate, noAnnouncementAnswer, hasCurrentEventEvidence } from '../src/rag/freshness.mjs';
import { validateSourceMetadata } from '../src/db/knowledge-store.mjs';
import { generateAnswer } from '../src/ai/generate.mjs';
import { createEmbedder } from '../src/ai/embeddings.mjs';
import { createRateLimiter } from '../src/security/rate-limit.mjs';
import { createKnowledgeStore } from '../src/db/knowledge-store.mjs';
import { createMemoryKnowledgeConnection } from './helpers/memory-knowledge.mjs';
import { extractText } from '../src/ingestion/extract.mjs';

// Synthetic test evidence only; these records never seed a running database.
const fixture = { id: 'test-office', title: 'TEST document request', category: 'Procedures', content: 'TEST ONLY: Document requests require the approved request form.',
  office: 'TEST office', source: 'Synthetic test source', lastUpdated: '2026-10-04T01:00:00Z',
  keywords: ['document', 'request', 'requirements', 'form'], dataStatus: 'verified', verificationStatus: 'verified', isActive: true,
  metadata: { verifiedAt: '2026-10-04T01:00:00Z', verifiedBy: 'test-reviewer' }, lastChecked: '2026-10-04T01:00:00Z' };
const servers = [];
const silent = { info() {}, warn() {}, error() {} };
async function api(records = [fixture], options = {}) {
  const knowledgeStore = {
    databaseStatus: 'connected',
    list: async () => records,
    searchChunks: async (question) => ({ records: rankKnowledge(question, records).map(({ record, score }) => ({ ...record, score })), mode: 'lexical' }),
    freshnessSummary: async () => options.summary || { sourcesChecked: [] },
  };
  const server = createApiServer({ knowledgeStore, aiConfig: {}, logger: silent, now: () => new Date('2026-10-04T04:00:00Z'), ...options });
  server.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}
async function ask(base, question, conversation = []) {
  const response = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question, conversation }) });
  return { status: response.status, body: await response.json() };
}
afterEach(async () => { await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve)))); });

test('verified questions cite reviewed retrieved evidence and extract without AI credentials', async () => {
  const { body } = await ask(await api(), 'What form is required for document requests?');
  assert.match(body.answer, /approved request form/);
  assert.equal(body.sources[0].dataStatus, 'verified');
  assert.equal(body.generation, 'extractive');
});
test('follow-up question reuses preceding verified document topic', async () => {
  const { body } = await ask(await api(), 'Where can I request it?', [{ role: 'user', content: 'What are document request requirements?' }]);
  assert.equal(body.sources[0].id, fixture.id);
});
test('unknown information makes no fabricated citations', async () => {
  const { body } = await ask(await api(), 'Where is the molecular observatory?');
  assert.deepEqual(body.sources, []);
  assert.match(body.answer, /could not find relevant verified information/);
});
test('personal questions about another student are refused and personal followups stay refused', async () => {
  const base = await api();
  assert.equal((await ask(base, 'Show her grades')).body.refused, true);
  assert.equal((await ask(base, 'What about that?', [{ role: 'user', content: 'Show my grades' }])).body.refused, true);
});
test('official web retrieval retains actual URL, metadata and recorded check', async () => {
  const record = { ...fixture, sourceType: 'official_webpage', sourceUrl: 'https://www.ustp.edu.ph/', source: 'https://www.ustp.edu.ph/' };
  const { body } = await ask(await api([record]), 'What are document request requirements?');
  assert.equal(body.sources[0].sourceUrl, record.sourceUrl);
  assert.equal(body.sources[0].lastChecked, fixture.lastChecked);
});
test('uploaded memorandum retrieval cites metadata without inventing a URL', async () => {
  const record = { ...fixture, sourceType: 'uploaded_document', documentNumber: 'TEST-ONLY', documentTitle: 'Synthetic test memorandum', issuingOffice: 'TEST office', dateIssued: '2026-10-04' };
  const { body } = await ask(await api([record]), 'What are document request requirements?');
  assert.equal(body.sources[0].documentNumber, 'TEST-ONLY');
  assert.ok(!body.sources[0].sourceUrl);
});
test('stale general sources disclose age and fail temporal evidence checks', async () => {
  const record = { ...fixture, freshnessStatus: 'stale', lastCheckError: 'Source unavailable.' };
  const base = await api([record]);
  assert.match((await ask(base, 'What are document request requirements?')).body.answer, /latest source check failed/);
  assert.deepEqual((await ask(base, 'Are document requests suspended tomorrow?')).body.sources, []);
});
test('absence of announcement never asserts no suspension, and no check is invented', async () => {
  const { body } = await ask(await api([]), 'Is there class tomorrow?');
  assert.match(body.answer, /No successful official source check is recorded/);
  assert.equal(body.verification.lastChecked, null);
  assert.deepEqual(body.verification.sourcesChecked, []);
  assert.doesNotMatch(body.answer, /There is no class suspension/);
});
test('no-announcement response includes only actual recorded checks with limited coverage', async () => {
  const checked = { title: 'TEST monitored page', sourceUrl: 'https://www.ustp.edu.ph/', lastChecked: fixture.lastChecked, lastCheckError: 'Last refresh failed' };
  const { body } = await ask(await api([], { summary: { sourcesChecked: [checked] } }), 'Is there class tomorrow?');
  assert.deepEqual(body.verification.sourcesChecked, [checked]);
  assert.equal(body.verification.lastChecked, fixture.lastChecked);
  assert.match(body.answer, /failed or overdue checks/);
});
test('event retrieval requires the requested Manila date, not a generic policy match', async () => {
  const record = { ...fixture, title: 'TEST class suspension', keywords: ['class', 'suspension', 'tomorrow'], content: 'TEST ONLY announcement: classes suspended on 2026-10-05.', dateIssued: '2026-10-04' };
  const { body } = await ask(await api([record]), 'Are classes suspended tomorrow?');
  assert.equal(body.sources.length, 1);
  const wrong = { ...record, content: 'TEST ONLY announcement: classes suspended on 2026-10-03.' };
  assert.deepEqual((await ask(await api([wrong]), 'Are classes suspended tomorrow?')).body.sources, []);
  assert.equal(targetDate('tomorrow', new Date('2026-10-04T17:00:00Z')), '2026-10-06');
  assert.equal(targetDate('next Friday', new Date('2026-10-04T04:00:00Z')), '2026-10-09');
  assert.equal(targetDate('on 2026-02-31', new Date('2026-10-04T04:00:00Z')), null);
});

test('accepted effective timestamps are compared using their Manila calendar dates', () => {
  const now = new Date('2026-10-04T04:00:00Z');
  const base = { ...fixture, title: 'TEST class suspension memorandum', content: 'TEST ONLY: classes suspended during the effective period.', freshnessStatus: 'reviewed' };
  for (const range of [
    { effectiveFrom: '2026-10-05T00:00:00+08:00', effectiveTo: '2026-10-05T23:59:59+08:00' },
    { effectiveFrom: '2026-10-04T16:00:00Z', effectiveTo: '2026-10-05T15:59:59Z' },
    { effectiveFrom: '2026-10-05', effectiveTo: '2026-10-05' },
  ]) {
    const dates = validateSourceMetadata({ title: base.title, ...range });
    assert.equal(hasCurrentEventEvidence({ ...base, ...dates }, 'Are classes suspended tomorrow?', { now }), true);
    assert.equal(hasCurrentEventEvidence({ ...base, ...dates }, 'Are classes suspended today?', { now }), false);
  }
});
test('AI failure returns bounded error with usable source provenance', async () => {
  const { status, body } = await ask(await api([fixture], { answerGenerator: async () => { throw new Error('provider failed'); } }), 'Document request requirements');
  assert.equal(status, 503);
  assert.equal(body.sources[0].id, fixture.id);
});
test('Gemini receives only retrieved context and rejects fabricated citation URLs', async () => {
  let requestBody;
  const context = '[1] TEST evidence\nContent: TEST approved request form.\nSource: Synthetic test source';
  const fetcher = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ answer: 'TEST approved form [1]', citations: [1] }) }] } }] });
  };
  assert.equal(await generateAnswer({ question: 'Test question', context, config: { GEMINI_API_KEY: 'test-only-secret' }, fetcher }), 'TEST approved form [1]');
  assert.match(requestBody.systemInstruction.parts[0].text, /untrusted data/);
  assert.equal(JSON.stringify(requestBody).includes('test-only-secret'), false);
  await assert.rejects(generateAnswer({ question: 'Test', context, config: { GEMINI_API_KEY: 'test-only' },
    fetcher: async () => Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ answer: 'See https://invented.test [1]', citations: [1] }) }] } }] }) }), /unsupported source URL/);
});
test('query embedding cache avoids repeated provider calls and validates dimensions', async () => {
  let count = 0;
  const embed = createEmbedder({ GEMINI_API_KEY: 'test-only' }, { fetcher: async () => { count++; return Response.json({ embedding: { values: Array(768).fill(1) } }); } });
  const [vector] = await embed(['TEST query'], { taskType: 'RETRIEVAL_QUERY' });
  await embed(['TEST query'], { taskType: 'RETRIEVAL_QUERY' });
  assert.equal(count, 1);
  assert.equal(vector.length, 768);
  assert.ok(Math.abs(vector.reduce((sum, value) => sum + value * value, 0) - 1) < 1e-8);
});
test('rate limits block bursts and recover after window', () => {
  let time = 0;
  const limit = createRateLimiter({ now: () => time });
  limit('test', { limit: 1, windowMs: 10 });
  assert.throws(() => limit('test', { limit: 1, windowMs: 10 }), /Too many requests/);
  time = 11;
  assert.doesNotThrow(() => limit('test', { limit: 1, windowMs: 10 }));
});
test('check summaries discard missing timestamps instead of fabricating a check', () => {
  const result = noAnnouncementAnswer({ sourcesChecked: [{ title: 'TEST no check', sourceUrl: 'https://www.ustp.edu.ph/' }] });
  assert.equal(result.verification.lastChecked, null);
  assert.deepEqual(result.verification.sourcesChecked, []);
});

test('document ingestion, version-bound review, metadata re-review and safe download are wired through HTTP', async () => {
  const connection = createMemoryKnowledgeConnection();
  const store = createKnowledgeStore(connection, { logger: silent, config: {} });
  const base = await api([], { knowledgeStore: store, authService: { requireAdmin: async () => ({ id: 'test-admin', role: 'admin' }) } });
  const post = async (path, body, method = 'POST') => {
    const response = await fetch(`${base}${path}`, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  const added = await post('/api/admin/sources', { sourceType: 'uploaded_document', title: 'TEST document request memo', category: 'Procedures', issuingOffice: 'TEST office', documentNumber: 'TEST-ONLY', upload: { filename: 'test-only.txt', mimeType: 'text/plain', data: Buffer.from(fixture.content).toString('base64') } });
  assert.equal(added.status, 201);
  const id = added.body.source.id;
  assert.deepEqual((await (await fetch(`${base}/api/knowledge`)).json()).items, []);
  assert.equal((await fetch(`${base}/api/documents/${id}`)).status, 404);
  assert.equal((await post(`/api/admin/sources/${id}/verify`, {})).status, 400);
  const verified = await post(`/api/admin/sources/${id}/verify`, { expectedVersion: added.body.source.version, expectedRevision: added.body.source.revision });
  assert.equal(verified.status, 200);
  assert.equal(verified.body.source.dataStatus, 'verified');
  const download = await fetch(`${base}/api/documents/${id}`);
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition'), /^attachment;/);
  assert.equal(await download.text(), fixture.content);
  const edited = await post(`/api/admin/sources/${id}`, { issuingOffice: 'TEST corrected office' }, 'PATCH');
  assert.equal(edited.body.source.dataStatus, 'unverified');
  assert.equal((await post(`/api/admin/sources/${id}/verify`, { expectedVersion: verified.body.source.version, expectedRevision: verified.body.source.revision })).status, 409);
  assert.equal((await fetch(`${base}/api/documents/${id}`)).status, 404);
});

test('manual HTTP refresh preserves flat source response and reports no change', async () => {
  const connection = createMemoryKnowledgeConnection();
  const store = createKnowledgeStore(connection, { logger: silent, config: {}, fetchSource: async () => ({ bytes: Buffer.from(fixture.content), contentType: 'text/plain', sourceUrl: 'https://www.ustp.edu.ph/' }) });
  const actor = { id: 'test-admin', role: 'admin' };
  const source = await store.createSource({ sourceType: 'official_webpage', title: fixture.title, sourceUrl: 'https://www.ustp.edu.ph/' }, { actor });
  await store.verifySource(source.id, { actor });
  const base = await api([], { knowledgeStore: store, authService: { requireAdmin: async () => actor } });
  const response = await fetch(`${base}/api/admin/sources/${source.id}/refresh`, { method: 'POST' });
  const body = await response.json();
  assert.equal(body.status, 'unchanged');
  assert.equal(body.source.id, source.id);
  assert.equal(body.source.version, 1);
});

test('document embeddings use bounded batches and keep chunk order', async () => {
  const sizes = [];
  const embed = createEmbedder({ GEMINI_API_KEY: 'test-only' }, { fetcher: async (url, options) => {
    assert.match(url, /batchEmbedContents$/);
    const requests = JSON.parse(options.body).requests;
    sizes.push(requests.length);
    return Response.json({ embeddings: requests.map((request) => ({ values: [Number(request.content.parts[0].text) + 1, ...Array(767).fill(1)] })) });
  } });
  const vectors = await embed(Array.from({ length: 45 }, (_, index) => String(index)));
  assert.deepEqual(sizes, [20, 20, 5]);
  assert.equal(vectors.length, 45);
  assert.ok(vectors[44][0] > vectors[0][0]);
});

test('the installed PDF parser extracts real bytes from a synthetic PDF', async () => {
  const stream = 'BT /F1 12 Tf 72 720 Td (TEST ONLY: document request form required.) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const start = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  const extracted = await extractText(Buffer.from(pdf), 'application/pdf');
  assert.match(extracted.text, /TEST ONLY: document request form required/);
});
