// Gemini REST keeps credentials on the server without another SDK dependency.
export function createEmbedder(config = process.env, { fetcher = fetch } = {}) {
  const model = config.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
  const dimensions = Number(config.GEMINI_EMBEDDING_DIMENSIONS || 768);
  if (![768, 1536, 3072].includes(dimensions)) throw new Error('Unsupported embedding dimensions.');
  const cache = new Map();
  const normalize = (values) => {
    if (!Array.isArray(values) || values.length !== dimensions || values.some((value) => !Number.isFinite(value))) throw new Error('Embedding provider returned an invalid vector.');
    const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
    if (!norm) throw new Error('Embedding provider returned an empty vector.');
    return values.map((value) => value / norm);
  };
  const contentRequest = (text, taskType) => ({ model: `models/${model}`, content: { parts: [{ text }] },
    embedContentConfig: { outputDimensionality: dimensions, ...(model === 'gemini-embedding-001' ? { taskType } : {}) } });
  const embed = async (texts, { taskType = 'RETRIEVAL_DOCUMENT' } = {}) => {
    if (!config.GEMINI_API_KEY) return texts.map(() => []);
    if (taskType === 'RETRIEVAL_DOCUMENT' && texts.length > 1) {
      const batches = [];
      for (let index = 0; index < texts.length; index += 20) batches.push(texts.slice(index, index + 20));
      const vectors = [];
      // Two bounded requests at a time; preserve the source chunk order.
      const deadline = Date.now() + 90000;
      for (let index = 0; index < batches.length; index += 2) {
        const results = await Promise.all(batches.slice(index, index + 2).map(async (batch) => {
          const remaining = deadline - Date.now();
          if (remaining <= 0) throw new Error('Document embedding operation timed out.');
          const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:batchEmbedContents`, {
            method: 'POST', signal: AbortSignal.timeout(Math.min(10000, remaining)),
            headers: { 'content-type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
            body: JSON.stringify({ requests: batch.map((text) => contentRequest(text, taskType)) }),
          });
          if (!response.ok) throw new Error(`Embedding provider returned ${response.status}.`);
          const embeddings = (await response.json()).embeddings;
          if (!Array.isArray(embeddings) || embeddings.length !== batch.length) throw new Error('Embedding provider returned an invalid batch.');
          return embeddings.map((item) => normalize(item.values));
        }));
        vectors.push(...results.flat());
      }
      return vectors;
    }
    const vectors = [];
    for (const text of texts) {
      const key = `${model}:${dimensions}:${taskType}:${text}`;
      if (taskType === 'RETRIEVAL_QUERY' && cache.has(key)) { vectors.push(cache.get(key)); continue; }
      const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent`, {
        method: 'POST', signal: AbortSignal.timeout(taskType === 'RETRIEVAL_QUERY' ? 3000 : 10000),
        headers: { 'content-type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
        body: JSON.stringify(contentRequest(text, taskType)),
      });
      if (!response.ok) throw new Error(`Embedding provider returned ${response.status}.`);
      const values = (await response.json()).embedding?.values;
      const vector = normalize(values);
      if (taskType === 'RETRIEVAL_QUERY') {
        if (cache.size >= 100) cache.delete(cache.keys().next().value);
        cache.set(key, vector);
      }
      vectors.push(vector);
    }
    return vectors;
  };
  embed.model = model;
  embed.dimensions = dimensions;
  embed.configured = Boolean(config.GEMINI_API_KEY);
  return embed;
}
