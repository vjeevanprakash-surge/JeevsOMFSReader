import { limitedFetch } from './http';
import type { Article } from './types';

const API = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

interface EpmcResult {
  pmid?: string;
  pmcid?: string;
  isOpenAccess?: 'Y' | 'N';
  fullTextUrlList?: { fullTextUrl: { availabilityCode: string; documentStyle: string; url: string }[] };
}

/** Adds open-access status and PDF links from Europe PMC to PubMed articles (one request per page). */
export async function enrichOpenAccess(articles: Article[]): Promise<Article[]> {
  const pmids = articles.map((a) => a.pmid).filter(Boolean) as string[];
  if (!pmids.length) return articles;
  const query = `(${pmids.map((id) => `EXT_ID:${id}`).join(' OR ')}) AND SRC:MED`;
  const p = new URLSearchParams({ query, resultType: 'core', format: 'json', pageSize: String(pmids.length) });
  const res = await limitedFetch(`${API}?${p}`, 100);
  const json = await res.json();
  const byPmid = new Map<string, EpmcResult>();
  for (const r of (json.resultList?.result ?? []) as EpmcResult[]) if (r.pmid) byPmid.set(r.pmid, r);

  return articles.map((a) => {
    const r = a.pmid ? byPmid.get(a.pmid) : undefined;
    if (!r) return a;
    const urls = r.fullTextUrlList?.fullTextUrl ?? [];
    // "OA" = open access, "F" = free to read. Both count as free for the reader.
    const free = urls.filter((u) => u.availabilityCode === 'OA' || u.availabilityCode === 'F');
    const pdf = free.find((u) => u.documentStyle === 'pdf')?.url;
    return {
      ...a,
      pmcid: r.pmcid ?? a.pmcid,
      isOpenAccess: a.isOpenAccess || r.isOpenAccess === 'Y' || free.length > 0,
      pdfUrl: pdf ?? a.pdfUrl,
    };
  });
}
