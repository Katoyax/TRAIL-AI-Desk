import { randomUUID } from 'node:crypto';
import { demoKnowledge, isUsableKnowledgeRecord, toPublicKnowledge, SOURCE_TYPES } from '../knowledge.mjs';
import { cleanText, contentHash, decodeUpload, extractText } from '../ingestion/extract.mjs';
import { DEFAULT_ALLOWED_DOMAINS, fetchOfficialSource, validateSourceUrl } from '../ingestion/safe-fetch.mjs';
import { createSourceRefresher, prepareChunks } from '../ingestion/refresh.mjs';
import { hasTopicMatch } from '../rag/retrieval.mjs';

const problem = (message, status = 400) => Object.assign(new Error(message), { status });
const dateFields = ['dateIssued', 'datePublished', 'effectiveFrom', 'effectiveTo'];
const textFields = ['title', 'documentTitle', 'documentNumber', 'issuingOffice', 'category'];
const allowedPatchFields = new Set([...textFields, ...dateFields, 'keywords']);

function validDate(value) {
  if (typeof value !== 'string' || value.length > 40) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hours, minutes, seconds] = match;
  if (+month < 1 || +month > 12 || +day < 1 || +day > new Date(Date.UTC(+year, +month, 0)).getUTCDate()) return false;
  if (hours !== undefined && (+hours > 23 || +minutes > 59 || +seconds > 59)) return false;
  return Number.isFinite(Date.parse(value));
}

function validateEffectiveRange(metadata) {
  if (metadata.effectiveFrom && metadata.effectiveTo && Date.parse(metadata.effectiveFrom) > Date.parse(metadata.effectiveTo)) throw problem('Effective end date must be on or after the start date.');
}

export function validateSourceMetadata(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw problem('Source metadata must be an object.');
  const output = {};
  for (const field of textFields) {
    if (input[field] === undefined) continue;
    if (typeof input[field] !== 'string' || input[field].length > 300) throw problem(`${field} must be text of at most 300 characters.`);
    output[field] = cleanText(input[field]);
  }
  if (!partial && !(output.documentTitle || output.title)) throw problem('A document title is required.');
  if (output.documentTitle) output.title = output.documentTitle;
  else if (output.title) output.documentTitle = output.title;
  if (!partial || input.category !== undefined) output.category ||= 'University information';
  for (const field of dateFields) {
    if (input[field] === undefined) continue;
    if (input[field] !== '' && !validDate(input[field])) throw problem(`${field} must be an actual YYYY-MM-DD date or ISO timestamp.`);
    output[field] = input[field];
  }
  validateEffectiveRange(output);
  if (input.keywords !== undefined) {
    if (!Array.isArray(input.keywords) || input.keywords.length > 40 || input.keywords.some((word) => typeof word !== 'string' || word.length > 100)) throw problem('Keywords must contain at most 40 short text values.');
    output.keywords = input.keywords.map(cleanText).filter(Boolean);
  }
  return output;
}

function actorId(actor) {
  const id = typeof actor === 'string' ? actor : actor?.id || actor?._id || actor?.email;
  if (!id || !String(id).trim()) throw problem('An authenticated reviewer is required.', 403);
  return String(id).slice(0, 200);
}

function tokens(text) { return [...new Set((String(text || '').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []).filter((token) => !['the', 'and', 'are', 'what', 'where', 'how', 'for', 'does', 'can', 'this', 'that', 'with', 'from', 'please'].includes(token)))]; }
function lexicalScore(query, record) {
  const fields = [[tokens(record.title), 4], [tokens((record.keywords || []).join(' ')), 3], [tokens(record.category), 1.5], [tokens(record.content), 0.5]];
  if (!hasTopicMatch(query, fields.flatMap(([words]) => words))) return 0;
  return query.reduce((total, token) => total + fields.reduce((score, [words, weight]) => score + (words.some((word) => word === token || (token.length > 4 && word.replace(/s$/, '') === token.replace(/s$/, ''))) ? weight : 0), 0), 0);
}
function cosine(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || !left.length) return null;
  let product = 0; let leftSize = 0; let rightSize = 0;
  for (let index = 0; index < left.length; index++) { product += left[index] * right[index]; leftSize += left[index] ** 2; rightSize += right[index] ** 2; }
  return leftSize && rightSize ? product / Math.sqrt(leftSize * rightSize) : null;
}

