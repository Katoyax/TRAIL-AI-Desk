import test from 'node:test';
import assert from 'node:assert/strict';
import { createKnowledgeStore } from '../src/db/knowledge-store.mjs';
import { createMemoryKnowledgeConnection } from './helpers/memory-knowledge.mjs';
import { chunkText, cleanText, contentHash, decodeUpload, extractText } from '../src/ingestion/extract.mjs';
import { fetchOfficialSource, isPublicAddress, validateSourceUrl } from '../src/ingestion/safe-fetch.mjs';

const quiet = { info() {}, error() {}, warn() {} };
const actor = { id: 'test-reviewer' };
const fixtureUrl = 'https://www.ustp.edu.ph/test-fixture';
const initialText = 'TEST FIXTURE ONLY. Certificate procedures require consulting the issuing office.';

function setup({ config = {}, withEmbeddings = true } = {}) {
  const connection = createMemoryKnowledgeConnection();
  let text = initialText;
  let failure;
  let calls = 0;
  let instant = new Date('2026-10-03T00:00:00Z');
  const embed = async (texts) => { calls += texts.length; return texts.map(() => [1, 0, 0]); };
  embed.model = 'test-model'; embed.configured = withEmbeddings;
  const store = createKnowledgeStore(connection, {
    config, logger: quiet, embed, now: () => instant,
    fetchSource: async () => { if (failure) throw failure; return { bytes: Buffer.from(text), contentType: 'text/plain', sourceUrl: fixtureUrl }; },
  });
  return { store, connection, get calls() { return calls; }, setText(value) { text = value; }, fail(error) { failure = error; }, advance() { instant = new Date(instant.getTime() + 86400000); } };
}

async function official(fixture) {
  const source = await fixture.store.createSource({ sourceType: 'official_webpage', sourceUrl: fixtureUrl, title: 'Certificate procedure TEST FIXTURE', category: 'Procedures', keywords: ['certificate'] }, { actor });
  return fixture.store.verifySource(source.id, { actor });
}

test('official URL ingestion requires explicit review; only verified active chunks enter RAG', async () => {
  const fixture = setup();
  const pending = await fixture.store.createSource({ sourceType: 'official_webpage', sourceUrl: fixtureUrl, title: 'Certificate TEST FIXTURE' }, { actor });
  assert.equal(pending.verificationStatus, 'pending_verification');
  assert.equal(pending.dataStatus, 'unverified');
  assert.equal((await fixture.store.searchChunks('certificate')).records.length, 0);
  const reviewed = await fixture.store.verifySource(pending.id, { actor });
  assert.equal(reviewed.dataStatus, 'verified');
  assert.equal(reviewed.metadata.verifiedBy, actor.id);
  assert.equal(reviewed.metadata.verificationMethod, 'admin_review');
  const result = await fixture.store.searchChunks('certificate', { queryEmbedding: [1, 0, 0], embeddingModel: 'test-model' });
  assert.equal(result.mode, 'hybrid-local');
  assert.equal(result.records[0].id, pending.id);
  assert.equal(result.records[0].content, initialText);
  await fixture.store.unverifySource(pending.id, { actor });
  assert.equal((await fixture.store.searchChunks('certificate')).records.length, 0);
});

test('verified lexical retrieval rejects an unknown office matched only by generic directory words', async () => {
  const fixture = setup({ withEmbeddings: false });
  const source = await fixture.store.createSource({ sourceType: 'office_verified_information', title: 'Registrar Office', category: 'Offices', keywords: ['registrar', 'office', 'location', 'contact'], content: 'The USTP Registrar Office handles academic document requests. Contact the office for its location.' }, { actor });
  await fixture.store.verifySource(source.id, { actor });
  for (const question of ['Where is the quantum computing office?', 'How can I contact the quantum computing office at USTP?']) {
    assert.deepEqual((await fixture.store.searchChunks(question)).records, [], question);
  }
  assert.equal((await fixture.store.searchChunks('Where is the Registrar office?')).records[0].id, source.id);
});

