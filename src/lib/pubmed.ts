import { journalByIssn } from '../data/journals';
import { detectStudyType, studyTypeQuery } from '../data/studyTypes';
import { relevanceFor, viewOf } from '../data/journals';
import { classify, topicById } from '../data/topics';
import { limitedFetch } from './http';
import { getSettings } from './settings';
import type { Article, ArticleQuery, Author, Journal } from './types';

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
export const PAGE_SIZE = 20;
const FREE_FILTER = 'free full text[sb]';

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

/** Builds the PubMed search term for the given journals and filters. */
export function buildPubmedTerm(journals: Journal[], q: ArticleQuery): string {
  // Journals grouped by the relevance filter they need in this view ('' = none).
  const view = viewOf(q);
  const groups = new Map<string, string[]>();
  for (const j of journals) {
    const filter = relevanceFor(j, view) ?? '';
    groups.set(filter, [...(groups.get(filter) ?? []), ...j.issns]);
  }
  const issnClause = (issns: string[]) => issns.map((i) => `${i}[is]`).join(' OR ');
  const parts: string[] = [];
  const sourceParts = [...groups].map(([filter, issns]) => (filter ? `((${issnClause(issns)}) AND ${filter})` : `(${issnClause(issns)})`));
  parts.push(sourceParts.length > 1 ? `(${sourceParts.join(' OR ')})` : sourceParts[0]);

  const topic = q.topic ? topicById(q.topic) : undefined;
  if (topic) parts.push(topic.query);
  if (q.yearFrom || q.yearTo) parts.push(`${q.yearFrom ?? 1900}:${q.yearTo ?? 3000}[dp]`);
  if (q.keyword?.trim()) parts.push(`(${q.keyword.trim()})[tiab]`);
  if (q.author?.trim()) parts.push(`${q.author.trim()}[au]`);
  // PubMed's "free full text" subset: free on PMC or at the publisher, flagged as soon as it's indexed.
  if (q.freeOnly) parts.push(FREE_FILTER);
  const type = q.studyType ? studyTypeQuery(q.studyType) : undefined;
  if (type) parts.push(type);
  return parts.join(' AND ');
}

function params(extra: Record<string, string>) {
  const s = getSettings();
  const p = new URLSearchParams({ tool: 'JeevsOMFSReader', ...extra });
  if (s.ncbiApiKey) p.set('api_key', s.ncbiApiKey);
  if (s.contactEmail) p.set('email', s.contactEmail);
  return p;
}

const interval = () => (getSettings().ncbiApiKey ? 110 : 350);

export async function searchPubmed(journals: Journal[], q: ArticleQuery): Promise<{ articles: Article[]; total: number }> {
  if (!journals.length) return { articles: [], total: 0 };
  const term = buildPubmedTerm(journals, q);
  // No `sort`: PubMed's default is most recently added, which avoids future-dated issues jumping ahead.
  const p = params({ db: 'pubmed', retmode: 'json', retmax: String(PAGE_SIZE), retstart: String(q.page * PAGE_SIZE) });
  if (q.sort === 'relevance') p.set('sort', 'relevance');
  // POST keeps long ISSN queries under URL length limits.
  p.set('term', term);
  const res = await limitedFetch(`${EUTILS}esearch.fcgi`, interval(), { method: 'POST', body: p });
  const json = await res.json();
  const ids: string[] = json.esearchresult?.idlist ?? [];
  const total = Number(json.esearchresult?.count ?? 0);
  return { articles: await fetchPubmed(ids, q.freeOnly), total };
}

/** Which of these PMIDs PubMed lists as free full text. */
async function freePmids(pmids: string[]): Promise<Set<string>> {
  const p = params({ db: 'pubmed', retmode: 'json', retmax: String(pmids.length) });
  p.set('term', `(${pmids.map((id) => `${id}[uid]`).join(' OR ')}) AND ${FREE_FILTER}`);
  const res = await limitedFetch(`${EUTILS}esearch.fcgi`, interval(), { method: 'POST', body: p });
  return new Set((await res.json()).esearchresult?.idlist ?? []);
}

/** Fetches full records; `allFree` skips the free-text check when the search was already free-only. */
export async function fetchPubmed(pmids: string[], allFree = false): Promise<Article[]> {
  if (!pmids.length) return [];
  const p = params({ db: 'pubmed', retmode: 'xml', id: pmids.join(',') });
  const res = await limitedFetch(`${EUTILS}efetch.fcgi`, interval(), { method: 'POST', body: p });
  const articles = parsePubmedXml(await res.text());
  const free = allFree ? undefined : await freePmids(pmids).catch(() => new Set<string>());
  return articles.map((a) => ({ ...a, isOpenAccess: a.isOpenAccess || !free || free.has(a.pmid!) }));
}

