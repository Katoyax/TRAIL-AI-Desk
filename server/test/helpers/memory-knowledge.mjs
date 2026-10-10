// Test-only MongoDB double. The production knowledge store never uses this.
function copy(value) {
  if (Buffer.isBuffer(value)) return Buffer.from(value);
  if (Array.isArray(value)) return value.map(copy);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copy(item)]));
  return value;
}
const field = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
function matches(document, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === '$or') return value.some((query) => matches(document, query));
    if (key === '$text') return true;
    const actual = field(document, key);
    if (value && typeof value === 'object' && !Array.isArray(value)) return Object.entries(value).every(([operator, expected]) => {
      if (operator === '$ne') return actual !== expected;
      if (operator === '$in') return expected.includes(actual);
      if (operator === '$exists') return (actual !== undefined) === expected;
      if (operator === '$lte') return actual <= expected;
      throw new Error(`Unsupported test query operator ${operator}`);
    });
    return actual === value;
  });
}
function setField(document, path, value, remove = false) {
  const parts = path.split('.');
  let target = document;
  for (const part of parts.slice(0, -1)) { target[part] ||= {}; target = target[part]; }
  if (remove) delete target[parts.at(-1)]; else target[parts.at(-1)] = copy(value);
}

export function createMemoryKnowledgeConnection() {
  const collections = new Map();
  const controls = { failWrites: false, failReads: false, failActivation: false, loseActivationAcknowledgement: false, vectorCandidates: null };
  const database = { collection(name) {
    if (!collections.has(name)) collections.set(name, []);
    const documents = collections.get(name);
    const checkRead = () => { if (controls.failReads) throw new Error('Test database disconnected'); };
    const checkWrite = () => { if (controls.failWrites) throw new Error('Test database write failed'); };
    return {
      find(filter = {}) {
        checkRead();
        let selected = documents.filter((document) => matches(document, filter));
        const cursor = {
          limit(limit) { selected = selected.slice(0, limit); return cursor; },
          sort(order) { const [key, direction] = Object.entries(order)[0]; if (typeof direction === 'number') selected.sort((left, right) => (field(left, key) > field(right, key) ? 1 : -1) * direction); return cursor; },
          async toArray() { checkRead(); return selected.map(copy); },
        };
        return cursor;
      },
      async findOne(filter) { checkRead(); return copy(documents.find((document) => matches(document, filter))) || null; },
      async insertOne(document) { checkWrite(); documents.push(copy(document)); return { insertedId: document._id }; },
      async insertMany(items) { checkWrite(); documents.push(...items.map(copy)); return { insertedCount: items.length }; },
      async updateOne(filter, patch) {
        checkWrite();
        if (controls.failActivation && name === 'knowledge_sources' && patch.$set?.activeVersion) return { matchedCount: 0, modifiedCount: 0 };
        const document = documents.find((item) => matches(item, filter));
        if (!document) return { matchedCount: 0, modifiedCount: 0 };
        for (const [key, value] of Object.entries(patch.$set || {})) setField(document, key, value);
        for (const [key, value] of Object.entries(patch.$inc || {})) setField(document, key, (field(document, key) || 0) + value);
        for (const key of Object.keys(patch.$unset || {})) setField(document, key, undefined, true);
        if (controls.loseActivationAcknowledgement && name === 'knowledge_sources' && patch.$set?.activeVersion) throw new Error('Test network disconnected after committed activation');
        return { matchedCount: 1, modifiedCount: 1 };
      },
      async deleteMany(filter) { checkWrite(); const selected = documents.filter((document) => !matches(document, filter)); const deletedCount = documents.length - selected.length; documents.splice(0, documents.length, ...selected); return { deletedCount }; },
      async deleteOne(filter) { checkWrite(); const index = documents.findIndex((document) => matches(document, filter)); if (index >= 0) documents.splice(index, 1); return { deletedCount: index >= 0 ? 1 : 0 }; },
      aggregate() { checkRead(); return { async toArray() { return copy(controls.vectorCandidates || documents); } }; },
    };
  } };
  return { database, client: { close: async () => {} }, collections, controls };
}
