import { relevanceFor, viewOf } from '../data/journals';
import { searchCrossref } from './crossref';
import { pubmedDois } from './pubmed';
import type { Article, ArticleQuery, Journal } from './types';

/**
 * PubMed indexes most journals within days, but some fall months behind (Journal of Cosmetic
 * Dermatology had nothing new from June to October 2026, while Crossref had 300 papers). For the
 * journals flagged `pubmedLag` (found with scripts/audit-pubmed-lag.py), this fills the gap: papers
 * Crossref registered 3 weeks to 6 months ago that PubMed still doesn't have. Newer ones are left
 * alone: PubMed usually lists them within 3 weeks, with abstracts and free-text status that Crossref
 * often lacks. (Asking Crossref about every PubMed journal at once takes it 10+ seconds.)
 */
const SETTLE_DAYS = 21;
const WINDOW_DAYS = 183;
export const GAP_ROWS = 40;
/** Pages beyond this are old enough that PubMed has caught up. */
const MAX_PAGE = 2;
/**
 * The gap is a bonus: the page waits at most WAIT_MS for it. Crossref can be slow, so the request
 * carries on for up to REQUEST_MS and its result is kept for KEEP_MS: the next visit shows it.
 */
const WAIT_MS = 10_000;
const REQUEST_MS = 45_000;
const KEEP_MS = 60 * 60_000;
const SUPPLEMENT = /^S\d/i;

const isoDaysAgo = (days: number, now: number) => new Date(now - days * 864e5).toISOString().slice(0, 10);

/**
 * A PubMed relevance filter as a title/abstract matcher: its [tiab] terms (MeSH headings are left
 * out; Crossref has none, and each one has [tiab] terms beside it).
 */
export function relevanceMatcher(query: string): RegExp {
  const terms = [...query.matchAll(/(?:"([^"]+)"|([\w*-]+))\[tiab\]/gi)].map(([, phrase, word]) => {
    const t = (phrase ?? word).toLowerCase();
    const body = t.replace(/[.*+?^${}()|[\]\\]/g, (c) => (c === '*' ? '*' : `\\${c}`)).replace(/\*/g, '\\w*');
    return `\\b${body}${t.endsWith('*') ? '' : '\\b'}`;
  });
  return new RegExp(terms.join('|'), 'i');
}

const matchers = new Map<string, RegExp>();
const matcherFor = (query: string) => {
  let m = matchers.get(query);
  if (!m) matchers.set(query, (m = relevanceMatcher(query)));
  return m;
};

/** Whether a Crossref article passes the relevance filter its journal has in this view. */
export function relevant(a: Article, journals: Journal[], q: ArticleQuery): boolean {
  const j = journals.find((x) => x.id === a.journalId);
  const filter = j && relevanceFor(j, viewOf(q));
  return !filter || matcherFor(filter).test(`${a.title} ${a.abstract} ${a.keywords.join(' ')}`);
}

const recent = new Map<string, { at: number; articles: Promise<Article[]> }>();

/** A bonus on top of PubMed: any failure or delay just means no extra papers this time. */
export async function pubmedGap(journals: Journal[], q: ArticleQuery, now = Date.now()): Promise<Article[]> {
  const lagging = journals.filter((j) => j.pubmedLag);
  const thisYear = new Date(now).getFullYear();
  if (!lagging.length || q.page > MAX_PAGE || (q.yearTo && q.yearTo < thisYear - 1)) return [];
  const key = JSON.stringify([lagging.map((j) => j.id), q]);
  let entry = recent.get(key);
  if (!entry || now - entry.at > KEEP_MS) {
    const fresh = {
      at: now,
      articles: fetchGap(lagging, q, now).catch(() => null).then((a) => {
        // Failures aren't kept: the next visit tries again.
        if (!a && recent.get(key) === fresh) recent.delete(key);
        return a ?? [];
      }),
    };
    recent.set(key, (entry = fresh));
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const waited = new Promise<Article[]>((resolve) => (timer = setTimeout(() => resolve([]), WAIT_MS)));
  return Promise.race([entry.articles, waited]).finally(() => clearTimeout(timer));
}

/** The gap papers, or null if Crossref or PubMed couldn't be asked. */
async function fetchGap(lagging: Journal[], q: ArticleQuery, now: number): Promise<Article[] | null> {
  const created = { from: isoDaysAgo(WINDOW_DAYS, now), until: isoDaysAgo(SETTLE_DAYS, now) };
  const cr = await searchCrossref(lagging, q, GAP_ROWS, { created, signal: AbortSignal.timeout(REQUEST_MS) });
  if (cr.errors.length) return null;
  // Supplement pages (S12) are meeting abstracts, which PubMed never lists.
  const candidates = cr.articles.filter((a) => a.doi && !SUPPLEMENT.test(a.pages ?? '') && relevant(a, lagging, q));
  // If PubMed can't be asked which are new, show none rather than risk duplicates.
  const known = await pubmedDois(candidates.map((a) => a.doi!)).catch(() => undefined);
  return known ? candidates.filter((a) => !known.has(a.doi!.toLowerCase())) : null;
}
