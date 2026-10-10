export type KnowledgeCategory = 'Procedures' | 'Offices' | 'Academic calendar' | 'University information';

export type KnowledgeRecord = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  office: string;
  source: string;
  lastUpdated: string;
  keywords: string[];
  demo: true;
};

// Every entry is deliberately labeled DEMO. Replace these examples with reviewed,
// official university information before presenting them as factual guidance.
export const demoKnowledge: KnowledgeRecord[] = [
  {
    id: 'sample-coe',
    title: 'Certificate of Enrollment request (sample)',
    category: 'Procedures',
    content: 'DEMO ONLY — A sample request may ask the student to complete a request form and provide proof of identity. Requirements, fees, processing time, and submission steps have not been verified by USTP. Confirm the current process with the Registrar before acting.',
    office: 'Registrar’s Office (sample routing)',
    source: 'Capstone demonstration sample; not an official USTP source',
    lastUpdated: 'Demo record — not verified',
    keywords: ['certificate of enrollment', 'coe', 'requirements', 'request', 'procedure', 'registrar'],
    demo: true,
  },
  {
    id: 'sample-registrar',
    title: 'Registrar’s Office (directory placeholder)',
    category: 'Offices',
    content: 'DEMO ONLY — The Registrar is the suggested office to contact for academic documents and enrollment certifications. Campus location, office hours, telephone number, and email have not been verified and are intentionally omitted.',
    office: 'Registrar’s Office',
    source: 'Capstone directory placeholder; not an official USTP source',
    lastUpdated: 'Demo record — not verified',
    keywords: ['registrar', 'location', 'where', 'contact', 'office', 'tor', 'transcript'],
    demo: true,
  },
];

export function retrieveKnowledge(question: string) {
  const ignored = new Set(['a', 'an', 'and', 'are', 'at', 'can', 'do', 'for', 'how', 'i', 'in', 'is', 'it', 'me', 'of', 'on', 'or', 'please', 'the', 'to', 'what', 'where', 'which', 'who', 'with']);
  const terms = (question.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((term) => term.length > 2 && !ignored.has(term));
  // Match the backend's topic gate so unknown offices cannot match only "office".
  const generic = new Set(['office', 'offices', 'university', 'campus', 'ustp', 'information', 'contact', 'contacts', 'location', 'locations', 'hour', 'hours', 'detail', 'details', 'requirement', 'requirements', 'request', 'requests', 'procedure', 'procedures', 'policy', 'policies', 'process', 'document', 'documents', 'student', 'students', 'find', 'tell', 'show', 'get', 'need', 'required']);
  const topics = terms.filter((term) => !generic.has(term));
  const ranked = demoKnowledge
    .map((record) => {
      const tokens = new Set(`${record.title} ${record.category} ${record.content} ${record.keywords.join(' ')}`.toLowerCase().match(/[a-z0-9]+/g) ?? []);
      if (topics.length && !topics.some((term) => tokens.has(term))) return { record, score: 0 };
      const score = terms.reduce((total, term) => total + (tokens.has(term) ? 1 : 0), 0);
      return { record, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.record;
}

export function isPersonalInformationQuestion(question: string) {
  const text = String(question ?? '').normalize('NFKC').toLowerCase();
  const possessive = /\b(my|mine|our|me|his|her|their|your|someone|personal|student)\b|\b[a-z][a-z -]{0,40}['’]s\b/.test(text);
  if (possessive && /\b(grades?|gpa|class schedule|student records?|student account|account (?:details|information)|(?:financial |tuition |account |student )?balance|payment history|enrolled subjects)\b/.test(text)) return true;
  if (/\b(grades?|gpa|student records?|payment history|account balances?)\b/.test(text) && /\b(my|your|his|her|their|someone|student|show|check|find|tell)\b/.test(text)) return true;
  const personalMarker = /\b(my|mine|our|me|am i|i am|do i|did i|have i)\b/.test(text);
  const personalData = /\b(grades?|gpa|class(?:es)?|class schedule|subjects?|courses?|student records?|accounts?(?: details| information)?|balances?|tuition|financial aid|payment history)\b/;
  const enrolledPersonalData = /\b(subjects?|courses?|classes)\b.{0,45}\b(enrolled|registered|taking)\b|\b(enrolled|registered)\b.{0,45}\b(subjects?|courses?|classes)\b/i.test(text);
  const explicitRecord = /\b(show|check|find|tell me about)\b.{0,30}\b(student record|student account|student balance)\b/i.test(text);
  return (personalMarker && personalData.test(text)) || (personalMarker && enrolledPersonalData) || explicitRecord;
}
