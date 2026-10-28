import { selectJournals } from '../data/journals';
import { searchCrossref } from './crossref';
import { cacheArticles, cachedQueryResult, saveQueryResult } from './db';
import { enrichOpenAccess } from './europepmc';
import { pubmedGap } from './gap';
import { PAGE_SIZE, searchPubmed } from './pubmed';
import type { ArticleQuery, QueryResult } from './types';

export async function runQuery(q: ArticleQuery): Promise<QueryResult> {
  const journals = selectJournals(q);
  const pubmedJ = journals.filter((j) => j.source === 'pubmed');
  const crossrefJ = journals.filter((j) => j.source === 'crossref');
  const errors: string[] = [];
  const crossrefRows = pubmedJ.length ? 6 : PAGE_SIZE;

  const [pm, cr, gap] = await Promise.all([
    searchPubmed(pubmedJ, q).catch((e) => {
      errors.push(`PubMed: ${e.message}`);
      return { articles: [], total: 0 };
    }),
    // Crossref journals get a full page when browsing them alone, otherwise a share alongside PubMed.
    searchCrossref(crossrefJ, q, crossrefRows),
    // Papers from the PubMed journals that PubMed hasn't caught up with yet (see gap.ts).
    pubmedGap(pubmedJ, q).catch(() => []),
  ]);
  errors.push(...cr.errors);

  let pubmedArticles = pm.articles;
  try {
    pubmedArticles = await enrichOpenAccess(pubmedArticles);
  } catch (e) {
    errors.push(`Europe PMC (open-access status): ${(e as Error).message}`);
  }

  const onPage = new Set(pubmedArticles.map((a) => a.doi?.toLowerCase()));
  const sources = [pubmedArticles, cr.articles, gap.filter((a) => !onPage.has(a.doi!.toLowerCase()))];
  // Newest: one timeline. Relevance: each source is already ranked, so interleave them by rank position.
  const merged =
    q.sort === 'relevance'
      ? sources
          .flatMap((list) => list.map((a, i) => ({ a, k: i / list.length })))
          .sort((x, y) => x.k - y.k)
          .map((x) => x.a)
      : sources.flat().sort((a, b) => b.addedDate.localeCompare(a.addedDate));
  const articles = await cacheArticles(merged).catch(() => merged);
  const hasMore = (q.page + 1) * PAGE_SIZE < pm.total || (q.page + 1) * crossrefRows < cr.total;
  const total = pm.total + cr.total;
  if (!errors.length) saveQueryResult(JSON.stringify(q), articles.map((a) => a.id), total, hasMore).catch(() => undefined);
  return { articles, total, errors, hasMore };
}

/** The last stored result for this exact query (same filters and page), if any. */
export const cachedQuery = (q: ArticleQuery) => cachedQueryResult(JSON.stringify(q)).catch(() => undefined);
