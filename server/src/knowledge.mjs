import { readFile } from 'node:fs/promises';

const records = JSON.parse(await readFile(new URL('./knowledge.json', import.meta.url), 'utf8'));

export const demoKnowledge = records.map((record) => ({
  ...record,
  dataStatus: 'demo_unverified',
  verificationStatus: 'pending_verification',
  isActive: true,
}));

export const SOURCE_TYPES = ['official_webpage', 'official_pdf', 'uploaded_document', 'office_verified_information'];
export const VERIFICATION_STATUSES = ['verified', 'pending_verification', 'outdated', 'archived', 'unavailable'];

export function toPublicKnowledge(record) {
  const metadata = record.metadata && typeof record.metadata === 'object' ? record.metadata : {};
  const explicitlyVerified = record.verificationStatus === 'verified'
    || (!record.verificationStatus && record.dataStatus === 'verified');
  const dataStatus = record.demo === true || record.dataStatus === 'demo_unverified'
    ? 'demo_unverified'
    : explicitlyVerified && record.isActive !== false && record.active !== false
      && typeof metadata.verifiedAt === 'string' && !Number.isNaN(Date.parse(metadata.verifiedAt))
      && typeof metadata.verifiedBy === 'string' && metadata.verifiedBy.trim().length > 0
      ? 'verified'
      : 'unverified';
  const title = record.documentTitle || record.title || '';
  const office = record.issuingOffice || record.office || '';
  const sourceUrl = typeof record.sourceUrl === 'string' ? record.sourceUrl : '';
  const source = record.source || sourceUrl || [record.documentNumber && `Memorandum No. ${record.documentNumber}`, title, office].filter(Boolean).join(' — ');
  const official = ['official_webpage', 'official_pdf'].includes(record.sourceType);
  const freshnessStatus = record.freshnessStatus || (record.lastCheckError ? 'unavailable'
    : dataStatus === 'verified' && official
      ? (record.nextCheck && Date.parse(record.nextCheck) <= Date.now() ? 'stale' : record.lastChecked ? 'current' : 'unknown')
      : dataStatus === 'verified' && ['uploaded_document', 'office_verified_information'].includes(record.sourceType) ? 'reviewed' : 'unknown');
  return {
    id: String(record.id ?? record._id ?? ''),
    sourceId: String(record.sourceId ?? record.id ?? record._id ?? ''),
    title,
    category: record.category || 'General information',
    content: record.content || '',
    office,
    source,
    lastUpdated: record.lastUpdated || record.updatedAt || '',
    keywords: Array.isArray(record.keywords) ? record.keywords : [],
    metadata,
    dataStatus,
    demo: dataStatus === 'demo_unverified',
    sourceType: record.sourceType || '',
    sourceUrl,
    documentTitle: title,
    documentNumber: record.documentNumber || '',
    issuingOffice: office,
    dateIssued: record.dateIssued || '',
    datePublished: record.datePublished || '',
    effectiveFrom: record.effectiveFrom || '',
    effectiveTo: record.effectiveTo || '',
    verificationStatus: record.verificationStatus || (dataStatus === 'verified' ? 'verified' : 'pending_verification'),
    isActive: record.isActive !== false && record.active !== false,
    active: record.isActive !== false && record.active !== false,
    version: record.version || 1,
    revision: Number.isInteger(record.revision) ? record.revision : 0,
    contentHash: record.contentHash || '',
    lastChecked: record.lastChecked || '',
    nextCheck: record.nextCheck || '',
    lastCheckAttempt: record.lastCheckAttempt || '',
    lastAttemptedAt: record.lastCheckAttempt || '',
    refreshStatus: record.refreshStatus || '',
    freshnessStatus,
    lastCheckError: record.lastCheckError || '',
    fileAvailable: Boolean(record.fileAvailable || record.fileName),
    viewUrl: dataStatus === 'verified' && (record.fileAvailable || record.fileName)
      ? `/api/documents/${String(record.sourceId ?? record.id ?? record._id ?? '')}` : '',
    ...(record.chunkId ? { chunkId: record.chunkId } : {}),
    ...(Array.isArray(record.embedding) ? { embedding: record.embedding } : {}),
    ...(typeof record.lexicalScore === 'number' ? { lexicalScore: record.lexicalScore } : {}),
    ...(typeof record.vectorScore === 'number' ? { vectorScore: record.vectorScore } : {}),
    ...(typeof record.score === 'number' ? { score: record.score } : {}),
  };
}

export function isUsableKnowledgeRecord(record) {
  return record
    && typeof record.title === 'string' && record.title.trim()
    && typeof record.category === 'string' && record.category.trim()
    && typeof record.content === 'string' && record.content.trim()
    && typeof record.source === 'string' && record.source.trim()
    && typeof record.lastUpdated === 'string' && record.lastUpdated.trim();
}
