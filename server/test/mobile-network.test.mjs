import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { requestChat } from '../../src/services/chat-api.mjs';

test('mobile API request rejects on network failure so the screen can render its retry state', async () => {
  await assert.rejects(
    requestChat('http://127.0.0.1:1', 'Where is the Registrar?', []),
    (error) => error instanceof TypeError || error.name === 'AbortError',
  );
});

test('offline demo retrieval rejects unknown offices while preserving Registrar and certificate queries', async () => {
  const source = await readFile(new URL('../../src/data/demo-knowledge.ts', import.meta.url), 'utf8');
  const javascript = stripTypeScriptTypes(source);
  const { retrieveKnowledge } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
  for (const question of ['Where is the quantum computing office?', 'How can I contact the quantum computing office at USTP?']) assert.equal(retrieveKnowledge(question), undefined, question);
  assert.equal(retrieveKnowledge('Where is the Registrar office?').id, 'sample-registrar');
  assert.equal(retrieveKnowledge('What are Certificate of Enrollment requirements?').id, 'sample-coe');
});
