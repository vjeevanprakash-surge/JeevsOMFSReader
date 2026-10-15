import { journalByIssn } from '../data/journals';
import { classify, topicById } from '../data/topics';
import { limitedFetch } from './http';
import { getSettings } from './settings';
import type { Article, ArticleQuery, Journal } from './types';

const API = 'https://api.crossref.org';
/** Front matter and notices Crossref registers as articles. */
export const JUNK_TITLE = /^(editorial board|ed board|issue information|table of contents|toc|future issues|contents|masthead|cover|.*newsletter|corrigendum|erratum|retraction|correction to)\b|---/i;

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
  link?: { URL: string; 'content-type'?: string }[];
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
  const isOpenAccess = !!journal.openAccess || (w.license ?? []).some((l) => /creativecommons\.org/i.test(l.URL));
  const pdf = w.link?.find((l) => l['content-type'] === 'application/pdf')?.URL;
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
    isOpenAccess,
    pdfUrl: isOpenAccess ? pdf : undefined,
  };
}

/**
 * One request for all Crossref-sourced journals: repeated `issn:` filters are OR-ed by Crossref.
 * (Crossref rejects parallel requests from the public pool, and its 429s carry no CORS header.)
 */
export async function searchCrossref(journals: Journal[], q: ArticleQuery, rows: number) {
  if (!journals.length) return { articles: [] as Article[], total: 0, errors: [] as string[] };
  const s = getSettings();
  const filters = [
    ...journals.flatMap((j) => j.issns.map((i) => `issn:${i}`)),
    'type:journal-article',
    `from-pub-date:${q.yearFrom ?? 1900}`,
    `until-pub-date:${q.yearTo ?? 3000}`,
  ];
  const p = new URLSearchParams({
    filter: filters.join(','),
    sort: 'created',
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
    const res = await limitedFetch(`${API}/works?${p}`, 1100);
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
    return { articles, total: (json.message['total-results'] as number) ?? 0, errors: [] as string[] };
  } catch (e) {
    return { articles: [] as Article[], total: 0, errors: [`Crossref: ${(e as Error).message}`] };
  }
}
