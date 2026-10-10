import { createServer } from 'node:http';
import { generateAnswer } from './ai/generate.mjs';
import { createEmbedder } from './ai/embeddings.mjs';
import { createAuthService } from './auth/service.mjs';
import { demoKnowledge, isUsableKnowledgeRecord, toPublicKnowledge } from './knowledge.mjs';
import { buildRetrievedContext, isOutOfScope, normalizeQuestion, rankKnowledge, selectContext } from './rag/retrieval.mjs';
import { isTimeSensitive, hasCurrentEventEvidence, noAnnouncementAnswer } from './rag/freshness.mjs';
import { createKnowledgeStore } from './db/knowledge-store.mjs';
import { createRateLimiter } from './security/rate-limit.mjs';

const personalAnswer = 'TRAIL AI Desk does not access personal student records, grades, class schedules, enrolled subjects, accounts, or financial information. Please use PRISMS or contact the appropriate university office.';
const noAnswer = 'I could not find relevant verified information in the current knowledge base. Please check official USTP channels or contact the appropriate university office.';

async function readBody(request, limit = 24000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return {};
  let parsed;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw Object.assign(new Error('Request body must be a JSON object.'), { status: 400 });
  return parsed;
}

function validateConversation(conversation) {
  if (conversation === undefined) return [];
  if (!Array.isArray(conversation) || conversation.length > 12) throw Object.assign(new Error('Conversation must contain at most 12 messages.'), { status: 400 });
  if (conversation.some((item) => !item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string')) throw Object.assign(new Error('Each conversation message needs a user or assistant role and text content.'), { status: 400 });
  return conversation.map((item) => ({ role: item.role, content: item.content.slice(0, 1500) }));
}

function sourceFor(record) {
  const publicRecord = toPublicKnowledge(record);
  const { content, keywords, metadata, embedding, score, lexicalScore, vectorScore, ...source } = publicRecord;
  return { ...source, metadata: { verifiedAt: metadata?.verifiedAt, verifiedBy: metadata?.verifiedBy,
    verificationMethod: metadata?.verificationMethod, contentVerifiedAt: metadata?.contentVerifiedAt } };
}

export function createApiServer({ connection = null, logger = console, aiConfig = process.env, config = aiConfig, knowledgeStore, authService, now = () => new Date(), answerGenerator = generateAnswer } = {}) {
  const embed = createEmbedder(aiConfig);
  const store = knowledgeStore || createKnowledgeStore(connection, { logger, config, embed });
  store.setEmbeddingFunction?.(embed);
  const auth = authService || createAuthService({ connection, config, logger });
  const rateLimit = createRateLimiter();
  const origins = (config.CORS_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006').split(',').map((item) => item.trim());

  const server = createServer(async (request, response) => {
    const origin = request.headers.origin;
    const headers = {
      'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
      'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer',
      'content-security-policy': "default-src 'none'; frame-ancestors 'none'", 'vary': 'Origin',
      'access-control-allow-headers': 'content-type,authorization',
      'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
      ...(origin && origins.includes(origin) ? { 'access-control-allow-origin': origin } : {}),
    };
    const send = (status, data) => { response.writeHead(status, headers); response.end(JSON.stringify(data)); };
    try {
      if (origin && !origins.includes(origin)) return send(403, { error: 'This application origin is not allowed.' });
      if (request.method === 'OPTIONS') { response.writeHead(204, headers); response.end(); return; }
      const url = new URL(request.url || '/', 'http://localhost');
      const ip = request.socket.remoteAddress || 'unknown'; // Do not trust arbitrary forwarded headers.
      rateLimit(`general:${ip}`, { limit: 120 });
      if (url.pathname.startsWith('/api/auth/')) rateLimit(`auth:${ip}`, { limit: 20, windowMs: 15 * 60000 });
      if (url.pathname === '/api/chat') rateLimit(`chat:${ip}`, { limit: 30 });

      if (request.method === 'GET' && url.pathname === '/health') return send(200, { status: 'ok', database: store.databaseStatus,
        auth: auth.configured ? 'database-backed' : 'demo-only', ai: aiConfig.GEMINI_API_KEY ? 'gemini-configured' : aiConfig.OPENAI_API_KEY ? 'legacy-provider-configured' : 'extractive', email: auth.passwordResetConfigured ? 'configured' : 'unconfigured' });

      if (request.method === 'POST' && url.pathname === '/api/auth/demo') {
        const body = await readBody(request);
        if (typeof body.email !== 'string' || typeof body.password !== 'string') return send(400, { error: 'Email and password are required.' });
        if (body.email.trim().toLowerCase() !== 'student@ustp.edu.ph' || body.password !== 'student123') return send(401, { error: 'The demo email or password is incorrect.' });
        return send(200, { user: { id: 'demo-student', name: 'Demo Student', email: 'student@ustp.edu.ph', role: 'student' }, demo: true });
      }
      const authActions = { '/api/auth/login': 'login', '/api/auth/forgot-password': 'forgotPassword', '/api/auth/reset-password': 'resetPassword' };
      if (request.method === 'POST' && authActions[url.pathname]) return send(200, await auth[authActions[url.pathname]](await readBody(request)));
      if (request.method === 'GET' && url.pathname === '/api/auth/me') return send(200, { user: await auth.authenticate(request.headers.authorization) });
      if (request.method === 'POST' && url.pathname === '/api/auth/logout') return send(200, await auth.logout(request.headers.authorization));

      if (url.pathname.startsWith('/api/admin/')) {
        const actor = await auth.requireAdmin(request.headers.authorization);
        if (url.pathname === '/api/admin/sources' && request.method === 'GET') return send(200, { items: await store.list({ query: url.searchParams.get('query') || url.searchParams.get('q') || '', admin: true }), database: store.databaseStatus });
        if (url.pathname === '/api/admin/sources' && request.method === 'POST') return send(201, { source: await store.createSource(await readBody(request, 7500000), { actor }) });
        const match = url.pathname.match(/^\/api\/admin\/sources\/([a-zA-Z0-9_-]{1,100})(?:\/(verify|unverify|archive|refresh|versions))?$/);
        if (match) {
          const [, id, action] = match;
          if (!action && request.method === 'PATCH') return send(200, { source: await store.updateSourceMetadata(id, await readBody(request), { actor }) });
          if (action === 'versions' && request.method === 'GET') return send(200, { items: await store.versions(id) });
          const methods = { verify: 'verifySource', unverify: 'unverifySource', archive: 'archiveSource', refresh: 'refreshSource' };
          if (methods[action] && request.method === 'POST') {
            const options = { actor };
            if (action === 'verify') {
              const body = await readBody(request);
              if (!Number.isInteger(body.expectedVersion) || body.expectedVersion < 1 || !Number.isInteger(body.expectedRevision) || body.expectedRevision < 0) return send(400, { error: 'Review the current source version and metadata before verifying it.' });
              options.expectedVersion = body.expectedVersion;
              options.expectedRevision = body.expectedRevision;
            }
            const result = await store[methods[action]](id, options);
            return send(200, action === 'refresh' ? { ...result, message: result.status === 'failed' ? 'The source check failed; the previous version is retained. Review the error below.' : result.status === 'unchanged' ? 'Source checked; content is unchanged.' : 'Source checked and a new version indexed.' } : { source: result });
          }
        }
        return send(404, { error: 'Administrative route not found.' });
      }

      const documentMatch = url.pathname.match(/^\/api\/documents\/([a-zA-Z0-9_-]{1,100})$/);
      if (documentMatch && request.method === 'GET') {
        const file = await store.getDocumentFile(documentMatch[1]);
        if (!file) return send(404, { error: 'Verified document not available.' });
        response.writeHead(200, { ...headers, 'content-type': file.mimeType,
          'content-disposition': `attachment; filename="${file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`, 'content-length': file.bytes.length,
          'content-security-policy': "default-src 'none'; sandbox" });
        response.end(file.bytes); return;
      }

      if (request.method === 'GET' && ['/api/knowledge', '/api/offices', '/api/calendar'].includes(url.pathname)) {
        const category = url.pathname === '/api/offices' ? 'Offices' : url.pathname === '/api/calendar' ? 'Academic calendar' : url.searchParams.get('category') || undefined;
        const items = (await store.list({ category })).filter(isUsableKnowledgeRecord).map(toPublicKnowledge);
        return send(200, { items, verified: items.some((item) => item.dataStatus === 'verified'), database: store.databaseStatus });
      }

      if (request.method === 'POST' && url.pathname === '/api/chat') {
        const body = await readBody(request);
        if (typeof body.question !== 'string') return send(400, { error: 'Question must be a string.' });
        const normalized = normalizeQuestion(body.question);
        if (!normalized.original) return send(400, { error: 'Enter a question before sending.' });
        if (normalized.original.length > 1000) return send(413, { error: 'Questions must be 1,000 characters or fewer.' });
        const conversation = validateConversation(body.conversation);
        const previousUser = [...conversation].reverse().find((item) => item.role === 'user')?.content || '';
        const followUp = /\b(it|that|those|them|there|what about|how about|where can i get|where can i request|and)\b/i.test(normalized.original);
        if (isOutOfScope(normalized.original) || (followUp && isOutOfScope(previousUser))) return send(200, { answer: personalAnswer,
          sources: [{ title: 'TRAIL AI Desk scope policy', category: 'Scope', office: 'PRISMS or the appropriate university office', source: 'Project scope boundary', lastUpdated: 'Current project policy', dataStatus: 'verified_policy' }], refused: true });
        const retrievalQuestion = followUp && previousUser ? `${previousUser} ${normalized.original}` : normalized.original;
        let selected, mode;
        if (store.searchChunks) {
          let queryEmbedding;
          if (embed.configured && store.databaseStatus === 'connected') {
            try { [queryEmbedding] = await embed([retrievalQuestion], { taskType: 'RETRIEVAL_QUERY' }); }
            catch { logger.warn('Query embedding unavailable; using lexical retrieval.'); }
          }
          const result = await store.searchChunks(retrievalQuestion, { queryEmbedding, embeddingModel: embed.model, limit: 12 });
          mode = result.mode;
          if (mode === 'demo') selected = selectContext(rankKnowledge(retrievalQuestion, result.records));
          else selected = selectContext(result.records.map((record) => ({ record, score: record.score || 1 })), { limit: 4 });
        } else {
          selected = selectContext(rankKnowledge(retrievalQuestion, await store.searchDocuments()));
          mode = store.databaseStatus === 'connected' ? 'lexical' : 'demo';
        }
        if (isTimeSensitive(retrievalQuestion)) selected = selected.filter((record) => hasCurrentEventEvidence(record, retrievalQuestion, { now: now(), intervalMs: Number(config.SOURCE_REFRESH_INTERVAL_HOURS || 24) * 3600000 }));
        if (!selected.length) {
          const fresh = isTimeSensitive(retrievalQuestion) ? noAnnouncementAnswer(await store.freshnessSummary?.() || {}) : { answer: noAnswer };
          return send(200, { ...fresh, sources: [], retrieval: { normalized: normalized.normalized, count: 0, mode } });
        }
        let answer;
        const context = buildRetrievedContext(selected);
        try { answer = await answerGenerator({ question: normalized.original, context, conversation, config: aiConfig, now: now() }); }
        catch { logger.error('AI generation failed.'); return send(503, { error: 'The AI service is temporarily unavailable. Please try again or check the retrieved source directly.', sources: selected.map(sourceFor) }); }
        const warnings = selected.filter((record) => record.lastCheckError || record.freshnessStatus === 'stale').map((record) => `${record.title}: ${record.lastCheckError ? 'the latest source check failed' : 'the source is due for another check'}.`);
        const extractive = selected.map((record, index) => `[${index + 1}] ${record.content}`).join('\n\n');
        return send(200, { answer: (answer || extractive) + (warnings.length ? `\n\nFreshness note: ${warnings.join(' ')}` : ''),
          sources: selected.map(sourceFor), demo: selected.some((record) => record.dataStatus === 'demo_unverified'),
          generation: answer ? 'ai' : 'extractive', retrieval: { normalized: normalized.normalized, count: selected.length, mode } });
      }
      return send(404, { error: 'Route not found.' });
    } catch (error) {
      logger.error(`Request failed (${error.status || 503}; ${error.name || 'Error'}).`);
      return send(error.status || 503, { error: error.status ? error.message : 'The server could not complete the request.' });
    }
  });
  server.knowledgeStore = store;
  server.authService = auth;
  return server;
}

export { demoKnowledge };
