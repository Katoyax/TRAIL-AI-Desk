import { isPersonalInformationQuestion, retrieveKnowledge } from '../data/demo-knowledge';
import { requestChat } from './chat-api.mjs';
import { getSession } from './auth';
import { apiUrl } from './api';

type HistoryItem = { role: 'user' | 'assistant'; content: string };
export type ChatSource = {
  id?: string; title: string; category?: string; office?: string; source?: string; sourceType?: string; sourceUrl?: string;
  documentTitle?: string; documentNumber?: string; issuingOffice?: string; dateIssued?: string; datePublished?: string;
  effectiveFrom?: string; effectiveTo?: string;
  lastChecked?: string; lastUpdated?: string; nextCheck?: string; verificationStatus?: string;
  verifiedAt?: string; verifiedBy?: string; isActive?: boolean; version?: number; revision?: number; viewUrl?: string;
  metadata?: { verifiedAt?: string; verifiedBy?: string; verificationMethod?: string; contentVerifiedAt?: string };
  freshnessStatus?: string; refreshStatus?: string;
  freshness?: { status?: string; lastCheckError?: string; lastAttemptedAt?: string };
  lastCheckError?: string; lastAttemptedAt?: string; dataStatus?: string; demo?: boolean;
};
export type CheckVerification = { status: string; lastChecked?: string; coverage?: string; sourcesChecked?: { title: string; sourceUrl?: string; lastChecked?: string; nextCheck?: string; lastCheckError?: string; lastAttemptedAt?: string }[] };
export type ChatResult = { answer: string; sources?: ChatSource[]; verification?: CheckVerification };

export async function askTrail(question: string, conversation: HistoryItem[]): Promise<ChatResult> {
  if (!apiUrl || getSession()?.demo) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (isPersonalInformationQuestion(question)) return { answer: 'TRAIL AI Desk does not access personal student records, grades, class schedules, accounts, or financial information. Please use PRISMS or contact the appropriate university office.', sources: [{ title: 'TRAIL AI Desk scope policy', category: 'Scope', office: 'PRISMS or the appropriate university office', source: 'Project scope boundary', lastUpdated: 'Current project policy', dataStatus: 'verified_policy' }] };
    if (/\b(tomorrow|today|tonight|this week|next week|this month|next month|suspension|suspended|holiday|announcement|advisory|cancelled|canceled|enroll(?:ment)? (?:date|deadline)|latest|upcoming)\b/i.test(question)) {
      return {
        answer: 'DEMO / UNVERIFIED — No successful official source check is recorded in this demo. I cannot confirm whether an announcement has been issued or whether classes or the event will proceed. Please follow the existing university schedule unless an official announcement changes it, and verify unofficial posts or group chats against official university announcements.',
        sources: [], verification: { status: 'No official source checks recorded', sourcesChecked: [], coverage: 'Offline demonstration only. Official university channels have not been checked.' },
      };
    }
    const previous = [...conversation].reverse().find((item) => item.role === 'user')?.content;
    const followUp = /\b(it|that|those|them|there|what about|how about|and)\b/i.test(question);
    const record = retrieveKnowledge(followUp && previous ? `${previous} ${question}` : question);
    return record
      ? { answer: record.content, sources: [{ title: record.title, category: record.category, office: record.office, source: record.source, lastUpdated: record.lastUpdated, dataStatus: 'demo_unverified', demo: true }] }
      : { answer: 'I could not find relevant verified information in the current knowledge base. Please check official USTP channels or contact the appropriate university office. The academic calendar and holiday records have not been added to this demo yet.' };
  }

  return requestChat(apiUrl, question, conversation) as Promise<ChatResult>;
}