test('source refresh without change updates the actual check timestamp and avoids embeddings', async () => {
  const fixture = setup(); const source = await official(fixture); const calls = fixture.calls;
  fixture.advance();
  const result = await fixture.store.refreshSource(source.id);
  assert.equal(result.status, 'unchanged');
  assert.equal(result.source.version, 1);
  assert.equal(result.source.lastChecked, '2026-10-04T00:00:00.000Z');
  assert.equal(fixture.calls, calls);
  assert.equal((await fixture.store.versions(source.id)).length, 1);
});

test('changed refresh activates a new version, archives the old one, and retrieves latest content', async () => {
  const fixture = setup(); const source = await official(fixture);
  fixture.advance(); fixture.setText('TEST FIXTURE UPDATED. Certificate procedures now include a new sample instruction.');
  const result = await fixture.store.refreshSource(source.id);
  assert.equal(result.status, 'updated'); assert.equal(result.source.version, 2);
  assert.equal(result.source.dataStatus, 'verified');
  assert.equal(result.source.metadata.verificationMethod, 'official_url_refresh');
  assert.equal(result.source.metadata.contentVerifiedAt, '2026-10-04T00:00:00.000Z');
  assert.equal(result.source.metadata.verifiedBy, actor.id);
  const versions = await fixture.store.versions(source.id);
  assert.equal(versions[0].isActive, true); assert.equal(versions[1].verificationStatus, 'archived');
  const selected = await fixture.store.searchChunks('certificate');
  assert.ok(selected.records.length); assert.ok(selected.records.every((item) => item.version === 2 && /UPDATED/.test(item.content)));
});

test('failed source fetch retains the previous verified content and exposes the failed attempt', async () => {
  const fixture = setup(); const source = await official(fixture); const calls = fixture.calls;
  fixture.advance(); fixture.fail(new Error('TEST fixture network timeout'));
  const result = await fixture.store.refreshSource(source.id);
  assert.equal(result.status, 'failed'); assert.equal(result.source.version, 1);
  assert.equal(result.source.dataStatus, 'verified'); assert.equal(result.source.lastChecked, source.lastChecked);
  assert.match(result.source.lastCheckError, /timeout/); assert.equal(result.source.lastCheckAttempt, '2026-10-04T00:00:00.000Z');
  assert.equal((await fixture.store.searchChunks('certificate')).records[0].content, initialText);
  assert.equal(fixture.calls, calls);
});

test('activation conflict leaves old chunks authoritative and cleans the staged version', async () => {
  const fixture = setup(); const source = await official(fixture);
  fixture.setText('TEST FIXTURE CHANGED. Certificate source changed while another reviewer edited it.');
  fixture.connection.controls.failActivation = true;
  const result = await fixture.store.refreshSource(source.id);
  assert.equal(result.status, 'failed'); assert.equal(result.source.version, 1);
  assert.equal((await fixture.store.versions(source.id)).length, 1);
  assert.equal((await fixture.store.searchChunks('certificate')).records[0].content, initialText);
});

test('lost MongoDB activation acknowledgement never deletes the newly active content', async () => {
  const fixture = setup(); const source = await official(fixture);
  fixture.setText('TEST UPDATED FIXTURE. Certificate content survived a lost MongoDB acknowledgement.');
  fixture.connection.controls.loseActivationAcknowledgement = true;
  await assert.rejects(fixture.store.refreshSource(source.id), { status: 409 });
  fixture.connection.controls.loseActivationAcknowledgement = false;
  const latest = await fixture.store.getSource(source.id);
  assert.equal(latest.version, 2); assert.match(latest.content, /survived/);
  const selected = await fixture.store.searchChunks('certificate');
  assert.ok(selected.records.length && selected.records.every((record) => record.version === 2));
});

