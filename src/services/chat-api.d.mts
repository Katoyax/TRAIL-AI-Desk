type ChatSource = {
  title: string;
  category?: string;
  office?: string;
  source?: string;
  sourceType?: string;
  sourceUrl?: string;
  documentTitle?: string;
  documentNumber?: string;
  issuingOffice?: string;
  dateIssued?: string;
  datePublished?: string;
  lastChecked?: string;
  nextCheck?: string;
  verificationStatus?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  isActive?: boolean;
  version?: number;
  viewUrl?: string;
  freshness?: { status?: string; lastCheckError?: string; lastAttemptedAt?: string };
  lastUpdated?: string;
  dataStatus?: string;
  demo?: boolean;
};

type ChatResponse = { answer: string; sources?: ChatSource[]; verification?: { status: string; lastChecked?: string; coverage?: string; sourcesChecked?: { title: string; sourceUrl?: string; lastChecked?: string }[] } };

export function requestChat(
  apiUrl: string,
  question: string,
  conversation: { role: 'user' | 'assistant'; content: string }[],
  fetcher?: typeof fetch,
): Promise<ChatResponse>;
