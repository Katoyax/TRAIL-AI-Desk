export function isTimeSensitive(question) {
  return /\b(tomorrow|today|tonight|this week|next week|this month|next month|(?:next|this) (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|suspension|suspended|holidays?|announcement|advisory|cancelled|canceled|enroll(?:ment)? (?:dates?|deadline)|latest|upcoming)\b/i.test(question)
    || /\bwhen\b.{0,80}\b(enroll(?:ment)?|classes|event|holiday)\b/i.test(question);
}

export function targetDate(question, now = new Date()) {
  const local = new Date(now.getTime() + 8 * 3600000);
  if (/\btomorrow\b/i.test(question)) local.setUTCDate(local.getUTCDate() + 1);
  if (/\b(today|tomorrow|tonight)\b/i.test(question)) return local.toISOString().slice(0, 10);
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekday = question.toLowerCase().match(/\b(?:next|this) (sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/)?.[1];
  if (weekday) { local.setUTCDate(local.getUTCDate() + ((weekdays.indexOf(weekday) - local.getUTCDay() + 7) % 7 || 7)); return local.toISOString().slice(0, 10); }
  const exact = question.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];
  if (!exact) return null;
  const parsed = new Date(`${exact}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === exact ? exact : null;
}

function manilaDate(value) {
  if (typeof value !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp + 8 * 3600000).toISOString().slice(0, 10) : null;
}

export function hasCurrentEventEvidence(record, question, { now = new Date(), intervalMs = 86400000 } = {}) {
  if (record.dataStatus !== 'verified' || record.freshnessStatus === 'stale' || record.lastCheckError) return false;
  const checked = Date.parse(record.lastChecked || record.metadata?.verifiedAt || '');
  if (!Number.isFinite(checked) || now.getTime() - checked > intervalMs) return false;
  const text = `${record.title} ${record.content}`;
  if (!/\b(suspend|suspension|suspended|holiday|announcement|memorandum|advisory|calendar|deadline|enrollment|event)\b/i.test(text)) return false;
  const date = targetDate(question, now);
  if (!date) {
    const issued = Date.parse(record.dateIssued || record.datePublished || '');
    return Number.isFinite(issued) && now.getTime() - issued >= 0 && now.getTime() - issued <= 7 * 86400000;
  }
  const fromValue = record.effectiveFrom || record.metadata?.effectiveFrom;
  const from = manilaDate(fromValue);
  const to = manilaDate(record.effectiveTo || record.metadata?.effectiveTo || fromValue);
  if (from && from <= date && to >= date) return true;
  if (text.includes(date)) return true;
  const formatted = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
  return text.toLowerCase().includes(formatted.toLowerCase());
}

export function noAnnouncementAnswer(summary = {}) {
  const checkedSources = (summary.sourcesChecked || []).filter((item) => item.sourceUrl && Number.isFinite(Date.parse(item.lastChecked)));
  const lastChecked = checkedSources.length ? checkedSources.map((item) => item.lastChecked).sort()[0] : null;
  const timestamp = lastChecked ? new Date(lastChecked).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }) : null;
  const answer = timestamp
    ? `As of the recorded source checks (${timestamp}, Asia/Manila), I have not found an official USTP announcement in the monitored sources confirming the event you asked about.`
    : 'I could not find relevant verified information confirming this event. No successful official source check is recorded, so I cannot confirm whether an announcement has been issued.';
  const warning = checkedSources.some((item) => item.lastCheckError || item.freshnessStatus === 'stale') ? ' Some monitored sources have failed or overdue checks; newer announcements may not yet be indexed.' : '';
  return { answer: `${answer}${warning} This does not establish whether classes or the event will proceed. Please follow the existing university schedule unless an official announcement changes it. Verify unofficial posts, group chats, or word of mouth against official university announcements.`,
    verification: { status: 'No official announcement found', lastChecked, sourcesChecked: checkedSources,
      coverage: 'Only explicitly configured source pages are monitored; links, all university channels, and announcements not yet indexed are not exhaustively checked.' } };
}