test('uploaded memo has no fabricated URL or source-check timestamp and safe download requires verification', async () => {
  const fixture = setup({ withEmbeddings: false });
  const memo = await fixture.store.createSource({ sourceType: 'uploaded_document', title: 'TEST fixture memorandum', documentNumber: 'TEST-ONLY', issuingOffice: 'Test office', dateIssued: '2026-10-03', upload: { filename: '../memo.txt', mimeType: 'text/plain', data: Buffer.from('TEST FIXTURE ONLY. Memorandum describes test student services.').toString('base64') } }, { actor });
  assert.equal(memo.sourceUrl, ''); assert.equal(memo.lastChecked, '');
  assert.equal(memo.fileAvailable, true); assert.equal(fixture.calls, 0);
  await assert.rejects(fixture.store.getDocumentFile(memo.id), { status: 404 });
  await fixture.store.verifySource(memo.id, { actor });
  const file = await fixture.store.getDocumentFile(memo.id);
  assert.equal(file.mimeType, 'text/plain'); assert.equal(file.filename.includes('/'), false);
  assert.match(file.bytes.toString(), /TEST FIXTURE/);
  const selectedMemo = (await fixture.store.searchChunks('memorandum')).records[0];
  assert.match(selectedMemo.source, /Memorandum No\. TEST-ONLY/);
  assert.equal(selectedMemo.fileAvailable, true); assert.equal(selectedMemo.viewUrl, `/api/documents/${memo.id}`);
  assert.deepEqual((await fixture.store.freshnessSummary()).sourcesChecked, []);
  await fixture.store.archiveSource(memo.id, { actor });
  assert.equal((await fixture.store.searchChunks('memorandum')).records.length, 0);
  await assert.rejects(fixture.store.getDocumentFile(memo.id), { status: 404 });
});

test('outdated records are excluded; legacy reviewed records remain readable without automatic verification', async () => {
  const fixture = setup();
  const legacy = { id: 'legacy-fixture', title: 'Legacy certificate fixture', category: 'Procedures', content: initialText, source: 'TEST source', lastUpdated: '2026-10-03', dataStatus: 'verified', metadata: { verifiedAt: '2026-10-03T00:00:00Z', verifiedBy: 'Test reviewer' } };
  await fixture.connection.database.collection('knowledge').insertOne(legacy);
  await fixture.connection.database.collection('knowledge').insertOne({ ...legacy, id: 'outdated-fixture', verificationStatus: 'outdated' });
  const result = await fixture.store.searchChunks('certificate');
  assert.equal(result.records.length, 1); assert.equal(result.records[0].id, 'legacy-fixture');
});

test('switching embedding models cannot reinterpret previously stored vectors', async () => {
  const fixture = setup(); await official(fixture);
  const result = await fixture.store.searchChunks('unrelated query', { queryEmbedding: [1, 0, 0], embeddingModel: 'different-model' });
  assert.equal(result.records.length, 0); assert.equal(result.mode, 'lexical');
});

test('Atlas candidates are gated by activeVersion and verification after vector search', async () => {
  const fixture = setup({ config: { MONGODB_VECTOR_INDEX: 'test_index' } }); const source = await official(fixture);
  fixture.setText('TEST UPDATED FIXTURE. Certificate procedures have an updated sample requirement.'); await fixture.store.refreshSource(source.id);
  const allChunks = fixture.connection.collections.get('knowledge_chunks');
  fixture.connection.controls.vectorCandidates = [...allChunks, { ...allChunks[0], _id: 'rogue', sourceId: 'unreviewed-source' }];
  const result = await fixture.store.searchChunks('certificate', { queryEmbedding: [1, 0, 0], embeddingModel: 'test-model' });
  assert.equal(result.mode, 'hybrid-atlas'); assert.ok(result.records.every((item) => item.version === 2));
});

