import { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard';
import { CLASSICS } from '../data/classics';
import { cacheArticles, getArticle } from '../lib/db';
import { enrichOpenAccess } from '../lib/europepmc';
import { fetchPubmed } from '../lib/pubmed';
import type { Article } from '../lib/types';

const ALL_PMIDS = CLASSICS.flatMap((s) => s.papers.map((p) => p.pmid));

/** Classics from device storage, fetching any not yet stored (one PubMed request for the lot). */
async function loadClassics(): Promise<Map<string, Article>> {
  const found = new Map<string, Article>();
  await Promise.all(
    ALL_PMIDS.map(async (pmid) => {
      const a = await getArticle(`pmid:${pmid}`).catch(() => undefined);
      if (a) found.set(pmid, a);
    }),
  );
  const missing = ALL_PMIDS.filter((p) => !found.has(p));
  if (missing.length) {
    const fetched = await enrichOpenAccess(await fetchPubmed(missing));
    for (const a of await cacheArticles(fetched).catch(() => fetched)) if (a.pmid) found.set(a.pmid, a);
  }
  return found;
}

export default function ClassicsPage() {
  const [articles, setArticles] = useState<Map<string, Article> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClassics()
      .then(setArticles)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">{ALL_PMIDS.length} landmark papers</p>
        <h1>Classics</h1>
        <p className="lede">The papers behind everyday OMFS practice: the ones worth reading at least once.</p>
      </div>
      {error && <p className="errors">Couldn't load the classics: {error}</p>}
      {CLASSICS.map((section) => (
        <section key={section.title} className="classics-section">
          <h2>{section.title}</h2>
          <div className="grid">
            {section.papers.map((p, i) => {
              const a = articles?.get(p.pmid);
              return a ? (
                <ArticleCard key={p.pmid} article={a} index={i} note={p.why} />
              ) : (
                <div key={p.pmid} className={`card ${articles ? 'card-missing' : 'skeleton'}`}>
                  {articles && <p className="card-note">{p.why} (PMID {p.pmid} could not be loaded.)</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