export function createKnowledgeStore(connection, {
  logger = console, config = process.env, embed, now = () => new Date(), fetchSource, extractSource = extractText,
  allowedDomains = String(config.SOURCE_ALLOWED_DOMAINS || DEFAULT_ALLOWED_DOMAINS.join(',')).split(',').map((value) => value.trim()).filter(Boolean),
  intervalMs = Math.max(60_000, Number(config.SOURCE_REFRESH_INTERVAL_HOURS || 24) * 3_600_000),
} = {}) {
  let databaseAvailable = Boolean(connection?.database);
  let embeddingFunction = embed;
  const database = connection?.database;
  const locks = new Map();
  const collection = (name) => {
    if (!database) throw problem('MongoDB must be configured and connected for knowledge changes.', 503);
    return database.collection(name);
  };
  const officialFetch = fetchSource || ((url) => fetchOfficialSource(url, { allowedDomains }));

  async function readMongo(work) {
    if (!database) return null;
    try { const value = await work(); databaseAvailable = true; return value; }
    catch (error) { databaseAvailable = false; logger.error(`MongoDB knowledge query failed (${error.name || 'Error'}); using labeled read-only demo fallback.`); return null; }
  }
  async function writeMongo(work) {
    if (!database) throw problem('MongoDB must be configured and connected for knowledge changes.', 503);
    try { const value = await work(); databaseAvailable = true; return value; }
    catch (error) { if (error.status) throw error; databaseAvailable = false; logger.error(`MongoDB knowledge write failed (${error.name || 'Error'}).`); throw problem('The knowledge database could not save this change.', 503); }
  }
  async function locked(id, work) {
    if (locks.has(id)) throw problem('This source is already being processed. Try again shortly.', 409);
    locks.set(id, true);
    try { return await work(); } finally { locks.delete(id); }
  }
  async function rawSource(id) { return collection('knowledge_sources').findOne({ _id: String(id) }); }
  async function activeVersion(source) { return source?.activeVersion ? collection('knowledge_versions').findOne({ _id: source.activeVersion, sourceId: source._id }) : null; }
  async function sourceRecord(source, { content = true } = {}) {
    const version = await activeVersion(source);
    return toPublicKnowledge({ ...version, ...source, id: source._id, sourceId: source._id, content: content ? version?.content || '' : '', fileAvailable: Boolean(version?.file), version: source.version || 0 });
  }
  async function getSource(id) {
    return writeMongo(async () => { const source = await rawSource(id); return source ? sourceRecord(source) : null; });
  }
  async function recordCheck(id, patch, expected) {
    const result = await collection('knowledge_sources').updateOne({ _id: String(id), ...(expected ? { activeVersion: expected.activeVersion ?? null, revision: expected.revision || 0 } : {}) }, { $set: patch });
    if (expected && !result.matchedCount) throw problem('The source changed during its check. Retry to check its current version.', 409);
    return result;
  }

  async function commitVersion(source, { text, contentHash: hash, chunks, checkedAt, nextCheck, fetchedUrl, file }) {
    const versionId = randomUUID();
    const timestamp = now().toISOString();
    const version = (source.version || 0) + 1;
    const inheritedReview = checkedAt && source.verificationStatus === 'verified';
    const versionMetadata = inheritedReview
      ? { ...source.metadata, verificationMethod: 'official_url_refresh', contentVerifiedAt: checkedAt }
      : source.metadata || {};
    const document = {
      _id: versionId, sourceId: source._id, version, content: text, contentHash: hash,
      createdAt: timestamp, lastUpdated: timestamp, isActive: false, verificationStatus: source.verificationStatus,
      metadata: versionMetadata, ...(file ? { file: file.bytes, fileName: file.filename, mimeType: file.mimeType } : {}),
    };
    await collection('knowledge_versions').insertOne(document);
    let safeToCleanStaging = true;
    try {
      if (chunks.length) await collection('knowledge_chunks').insertMany(chunks.map((chunk) => ({
        ...chunk, _id: randomUUID(), sourceId: source._id, versionId, version,
        title: source.title, category: source.category, keywords: source.keywords || [],
        embeddingModel: chunk.embedding ? embeddingFunction?.model || 'configured-embedding-model' : null,
      })));
      const patch = {
        activeVersion: versionId, version, contentHash: hash, lastUpdated: timestamp,
        refreshStatus: checkedAt ? 'updated' : 'indexed', lastCheckError: '',
        ...(checkedAt ? { lastChecked: checkedAt, lastCheckAttempt: checkedAt, nextCheck, lastFetchedUrl: fetchedUrl || source.sourceUrl } : {}),
        ...(inheritedReview ? { 'metadata.verificationMethod': 'official_url_refresh', 'metadata.contentVerifiedAt': checkedAt } : {}),
        ...(file ? { fileAvailable: true, fileName: file.filename, mimeType: file.mimeType } : {}),
      };
      // The single-document pointer swap is authoritative even on standalone
      // MongoDB. Readers gate every chunk against it, including Atlas results.
      // A network error after this write may hide a successful activation.
      // Retain staged data whenever acknowledgement is ambiguous: deleting it
      // could otherwise delete the newly active version.
      safeToCleanStaging = false;
      const activated = await collection('knowledge_sources').updateOne({ _id: source._id, activeVersion: source.activeVersion ?? null, revision: source.revision || 0 }, { $set: patch, $inc: { revision: 1 } });
      if (!activated.matchedCount) { safeToCleanStaging = true; throw problem('The source changed while being indexed. Retry the operation.', 409); }
    } catch (error) {
      if (safeToCleanStaging) {
        await collection('knowledge_chunks').deleteMany({ versionId }).catch(() => {});
        await collection('knowledge_versions').deleteOne({ _id: versionId }).catch(() => {});
      }
      throw error;
    }
    // Activation already committed. Archive markers are bookkeeping; failure
    // cannot roll back or delete newly activated source content.
    await collection('knowledge_versions').updateOne({ _id: versionId }, { $set: { isActive: true } }).catch(() => logger.warn('Version activation bookkeeping needs reconciliation.'));
    if (source.activeVersion) await collection('knowledge_versions').updateOne({ _id: source.activeVersion }, { $set: { isActive: false, verificationStatus: 'archived', archivedAt: timestamp } }).catch(() => logger.warn('Version archive bookkeeping needs reconciliation.'));
  }

  async function loadRecords({ category, query, admin = false } = {}) {
    const sources = await collection('knowledge_sources').find(admin ? {} : { isActive: true, verificationStatus: 'verified' }).limit(500).toArray();
    const versions = await collection('knowledge_versions').find({ _id: { $in: sources.map((source) => source.activeVersion).filter(Boolean) } }, { projection: { file: 0 } }).limit(500).toArray();
    const versionMap = new Map(versions.map((version) => [version._id, version]));
    const modern = sources.map((source) => {
      const version = versionMap.get(source.activeVersion);
      return toPublicKnowledge({ ...version, ...source, id: source._id, sourceId: source._id, content: version?.content || '', fileAvailable: Boolean(version?.fileName), version: source.version || 0 });
    });
    const legacy = await collection('knowledge').find({ active: { $ne: false }, ...(category ? { category } : {}) }).limit(500).toArray();
    return [...modern, ...legacy.filter(isUsableKnowledgeRecord).map(toPublicKnowledge)]
      .filter((item) => (admin || item.dataStatus === 'verified' || item.dataStatus === 'demo_unverified')
        && (!category || item.category === category) && (!query || `${item.title} ${item.content} ${item.office} ${item.documentNumber}`.toLowerCase().includes(String(query).toLowerCase())));
  }

  const api = {
    get databaseStatus() { return databaseAvailable ? 'connected' : 'demo-fallback'; },
    setEmbeddingFunction(fn) { embeddingFunction = fn; },
    async list(options = {}) {
      if (options.admin) return writeMongo(() => loadRecords(options));
      const records = await readMongo(() => loadRecords(options));
      return records ?? demoKnowledge.map(toPublicKnowledge).filter((item) => !options.category || item.category === options.category);
    },
    async searchDocuments() {
      const records = await readMongo(() => loadRecords());
      return records ? records.filter((record) => record.dataStatus === 'verified' && record.isActive) : demoKnowledge.map(toPublicKnowledge);
    },
    async searchChunks(query, { queryEmbedding, embeddingModel, limit = 12 } = {}) {
      const result = await readMongo(async () => {
        const sources = await collection('knowledge_sources').find({ isActive: true, verificationStatus: 'verified' }).limit(500).toArray();
        const verified = sources.filter((source) => toPublicKnowledge(source).dataStatus === 'verified' && source.activeVersion);
        const sourceMap = new Map(verified.map((source) => [String(source._id), source]));
        const queryTokens = tokens(query);
        let chunks = [];
        let atlas = false;
        if (queryEmbedding?.length && config.MONGODB_VECTOR_INDEX) {
          try {
            chunks = await collection('knowledge_chunks').aggregate([
              { $vectorSearch: { index: config.MONGODB_VECTOR_INDEX, path: 'embedding', queryVector: queryEmbedding, numCandidates: Math.max(100, limit * 20), limit: Math.max(30, limit * 3), filter: { versionId: { $in: verified.map((source) => source.activeVersion) }, ...(embeddingModel ? { embeddingModel } : {}) } } },
              { $addFields: { atlasScore: { $meta: 'vectorSearchScore' } } },
            ], { maxTimeMS: 5000 }).toArray();
            atlas = true;
          } catch (error) { logger.warn(`Atlas Vector Search unavailable (${error.name}); using bounded local hybrid retrieval.`); }
        }
        let lexical = [];
        try {
          if (queryTokens.length) lexical = await collection('knowledge_chunks').find({ versionId: { $in: verified.map((source) => source.activeVersion) }, $text: { $search: queryTokens.join(' ') } }, { projection: { lexicalDbScore: { $meta: 'textScore' } } }).sort({ lexicalDbScore: { $meta: 'textScore' } }).limit(Math.max(60, limit * 5)).toArray();
        } catch (error) { logger.warn(`MongoDB text search unavailable (${error.name}); using bounded lexical fallback.`); }
        if (!atlas) chunks = await collection('knowledge_chunks').find({ versionId: { $in: verified.map((source) => source.activeVersion) } }).limit(1500).toArray();
        const unique = new Map([...chunks, ...lexical].map((chunk) => [String(chunk._id), chunk]));
        const records = [...unique.values()].filter((chunk) => sourceMap.get(String(chunk.sourceId))?.activeVersion === chunk.versionId)
          .map((chunk) => {
            const source = sourceMap.get(String(chunk.sourceId));
            const record = toPublicKnowledge({ ...chunk, ...source, id: source._id, sourceId: source._id, chunkId: String(chunk._id), content: chunk.content, embedding: chunk.embedding });
            return { ...record, lexicalScore: lexicalScore(queryTokens, record), vectorScore: queryEmbedding && chunk.embeddingModel === embeddingModel ? cosine(queryEmbedding, chunk.embedding) : null };
          });
        const legacy = await collection('knowledge').find({ active: { $ne: false } }).limit(500).toArray();
        for (const item of legacy.filter(isUsableKnowledgeRecord).map(toPublicKnowledge).filter((item) => item.dataStatus === 'verified' && item.isActive)) {
          records.push({ ...item, chunkId: `legacy:${item.id}`, lexicalScore: lexicalScore(queryTokens, item), vectorScore: null });
        }
        const lexicalRank = records.filter((item) => item.lexicalScore >= 2.5).sort((left, right) => right.lexicalScore - left.lexicalScore);
        const semanticRank = records.filter((item) => item.vectorScore !== null && item.vectorScore >= Number(config.RETRIEVAL_MIN_COSINE || 0.45)).sort((left, right) => right.vectorScore - left.vectorScore);
        const fused = new Map();
        for (const ranked of [lexicalRank, semanticRank]) ranked.forEach((item, index) => {
          const key = item.chunkId;
          const existing = fused.get(key) || { ...item, score: 0 };
          existing.score += 1 / (60 + index + 1);
          fused.set(key, existing);
        });
        return { records: [...fused.values()].sort((left, right) => right.score - left.score).slice(0, Math.min(30, limit)), mode: semanticRank.length ? (atlas ? 'hybrid-atlas' : 'hybrid-local') : 'lexical' };
      });
      if (result) return result;
      const queryTokens = tokens(query);
      return { records: demoKnowledge.map(toPublicKnowledge).map((record) => ({ ...record, score: lexicalScore(queryTokens, record) })).filter((record) => record.score >= 2.5).sort((a, b) => b.score - a.score).slice(0, limit), mode: 'demo' };
    },
    getSource,
    async createSource(input, { actor } = {}) {
      const reviewer = actorId(actor);
      collection('knowledge_sources');
      const metadata = validateSourceMetadata(input);
      if (!SOURCE_TYPES.includes(input.sourceType)) throw problem('Choose a supported source type.');
      if (input.sourceUrl && !['official_webpage', 'official_pdf'].includes(input.sourceType)) throw problem('Uploaded documents and office information must not invent a public source URL.');
      let text; let file; let checkedAt; let nextCheck; let fetchedUrl;
      if (['official_webpage', 'official_pdf'].includes(input.sourceType)) {
        const url = validateSourceUrl(input.sourceUrl, { allowedDomains });
        const fetched = await officialFetch(url.href);
        const extracted = await extractSource(fetched.bytes, fetched.contentType);
        text = extracted.text;
        checkedAt = now().toISOString(); nextCheck = new Date(Date.parse(checkedAt) + intervalMs).toISOString(); fetchedUrl = fetched.sourceUrl;
        if (input.sourceType === 'official_pdf' && fetched.contentType !== 'application/pdf') throw problem('An official PDF source must return a PDF document.');
      } else if (input.upload) {
        file = decodeUpload(input.upload);
        text = (await extractSource(file.bytes, file.mimeType)).text;
      } else {
        if (input.sourceType === 'uploaded_document') throw problem('Choose a PDF or text file to upload.');
        text = cleanText(input.content);
        if (text.length < 20 || text.length > 750_000) throw problem('Office information must contain 20 to 750,000 characters of readable text.');
      }
      const chunks = await prepareChunks(text, { embed: embeddingFunction });
      const timestamp = now().toISOString();
      const source = {
        _id: randomUUID(), ...metadata, sourceType: input.sourceType,
        ...(input.sourceUrl ? { sourceUrl: validateSourceUrl(input.sourceUrl, { allowedDomains }).href } : {}),
        verificationStatus: 'pending_verification', isActive: true, activeVersion: null, version: 0, revision: 0,
        createdAt: timestamp, createdBy: reviewer, metadata: {}, keywords: metadata.keywords || [],
      };
      return writeMongo(async () => {
        await collection('knowledge_sources').insertOne(source);
        try { await commitVersion(source, { text, contentHash: contentHash(text), chunks, checkedAt, nextCheck, fetchedUrl, file }); }
        catch (error) { await recordCheck(source._id, { refreshStatus: 'failed', lastCheckError: 'Initial indexing did not finish. Add the source again or retry refresh.' }).catch(() => {}); throw error; }
        return getSource(source._id);
      });
    },
    async updateSourceMetadata(id, patch, { actor } = {}) {
      const reviewer = actorId(actor);
      if (!patch || typeof patch !== 'object' || Object.keys(patch).some((key) => !allowedPatchFields.has(key))) throw problem('Only source metadata fields can be edited.');
      const values = validateSourceMetadata(patch, { partial: true });
      return writeMongo(async () => {
        const source = await rawSource(id);
        if (!source) throw problem('Source not found. Legacy records must be re-ingested before editing.', 404);
        validateEffectiveRange({ ...source, ...values });
        const result = await collection('knowledge_sources').updateOne({ _id: String(id), revision: source.revision || 0 }, {
          $set: { ...values, lastUpdated: now().toISOString(), updatedBy: reviewer, verificationStatus: 'pending_verification' },
          $unset: { 'metadata.verifiedAt': '', 'metadata.verifiedBy': '', 'metadata.verificationMethod': '', 'metadata.contentVerifiedAt': '' }, $inc: { revision: 1 },
        });
        if (!result.matchedCount) throw problem('The source changed during editing. Reload it and try again.', 409);
        return getSource(id);
      });
    },
    async verifySource(id, { actor, expectedVersion, expectedRevision } = {}) {
      const reviewer = actorId(actor);
      return writeMongo(async () => {
        const source = await rawSource(id);
        if (!source?.activeVersion) throw problem('A source must finish indexing before verification.', 400);
        if (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion !== source.version)) throw problem('The source version changed. Review the current content before verifying it.', 409);
        if (expectedRevision !== undefined && (!Number.isInteger(expectedRevision) || expectedRevision !== source.revision)) throw problem('The source metadata changed. Review the current metadata before verifying it.', 409);
        const timestamp = now().toISOString();
        const reviewMetadata = { 'metadata.verifiedAt': timestamp, 'metadata.verifiedBy': reviewer, 'metadata.verificationMethod': 'admin_review', 'metadata.contentVerifiedAt': timestamp };
        const verified = await collection('knowledge_sources').updateOne({ _id: source._id, activeVersion: source.activeVersion, revision: source.revision || 0 }, { $set: { verificationStatus: 'verified', isActive: true, ...reviewMetadata }, $inc: { revision: 1 } });
        if (!verified.matchedCount) throw problem('The source changed during verification. Review the current version and try again.', 409);
        await collection('knowledge_versions').updateOne({ _id: source.activeVersion }, { $set: { verificationStatus: 'verified', ...reviewMetadata } }).catch(() => logger.warn('Version verification bookkeeping needs reconciliation.'));
        return getSource(id);
      });
    },
    async unverifySource(id, { actor } = {}) {
      actorId(actor);
      return writeMongo(async () => {
        const result = await collection('knowledge_sources').updateOne({ _id: String(id) }, { $set: { verificationStatus: 'pending_verification' }, $unset: { 'metadata.verifiedAt': '', 'metadata.verifiedBy': '', 'metadata.verificationMethod': '', 'metadata.contentVerifiedAt': '' }, $inc: { revision: 1 } });
        if (!result.matchedCount) throw problem('Source not found.', 404);
        return getSource(id);
      });
    },
    async archiveSource(id, { actor } = {}) {
      actorId(actor);
      return writeMongo(async () => {
        const result = await collection('knowledge_sources').updateOne({ _id: String(id) }, { $set: { verificationStatus: 'archived', isActive: false, archivedAt: now().toISOString() }, $inc: { revision: 1 } });
        if (!result.matchedCount) throw problem('Source not found.', 404);
        return getSource(id);
      });
    },
    async versions(id) {
      return writeMongo(async () => {
        const source = await rawSource(id);
        if (!source) throw problem('Source not found.', 404);
        const versions = await collection('knowledge_versions').find({ sourceId: String(id) }, { projection: { file: 0, content: 0 } }).sort({ version: -1 }).limit(100).toArray();
        return versions.map((version) => ({ id: String(version._id), version: version.version, isActive: version._id === source.activeVersion, contentHash: version.contentHash, createdAt: version.createdAt, verificationStatus: version._id === source.activeVersion ? source.verificationStatus : 'archived' }));
      });
    },
    async getDocumentFile(id, { admin = false } = {}) {
      return writeMongo(async () => {
        const source = await rawSource(id);
        if (!source || (!admin && (toPublicKnowledge(source).dataStatus !== 'verified' || !source.isActive))) throw problem('Document not found.', 404);
        const version = await activeVersion(source);
        if (!version?.file) throw problem('No uploaded document is available for this source.', 404);
        const bytes = Buffer.isBuffer(version.file) ? version.file : Buffer.from(version.file.buffer || version.file.value());
        return { bytes, mimeType: version.mimeType, filename: version.fileName };
      });
    },
    async refreshSource(id) {
      return locked(String(id), () => writeMongo(async () => {
        const refresher = createSourceRefresher({
          repository: { getSource: rawSource, recordCheck, commitVersion }, fetchSource: officialFetch, extractSource,
          embed: embeddingFunction, now, intervalMs,
        });
        const result = await refresher(id);
        return { ...result, source: result.source ? await sourceRecord(result.source) : null };
      }));
    },
    async refreshDueSources() {
      if (!database) return [];
      const due = await collection('knowledge_sources').find({
        isActive: true, verificationStatus: 'verified', sourceType: { $in: ['official_webpage', 'official_pdf'] },
        $or: [{ nextCheck: { $lte: now().toISOString() } }, { nextCheck: { $exists: false } }],
      }).limit(30).toArray();
      const results = [];
      for (const source of due) { try { results.push(await api.refreshSource(source._id)); } catch (error) { logger.warn(`Scheduled source check failed (${error.name}).`); } }
      return results;
    },
    async freshnessSummary() {
      const value = await readMongo(async () => {
        const sources = await collection('knowledge_sources').find({ isActive: true, verificationStatus: 'verified', sourceType: { $in: ['official_webpage', 'official_pdf'] } }).limit(500).toArray();
        const checked = sources.filter((source) => toPublicKnowledge(source).dataStatus === 'verified' && source.lastChecked && !Number.isNaN(Date.parse(source.lastChecked)));
        return {
          lastChecked: checked.map((source) => source.lastChecked).sort().at(-1) || null,
          sourcesChecked: checked.map((source) => ({ id: String(source._id), title: source.title, category: source.category, sourceUrl: source.lastFetchedUrl || source.sourceUrl, lastChecked: source.lastChecked, lastCheckError: source.lastCheckError || '', lastAttemptedAt: source.lastCheckAttempt || '', nextCheck: source.nextCheck || '', freshnessStatus: toPublicKnowledge(source).freshnessStatus })),
          coverage: 'Only the listed URLs were checked. This does not cover all official announcements or university channels.',
        };
      });
      return value || { lastChecked: null, sourcesChecked: [], coverage: 'No successful official URL checks are available.' };
    },
  };
  return api;
}
