import { contentHash, chunkText } from './extract.mjs';

export async function prepareChunks(text, { embed } = {}) {
  const chunks = chunkText(text);
  if (!embed || embed.configured === false || !chunks.length) return chunks;
  const embeddings = await embed(chunks.map(({ content }) => content), { taskType: 'RETRIEVAL_DOCUMENT' });
  if (!Array.isArray(embeddings) || embeddings.length !== chunks.length || embeddings.some((value) => !Array.isArray(value) || !value.length || value.some((number) => !Number.isFinite(number)))) {
    throw new Error('Embedding provider returned invalid document vectors.');
  }
  const dimensions = embeddings[0].length;
  if (embeddings.some((vector) => vector.length !== dimensions)) throw new Error('Embedding vector dimensions are inconsistent.');
  return chunks.map((chunk, index) => ({ ...chunk, embedding: embeddings[index] }));
}

// Repository injection keeps the refresh pipeline independently testable; the
// production repository below writes only to MongoDB.
export function createSourceRefresher({ repository, fetchSource, extractSource, embed, now = () => new Date(), intervalMs = 86_400_000 }) {
  return async function refreshSource(id) {
    const source = await repository.getSource(id);
    if (!source) throw Object.assign(new Error('Knowledge source was not found.'), { status: 404 });
    if (!source.isActive || !['official_webpage', 'official_pdf'].includes(source.sourceType)) {
      throw Object.assign(new Error('Only active official URLs can be refreshed.'), { status: 400 });
    }
    const checkedAt = now().toISOString();
    const nextCheck = new Date(Date.parse(checkedAt) + intervalMs).toISOString();
    try {
      const fetched = await fetchSource(source.sourceUrl);
      const extracted = await extractSource(fetched.bytes, fetched.contentType);
      const hash = contentHash(extracted.text);
      if (hash === source.contentHash) {
        await repository.recordCheck(id, { lastChecked: checkedAt, lastCheckAttempt: checkedAt, nextCheck, refreshStatus: 'unchanged', lastCheckError: '', lastFetchedUrl: fetched.sourceUrl }, source);
        return { status: 'unchanged', source: await repository.getSource(id) };
      }
      const chunks = await prepareChunks(extracted.text, { embed });
      await repository.commitVersion(source, { text: extracted.text, contentHash: hash, chunks, checkedAt, nextCheck, fetchedUrl: fetched.sourceUrl });
      return { status: 'updated', source: await repository.getSource(id) };
    } catch (error) {
      const message = String(error.message || 'Official source check failed.').slice(0, 300);
      await repository.recordCheck(id, { lastCheckAttempt: checkedAt, nextCheck, refreshStatus: 'failed', lastCheckError: message }, source);
      return { status: 'failed', error: message, source: await repository.getSource(id) };
    }
  };
}

export function startSourceRefreshScheduler(store, { enabled = true, pollMs = 60_000, logger = console } = {}) {
  if (!enabled) return () => {};
  let busy = false;
  let stopped = false;
  const run = async () => {
    if (busy || stopped) return;
    busy = true;
    try { await store.refreshDueSources(); }
    catch (error) { logger.error(`Source refresh worker failed (${error.name || 'Error'}).`); }
    finally { busy = false; }
  };
  const timer = setInterval(run, Math.max(1000, pollMs));
  timer.unref?.();
  void run();
  return () => { stopped = true; clearInterval(timer); };
}