const text = (el: Element | null | undefined) => el?.textContent?.trim() ?? '';

function parseDate(article: Element): string {
  const pd = article.querySelector('Article > Journal > JournalIssue > PubDate');
  const ad = article.querySelector('Article > ArticleDate');
  const src = ad ?? pd;
  let year = text(src?.querySelector('Year'));
  let month = text(src?.querySelector('Month'));
  const day = text(src?.querySelector('Day'));
  if (!year) {
    const medline = text(pd?.querySelector('MedlineDate')); // e.g. "2024 Jan-Feb"
    year = medline.slice(0, 4);
    month = medline.slice(5, 8);
  }
  const mm = /^\d+$/.test(month) ? month.padStart(2, '0') : (MONTHS[month.slice(0, 3).toLowerCase()] ?? '01');
  return `${year || '1900'}-${mm}-${(day || '01').padStart(2, '0')}`;
}

export function parsePubmedXml(xml: string): Article[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return [...doc.querySelectorAll('PubmedArticle')].map((el) => {
    const pmid = text(el.querySelector('MedlineCitation > PMID'));
    const art = el.querySelector('MedlineCitation > Article')!;
    const ids = [...el.querySelectorAll('PubmedData > ArticleIdList > ArticleId')];
    const idOf = (type: string) => text(ids.find((i) => i.getAttribute('IdType') === type));
    const issns = [...art.querySelectorAll('Journal > ISSN')].map((i) => text(i));
    const journal = issns.map(journalByIssn).find(Boolean);

    const authors: Author[] = [...art.querySelectorAll('AuthorList > Author')]
      .map((a) => ({
        last: text(a.querySelector('LastName')) || text(a.querySelector('CollectiveName')),
        first: text(a.querySelector('ForeName')),
        initials: text(a.querySelector('Initials')),
      }))
      .filter((a) => a.last);

    const abstract = [...art.querySelectorAll('Abstract > AbstractText')]
      .map((a) => {
        const label = a.getAttribute('Label');
        return label ? `${label}: ${text(a)}` : text(a);
      })
      .join('\n\n');

    const keywords = [
      ...[...el.querySelectorAll('KeywordList > Keyword')].map(text),
      ...[...el.querySelectorAll('MeshHeadingList > MeshHeading > DescriptorName')].map(text),
    ];
    const title = text(art.querySelector('ArticleTitle')).replace(/\.$/, '');
    const pubDate = parseDate(el.querySelector('MedlineCitation')!);
    const entrez = el.querySelector('PubmedData > History > PubMedPubDate[PubStatus="entrez"]');
    const addedDate = entrez
      ? `${text(entrez.querySelector('Year'))}-${text(entrez.querySelector('Month')).padStart(2, '0')}-${text(entrez.querySelector('Day')).padStart(2, '0')}`
      : pubDate;

    return {
      id: `pmid:${pmid}`,
      pmid,
      pmcid: idOf('pmc') || undefined,
      doi: idOf('doi') || text(art.querySelector('ELocationID[EIdType="doi"]')) || undefined,
      title,
      abstract,
      authors,
      journalId: journal?.id ?? '',
      journalTitle: journal?.name ?? text(art.querySelector('Journal > Title')),
      journalAbbr: journal?.abbr ?? text(art.querySelector('Journal > ISOAbbreviation')),
      volume: text(art.querySelector('JournalIssue > Volume')) || undefined,
      issue: text(art.querySelector('JournalIssue > Issue')) || undefined,
      // Online-only journals give an article number (ELocationID pii) instead of pages.
      pages:
        text(art.querySelector('Pagination > MedlinePgn')) ||
        [text(art.querySelector('ELocationID[EIdType="pii"]'))].find((p) => /^[A-Za-z]?\d{1,7}$/.test(p)) ||
        undefined,
      pubDate,
      addedDate,
      year: Number(pubDate.slice(0, 4)),
      keywords,
      topics: classify({ title, keywords, abstract }),
      studyType: detectStudyType([...art.querySelectorAll('PublicationTypeList > PublicationType')].map(text), title),
      isOpenAccess: (journal?.freePct ?? 0) >= 95,
    } satisfies Article;
  });
}
