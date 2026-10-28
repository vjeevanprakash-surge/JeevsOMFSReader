import { journalByIssn } from '../data/journals';
import { detectStudyType } from '../data/studyTypes';
import { classify, topicById } from '../data/topics';
import { limitedFetch } from './http';
import { getSettings } from './settings';
import type { Article, ArticleQuery, Journal } from './types';

const API = 'https://api.crossref.org';
// Some publishers register the licence URL without the trailing slash: match both.
const CC_LICENSES = ['by', 'by-nc', 'by-nc-nd', 'by-nd', 'by-sa', 'by-nc-sa'].flatMap((v) =>
  ['http', 'https'].flatMap((proto) => [`${proto}://creativecommons.org/licenses/${v}/4.0/`, `${proto}://creativecommons.org/licenses/${v}/4.0`]),
);

/** Front matter, notices and peer-review reports Crossref registers as articles. */
export const JUNK_TITLE = /^(editorial board|ed board|issue information|table of contents|toc|future issues|contents|masthead|cover|.*newsletter|corrigendum|erratum|retraction|correction to|review of\s*:|decision letter|author response|reviewer report)\b|---/i;

interface CrossrefWork {
  DOI: string;
  title?: string[];
  abstract?: string;
  author?: { given?: string; family?: string; name?: string }[];
  volume?: string;
  issue?: string;
  page?: string;
  subject?: string[];
  license?: { URL: string }[];
  link?: { URL: string; 'content-type'?: string; 'intended-application'?: string }[];
  ISSN?: string[];
  'container-title'?: string[];
  published?: { 'date-parts': number[][] };
  issued?: { 'date-parts': number[][] };
  created?: { 'date-time': string };
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function mapCrossrefWork(w: CrossrefWork, journal: Journal): Article {
  const [y = 1900, m = 1, d = 1] = (w.published ?? w.issued)?.['date-parts']?.[0] ?? [];
  const pubDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const title = stripTags(w.title?.[0] ?? '(untitled)');
  const abstract = stripTags(w.abstract ?? '').replace(/^Abstract\s*/i, '');
  const isOpenAccess = journal.freePct >= 95 || (w.license ?? []).some((l) => /creativecommons\.org/i.test(l.URL));
  // Text-mining links are publisher API endpoints, not something a reader can open.
  const pdf = w.link?.find((l) => l['content-type'] === 'application/pdf' && l['intended-application'] !== 'text-mining')?.URL;
  return {
    id: `doi:${w.DOI.toLowerCase()}`,
    doi: w.DOI,
    title,
    abstract,
    authors: (w.author ?? []).map((a) => {
      const first = a.given ?? '';
      return {
        last: a.family ?? a.name ?? '',
        first,
        initials: first.split(/[\s.-]+/).filter(Boolean).map((p) => p[0].toUpperCase()).join(''),
      };
    }).filter((a) => a.last),
    journalId: journal.id,
    journalTitle: journal.name,
    journalAbbr: journal.abbr,
    volume: w.volume,
    issue: w.issue,
    pages: w.page,
    pubDate,
    addedDate: w.created?.['date-time']?.slice(0, 10) ?? pubDate,
    year: y,
    keywords: w.subject ?? [],
    topics: classify({ title, keywords: w.subject, abstract }),
    // Crossref has no publication types: the title is all there is to go on.
    studyType: detectStudyType([], title),
    isOpenAccess,
    pdfUrl: isOpenAccess ? pdf : undefined,
  };
}

/**
 * Articles from the Crossref-sourced journals. Repeated `issn:` filters are OR-ed by Crossref, so this
 * is one request, or two when "free only" mixes fully open journals (taken whole: some register no
 * licence) with partly free ones (Creative Commons licences only). Requests run one after another:
 * Crossref rejects parallel requests from the public pool, and its 429s carry no CORS header.
 */
export async function searchCrossref(journals: Journal[], q: ArticleQuery, rows: number, opts: PageOptions = {}) {
  const open = q.freeOnly ? journals.filter((j) => j.freePct >= 95) : journals;
  const licensed = q.freeOnly ? journals.filter((j) => j.freePct < 95) : [];
  const [a, b] = await Promise.all([crossrefPage(open, q, rows, false, opts), crossrefPage(licensed, q, rows, true, opts)]);
  return { articles: [...a.articles, ...b.articles], total: a.total + b.total, errors: [...a.errors, ...b.errors] };
}

interface PageOptions {
  /** Only works registered with Crossref between these dates (YYYY-MM-DD, inclusive). */
  created?: { from: string; until: string };
  signal?: AbortSignal;
}

async function crossrefPage(journals: Journal[], q: ArticleQuery, rows: number, ccOnly: boolean, { created, signal }: PageOptions) {
  if (!journals.length) return { articles: [] as Article[], total: 0, errors: [] as string[] };
  const s = getSettings();
  const filters = [
    ...journals.flatMap((j) => j.issns.map((i) => `issn:${i}`)),
    'type:journal-article',
    `from-pub-date:${q.yearFrom ?? 1900}`,
    `until-pub-date:${q.yearTo ?? 3000}`,
    ...(created ? [`from-created-date:${created.from}`, `until-created-date:${created.until}`] : []),
    // Creative Commons licences (repeated license.url filters are OR-ed).
    ...(ccOnly ? CC_LICENSES.map((l) => `license.url:${l}`) : []),
  ];
  const p = new URLSearchParams({
    filter: filters.join(','),
    // Relevance only means something with a search term; otherwise newest first.
    sort: q.sort === 'relevance' && (q.keyword || q.author) ? 'score' : 'created',
    order: 'desc',
    rows: String(rows),
    offset: String(q.page * rows),
    select: 'DOI,ISSN,title,abstract,author,volume,issue,page,subject,license,link,published,issued,created',
  });
  if (q.keyword?.trim()) p.set('query.bibliographic', q.keyword.trim());
  if (q.author?.trim()) p.set('query.author', q.author.trim());
  if (s.contactEmail) p.set('mailto', s.contactEmail);

  try {
    // Public pool: 1 request/second, 1 at a time (x-rate-limit / x-concurrency-limit headers).
    const res = await limitedFetch(`${API}/works?${p}`, 1100, { signal });
    const json = await res.json();
    let articles = (json.message.items as (CrossrefWork & { ISSN?: string[] })[])
      .map((w) => {
        const journal = (w.ISSN ?? []).map(journalByIssn).find((j) => j && journals.includes(j));
        return journal ? mapCrossrefWork(w, journal) : undefined;
      })
      .filter((a): a is Article => !!a && a.authors.length > 0 && a.title !== '(untitled)' && !JUNK_TITLE.test(a.title));
    const topic = q.topic ? topicById(q.topic) : undefined;
    // Crossref has no subject index for these titles: filter topic locally (best effort per page).
    if (topic) articles = articles.filter((a) => a.topics.includes(topic.label));
    if (q.freeOnly) articles = articles.filter((a) => a.isOpenAccess);
    if (q.studyType) articles = articles.filter((a) => a.studyType === q.studyType);
    return { articles, total: (json.message['total-results'] as number) ?? 0, errors: [] as string[] };
  } catch (e) {
    return { articles: [] as Article[], total: 0, errors: [`Crossref: ${(e as Error).message}`] };
  }
}

/** One work by DOI, for opening an article that isn't stored on this device (e.g. a shared link). */
export async function fetchCrossrefWork(doi: string): Promise<Article | undefined> {
  const res = await limitedFetch(`${API}/works/${encodeURIComponent(doi)}`, 1100);
  const w = (await res.json()).message as CrossrefWork;
  const journal: Journal = (w.ISSN ?? []).map(journalByIssn).find(Boolean) ?? {
    id: '', name: w['container-title']?.[0] ?? '', abbr: w['container-title']?.[0] ?? '',
    region: 'USA', issns: w.ISSN ?? [], source: 'crossref', freePct: 0,
  };
  return mapCrossrefWork(w, journal);
}
