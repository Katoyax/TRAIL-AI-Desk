const stopWords = new Set([
  'a', 'an', 'and', 'are', 'at', 'be', 'can', 'do', 'for', 'from', 'how', 'i',
  'in', 'is', 'it', 'me', 'of', 'on', 'or', 'please', 'the', 'this', 'to', 'what',
  'when', 'where', 'which', 'who', 'with', 'would', 'you', 'your',
]);

// Broad directory/category words alone do not identify a specifically named
// office or subject. Keep broad queries usable, but require a topic match when
// the question supplies one (for example, "quantum computing office").
const genericTopicWords = new Set([
  'office', 'offices', 'university', 'campus', 'ustp', 'information', 'contact', 'contacts',
  'location', 'locations', 'hour', 'hours', 'detail', 'details', 'requirement',
  'requirements', 'request', 'requests', 'procedure', 'procedures', 'policy',
  'policies', 'process', 'document', 'documents', 'student', 'students',
  'find', 'tell', 'show', 'get', 'need', 'required', 'requir',
]);

export function hasTopicMatch(queryTokens, recordTokens) {
  const topics = queryTokens.filter((token) => !genericTopicWords.has(token));
  return !topics.length || topics.some((token) => recordTokens.some((word) =>
    word === token || (token.length > 4 && word.replace(/s$/, '') === token.replace(/s$/, ''))));
}

function normalizeToken(token) {
  if (token.length > 5 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && /(sses|shes|ches|xes|zes)$/.test(token)) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
  return token;
}

export function normalizeQuestion(question) {
  const original = String(question ?? '').normalize('NFKC').trim();
  const tokens = (original.toLowerCase().match(/[a-z0-9]+/g) || [])
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !stopWords.has(token));
  return { original, normalized: tokens.join(' '), tokens };
}

export function isOutOfScope(question) {
  const text = String(question ?? '').normalize('NFKC').toLowerCase();
  const possessive = /\b(my|mine|our|me|his|her|their|your|someone|personal|student)\b|\b[a-z][a-z -]{0,40}['’]s\b/.test(text);
  if (possessive && /\b(grades?|gpa|class schedule|student records?|student account|account (?:details|information)|(?:financial |tuition |account |student )?balance|payment history|enrolled subjects)\b/.test(text)) return true;
  if (/\b(grades?|gpa|student records?|payment history|account balances?)\b/.test(text)
    && /\b(my|your|his|her|their|someone|student|show|check|find|tell)\b/.test(text)) return true;
  const asksPersonal = /\b(my|mine|our|me|am i|i am|do i|did i|have i)\b/.test(text);
  const personalData = /\b(grades?|gpa|class(?:es)?|class schedule|subjects?|courses?|student records?|account(?:s)?(?: details| information)?|balances?|tuition|financial aid|payment history)\b/;
  const explicitStudentRecord = /\b(show|check|find|tell me about)\b.{0,30}\b(student record|student account|student balance)\b/i.test(text);
  const enrolledSubjects = /\b(subjects?|courses?|classes)\b.{0,45}\b(enrolled|registered|taking)\b/i.test(text)
    || /\b(enrolled|registered)\b.{0,45}\b(subjects?|courses?|classes)\b/i.test(text);
  return (asksPersonal && personalData.test(text)) || explicitStudentRecord || (asksPersonal && enrolledSubjects);
}

export function rankKnowledge(question, documents) {
  const query = normalizeQuestion(question);
  if (!query.tokens.length) return [];
  const originalLower = query.original.toLowerCase();
  return documents
    .filter((record) => record && record.active !== false)
    .map((record) => {
      const title = normalizeQuestion(record.title || '').tokens;
      const category = normalizeQuestion(record.category || '').tokens;
      const content = normalizeQuestion(record.content || '').tokens;
      const keywords = normalizeQuestion((record.keywords || []).join(' ')).tokens;
      if (!hasTopicMatch(query.tokens, [...title, ...category, ...content, ...keywords])) return { record, score: 0 };
      let score = 0;
      for (const token of query.tokens) {
        if (title.includes(token)) score += 4;
        if (keywords.includes(token)) score += 3;
        if (category.includes(token)) score += 1.5;
        if (content.includes(token)) score += 0.5;
      }
      const phrase = `${record.title || ''} ${(record.keywords || []).join(' ')}`.toLowerCase();
      if (originalLower.length > 4 && phrase.includes(originalLower)) score += 5;
      return { record, score };
    })
    .filter(({ score }) => score >= 2.5)
    .sort((a, b) => b.score - a.score)
    .map(({ record, score }) => ({ record, score }));
}

export function selectContext(ranked, { limit = 3, minimumRatio = 0.4 } = {}) {
  if (!ranked.length) return [];
  const threshold = ranked[0].score * minimumRatio;
  return ranked.filter((item) => item.score >= threshold).slice(0, limit).map((item) => item.record);
}

export function buildRetrievedContext(records) {
  return records.map((record, index) => [
    `[${index + 1}] ${record.title}`,
    `Category: ${record.category}`,
    `Office: ${record.office || 'Not specified'}`,
    `Status: ${record.dataStatus || (record.demo ? 'demo_unverified' : 'unverified')}`,
    `Content: ${record.content}`,
    `Source: ${record.source}`,
    `Last updated: ${record.lastUpdated}`,
    `Last checked: ${record.lastChecked || 'No actual URL check recorded'}`,
    `Verification: ${record.verificationStatus || record.dataStatus || 'unverified'}`,
    `Freshness: ${record.freshnessStatus || 'unknown'}${record.lastCheckError ? '; latest check failed' : ''}`,
    `Document number: ${record.documentNumber || 'Not supplied'}`,
    `Issued: ${record.dateIssued || record.datePublished || 'Not supplied'}`,
    `Official URL: ${record.sourceUrl || 'No public URL supplied'}`,
  ].join('\n')).join('\n\n');
}
