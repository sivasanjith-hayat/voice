import type { KbDocument, RetrievalResult, AssistantResponse, MessageSource } from './types';

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may',
  'might','must','can','to','of','in','on','at','for','with','about','as','by',
  'from','up','down','out','over','under','again','then','once','here','there',
  'when','where','why','how','all','any','both','each','few','more','most','other',
  'some','such','no','nor','not','only','own','same','so','than','too','very',
  'i','me','my','myself','we','our','ours','you','your','he','him','his','she',
  'her','it','its','they','them','their','what','which','who','whom','this',
  'that','these','those','am','if','because','while','what','which','tell','give',
  'get','want','need','know','like','just','also','into','through','during',
  'before','after','above','below','off','further','please','help','hello',
  'hi','hey','campus','college','university',
]);

const SYNONYMS: Record<string, string[]> = {
  fee: ['fees', 'tuition', 'payment', 'cost', 'charge', 'price'],
  admission: ['admissions', 'admit', 'enroll', 'enrollment', 'join', 'apply', 'application'],
  scholarship: ['scholarships', 'financial', 'aid', 'waiver', 'discount'],
  placement: ['placements', 'job', 'jobs', 'career', 'recruit', 'recruiter', 'recruitment', 'package', 'salary'],
  hostel: ['hostels', 'accommodation', 'dorm', 'dormitory', 'lodging'],
  exam: ['exams', 'examination', 'examinations', 'test', 'tests', 'semester'],
  result: ['results', 'grade', 'grades', 'gpa', 'cgpa', 'mark', 'marks'],
  library: ['libraries', 'book', 'books', 'journal', 'journals'],
  faculty: ['professor', 'professors', 'teacher', 'teachers', 'staff'],
  course: ['courses', 'program', 'programs', 'curriculum', 'subject', 'subjects', 'syllabus'],
  department: ['departments', 'dept', 'branch'],
  transport: ['bus', 'buses', 'route', 'routes', 'shuttle'],
  sport: ['sports', 'game', 'games', 'athletics', 'cricket', 'football'],
  wifi: ['internet', 'network', 'connection', 'wireless'],
  medical: ['health', 'hospital', 'clinic', 'doctor', 'medicine'],
  internship: ['intern', 'internships', 'training'],
  event: ['events', 'fest', 'festival', 'workshop', 'seminar', 'hackathon'],
  research: ['innovation', 'incubation', 'startup', 'phd', 'publication'],
  club: ['clubs', 'society', 'societies', 'nss', 'ncc'],
  timing: ['time', 'timings', 'hours', 'schedule', 'when'],
  location: ['where', 'place', 'building', 'block', 'room'],
  eligibility: ['eligible', 'criteria', 'requirement', 'requirements', 'qualify'],
  ragging: ['harassment', 'bullying'],
  attendance: ['present', 'absent'],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function expandQuery(tokens: string[]): Set<string> {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const key = token.replace(/s$/, '');
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach((s) => expanded.add(s));
    }
    if (SYNONYMS[key]) {
      SYNONYMS[key].forEach((s) => expanded.add(s));
    }
  }
  return expanded;
}

function computeTf(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  let max = 1;
  for (const count of tf.values()) {
    if (count > max) max = count;
  }
  for (const [term, count] of tf) {
    tf.set(term, count / max);
  }
  return tf;
}

function scoreDocument(
  queryTokens: string[],
  queryTf: Map<string, number>,
  expandedTerms: Set<string>,
  doc: KbDocument
): number {
  const docText = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`;
  const docTokens = tokenize(docText);
  const docTf = computeTf(docTokens);

  let score = 0;
  for (const [term, qWeight] of queryTf) {
    if (docTf.has(term)) {
      score += qWeight * docTf.get(term)! * 2;
    }
  }
  for (const term of expandedTerms) {
    if (!queryTf.has(term)) {
      if (docTokens.includes(term)) {
        score += 0.5;
      }
    }
  }
  if (doc.tags.some((tag) => expandedTerms.has(tag))) {
    score += 1.5;
  }
  if (doc.title.toLowerCase().includes(queryTokens[0] || '')) {
    score += 1;
  }
  const categoryMatch = doc.category.toLowerCase();
  for (const term of expandedTerms) {
    if (categoryMatch.includes(term)) {
      score += 0.8;
      break;
    }
  }
  return score;
}

export function retrieve(
  query: string,
  documents: KbDocument[],
  topK = 4
): RetrievalResult[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || documents.length === 0) return [];

  const expandedTerms = expandQuery(queryTokens);
  const queryTf = computeTf(queryTokens);

  const scored = documents.map((doc) => ({
    document: doc,
    score: scoreDocument(queryTokens, queryTf, expandedTerms, doc),
  }));

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function synthesizeResponse(query: string, results: RetrievalResult[]): string {
  if (results.length === 0) {
    return "I couldn't find specific information about that in our knowledge base. Try asking about admissions, fees, placements, hostels, library, exams, events, or campus facilities. You can also browse the Knowledge Base page for the full catalog.";
  }

  const top = results[0].document;
  const parts: string[] = [];

  parts.push(top.content);

  if (results.length > 1) {
    const additional = results.slice(1, 3);
    for (const r of additional) {
      if (r.score > results[0].score * 0.4) {
        const snippet = r.document.content.split('.').slice(0, 2).join('.').trim();
        if (snippet && !top.content.includes(snippet)) {
          parts.push(`\n\n**Related — ${r.document.title}:** ${snippet}.`);
        }
      }
    }
  }

  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('how') || lowerQuery.includes('process') || lowerQuery.includes('apply')) {
    parts.push('\n\nWould you like me to walk you through the steps in more detail?');
  } else if (lowerQuery.includes('when') || lowerQuery.includes('date') || lowerQuery.includes('deadline')) {
    parts.push('\n\nCheck the Academic Calendar for confirmed dates.');
  }

  return parts.join('');
}

export function generateResponse(query: string, documents: KbDocument[]): AssistantResponse {
  const results = retrieve(query, documents, 4);
  const content = synthesizeResponse(query, results);
  const sources: MessageSource[] = results.map((r) => ({
    id: r.document.id,
    title: r.document.title,
    category: r.document.category,
    source: r.document.source,
  }));

  const maxScore = results.length > 0 ? results[0].score : 0;
  const confidence = Math.min(0.98, 0.45 + maxScore * 0.08);

  return { content, sources, confidence, results };
}

export function getSuggestions(documents: KbDocument[], limit = 6): string[] {
  const titles = documents.map((d) => d.title);
  const shuffled = [...titles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
