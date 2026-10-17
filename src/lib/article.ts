import { fetchCrossrefWork } from './crossref';
import { cacheArticles, getArticle } from './db';
import { enrichOpenAccess } from './europepmc';
import { fetchPubmed } from './pubmed';
import type { Article } from './types';

/** From device storage, else fetched again (a shared link, or storage unavailable). */
export async function loadArticle(id: string): Promise<Article | undefined> {
  const cached = await getArticle(id).catch(() => undefined);
  if (cached) return cached;
  let fetched: Article[] = [];
  if (id.startsWith('pmid:')) fetched = await enrichOpenAccess(await fetchPubmed([id.slice(5)]));
  else if (id.startsWith('doi:')) fetched = [await fetchCrossrefWork(id.slice(4))].filter((x): x is Article => !!x);
  return (await cacheArticles(fetched).catch(() => fetched))[0];
}

/** True when the paper's full text can be read in the app (open access with a PMC copy). */
export const canReadInApp = (a: Article) => a.isOpenAccess && !!a.pmcid;