test('MongoDB read failures visibly fall back to demo; writes never pretend to persist', async () => {
  const fixture = setup(); fixture.connection.controls.failReads = true;
  const result = await fixture.store.searchChunks('certificate');
  assert.equal(result.mode, 'demo'); assert.equal(result.records[0].dataStatus, 'demo_unverified');
  const missing = createKnowledgeStore(null, { logger: quiet });
  await assert.rejects(missing.createSource({ sourceType: 'office_verified_information', title: 'TEST', content: initialText }, { actor }), { status: 503 });
  fixture.connection.controls.failReads = false; fixture.connection.controls.failWrites = true;
  await assert.rejects(fixture.store.createSource({ sourceType: 'office_verified_information', title: 'TEST', content: initialText }, { actor }), { status: 503 });
});

test('metadata edits cannot set verification or forged source-check fields', async () => {
  const fixture = setup(); const source = await official(fixture);
  await assert.rejects(fixture.store.updateSourceMetadata(source.id, { lastChecked: '2026-10-04', verificationStatus: 'verified' }, { actor }), { status: 400 });
  await assert.rejects(fixture.store.createSource({ sourceType: 'uploaded_document', sourceUrl: fixtureUrl, title: 'TEST' }, { actor }), { status: 400 });
  await assert.rejects(fixture.store.createSource({ sourceType: 'official_webpage', sourceUrl: 'https://evil.example', title: 'TEST' }, { actor }), { status: 400 });
});

test('source metadata edits require review again and public knowledge hides pending content', async () => {
  const fixture = setup(); const source = await official(fixture);
  assert.equal((await fixture.store.list()).length, 1);
  const edited = await fixture.store.updateSourceMetadata(source.id, { issuingOffice: 'Updated TEST office', effectiveFrom: '2026-10-04', effectiveTo: '2026-10-05' }, { actor });
  assert.equal(edited.verificationStatus, 'pending_verification'); assert.equal(edited.metadata.verifiedBy, undefined);
  assert.equal((await fixture.store.list()).length, 0); assert.equal((await fixture.store.list({ admin: true })).length, 1);
  assert.equal((await fixture.store.searchChunks('certificate')).records.length, 0);
  await fixture.store.verifySource(source.id, { actor, expectedVersion: source.version });
  assert.equal((await fixture.store.list())[0].effectiveFrom, '2026-10-04');
});

test('verification rejects a version the reviewer has not reviewed', async () => {
  const fixture = setup(); const source = await official(fixture);
  fixture.setText('UPDATED TEST FIXTURE. Certificate procedures include a modified test instruction.');
  await fixture.store.refreshSource(source.id);
  await assert.rejects(fixture.store.verifySource(source.id, { actor, expectedVersion: 1 }), { status: 409 });
});

test('verification rejects changed metadata even when the content version is unchanged', async () => {
  const fixture = setup(); const source = await official(fixture);
  const edited = await fixture.store.updateSourceMetadata(source.id, { title: 'Edited TEST title' }, { actor });
  assert.equal(edited.version, source.version); assert.ok(edited.revision > source.revision);
  await assert.rejects(fixture.store.verifySource(source.id, { actor, expectedVersion: source.version, expectedRevision: source.revision }), { status: 409 });
  await fixture.store.verifySource(source.id, { actor, expectedVersion: edited.version, expectedRevision: edited.revision });
});

test('metadata rejects impossible calendar dates and reversed effective date ranges', async () => {
  const fixture = setup(); const source = await official(fixture);
  for (const dateIssued of ['2026-02-31', '2026-02-29', '2026-13-01', 'October 3, 2026', '2026-10-03T25:00:00Z']) await assert.rejects(fixture.store.updateSourceMetadata(source.id, { dateIssued }, { actor }), { status: 400 });
  await fixture.store.updateSourceMetadata(source.id, { dateIssued: '2024-02-29', effectiveFrom: '2026-10-03', effectiveTo: '2026-10-04' }, { actor });
  await assert.rejects(fixture.store.updateSourceMetadata(source.id, { effectiveFrom: '2026-10-05' }, { actor }), { status: 400 });
});

test('SSRF URL allowlist rejects protocol, credentials, port, deceptive domain, and IP literals', () => {
  for (const url of ['http://ustp.edu.ph', 'file:///etc/passwd', 'https://ustp.edu.ph.evil.example', 'https://evilustp.edu.ph', 'https://user:secret@ustp.edu.ph', 'https://ustp.edu.ph:3000', 'https://127.0.0.1', 'https://[::1]', 'https://2130706433']) assert.throws(() => validateSourceUrl(url), { status: 400 }, url);
  assert.equal(validateSourceUrl('https://www.ustp.edu.ph/path#part').href, 'https://www.ustp.edu.ph/path');
});

test('SSRF DNS validation blocks internal, metadata, mapped IPv6, and reserved addresses', async () => {
  for (const address of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '172.16.0.1', '192.168.0.1', '100.64.0.1', '198.18.0.1', '0.0.0.0', '::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '2001:db8::1', '2001:0db8::1', '2002:7f00:1::']) {
    assert.equal(isPublicAddress(address), false, address);
    await assert.rejects(fetchOfficialSource(fixtureUrl, { lookup: async () => [{ address, family: address.includes(':') ? 6 : 4 }], request: async () => { throw new Error('Unsafe transport must never run'); } }), { status: 400 });
  }
  assert.equal(isPublicAddress('8.8.8.8'), true); assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
});

test('safe fetch pins validated DNS and validates every redirect and every DNS address', async () => {
  let requests = 0; let lookups = 0;
  const result = await fetchOfficialSource(fixtureUrl, { lookup: async () => { lookups++; return [{ address: '8.8.8.8', family: 4 }]; }, request: async (url, options) => {
    requests++; assert.equal(options.address, '8.8.8.8');
    return requests === 1 ? { status: 302, headers: { location: '/next' }, bytes: Buffer.alloc(0) } : { status: 200, headers: { 'content-type': 'text/plain' }, bytes: Buffer.from(initialText) };
  } });
  assert.equal(requests, 2); assert.equal(lookups, 2); assert.equal(result.sourceUrl, 'https://www.ustp.edu.ph/next');
  await assert.rejects(fetchOfficialSource(fixtureUrl, { lookup: async () => [{ address: '8.8.8.8', family: 4 }], request: async () => ({ status: 302, headers: { location: 'https://evil.example/' }, bytes: Buffer.alloc(0) }) }), { status: 400 });
  await assert.rejects(fetchOfficialSource(fixtureUrl, { lookup: async () => [{ address: '8.8.8.8', family: 4 }, { address: '127.0.0.1', family: 4 }] }), { status: 400 });
});

test('source response limits and document validation reject unsupported unsafe inputs', async () => {
  const lookup = async () => [{ address: '8.8.8.8', family: 4 }];
  await assert.rejects(fetchOfficialSource(fixtureUrl, { lookup, maxBytes: 3, request: async () => ({ status: 200, headers: { 'content-type': 'text/plain' }, bytes: Buffer.from('large') }) }), { status: 400 });
  await assert.rejects(fetchOfficialSource(fixtureUrl, { lookup, request: async () => ({ status: 200, headers: { 'content-type': 'application/javascript' }, bytes: Buffer.from('script') }) }), { status: 400 });
  assert.throws(() => decodeUpload({ data: 'not base64', mimeType: 'text/plain' }), { status: 400 });
  assert.throws(() => decodeUpload({ data: Buffer.from('<script>').toString('base64'), mimeType: 'text/html' }), { status: 400 });
  await assert.rejects(extractText(Buffer.from('not a PDF'), 'application/pdf'), { status: 400 });
  assert.equal(cleanText(' A\t B\r\n\r\n\r\n C '), 'A B\n\nC');
  assert.equal(contentHash('same  content'), contentHash('same content'));
  const chunks = chunkText('word '.repeat(1000));
  assert.ok(chunks.length > 1 && chunks.every((chunk) => chunk.content.length <= 1800));
});
