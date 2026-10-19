import { useEffect, useState } from 'react';
import { cachedQuery, runQuery } from '../lib/query';
import type { Article, ArticleQuery } from '../lib/types';
import ArticleCard from './ArticleCard';

// What browsers say when a request never reaches the server (no signal, blocked network…).
const NETWORK_FAILURE = /failed to fetch|load failed|networkerror|network request failed/i;

/** Plain-language summary of why sources failed. */
function describeErrors(errors: string[], stale: boolean): string {
  const saved = stale ? ' Showing the results saved on this device.' : '';
  if (!navigator.onLine) return `You're offline.${saved} New articles will load when you're back online.`;
  if (errors.every((e) => NETWORK_FAILURE.test(e))) {
    return `Couldn't reach the journal databases. Check your internet connection (some hospital and college Wi-Fi networks block them) and try again.${saved}`;
  }
  return `Some sources didn't respond: ${errors.map((e) => e.replace(NETWORK_FAILURE, 'no connection')).join(' · ')}.${saved}`;
}

/**
 * Runs a query and lists results with "Load more". Each page shows its last cached result at once
 * (if any) and is replaced when fresh results arrive. Resets to page 0 when the query changes.
 */
export default function ArticleList({ query }: { query: Omit<ArticleQuery, 'page'> }) {
  const key = JSON.stringify(query);
  // Query and page change together, so a new query never fetches an old page number.
  const [req, setReq] = useState({ key, page: 0 });
  const [pages, setPages] = useState<Article[][]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  if (req.key !== key) {
    setReq({ key, page: 0 });
    setPages([]);
    setLoading(true);
    setErrors([]);
  }

  useEffect(() => {
    let cancelled = false;
    let fresh = false;
    const q = { ...JSON.parse(req.key), page: req.page } as ArticleQuery;
    const setPage = (articles: Article[]) =>
      setPages((prev) => {
        const next = prev.slice(0, req.page);
        next[req.page] = articles;
        return next;
      });

    cachedQuery(q).then((c) => {
      if (cancelled || fresh || !c) return;
      setPage(c.articles);
      setTotal(c.total);
      setHasMore(c.hasMore);
      setStale(true);
    });
    runQuery(q)
      .then((r) => {
        fresh = true;
        if (cancelled) return;
        // Keep the cached page if every source failed (e.g. offline).
        if (r.articles.length || !r.errors.length) {
          setPage(r.articles);
          setTotal(r.total);
          setHasMore(r.hasMore);
          setStale(false);
        }
        setErrors(r.errors);
      })
      .catch((e) => !cancelled && setErrors([e.message]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [req]);

  // Try again by itself when the connection comes back.
  /** Starts a request: the same page again (retry) or the next one. */
  const request = (page?: number) => {
    setLoading(true);
    setErrors([]);
    setReq((r) => ({ ...r, page: page ?? r.page }));
  };
  const retry = () => request();
  useEffect(() => {
    if (!errors.length) return;
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [errors.length]);

  // A later page can repeat an article from an earlier one when new articles arrive in between.
  const seen = new Set<string>();
  const articles = pages.flat().filter((a) => !seen.has(a.id) && seen.add(a.id));
  const waitingForFirst = loading && !articles.length;

  return (
    <section>
      <p className="result-count" aria-live="polite">
        {waitingForFirst ? 'Loading articles…' : `${total.toLocaleString()} articles`}
        {loading && stale && <span className="refreshing"> · checking for new articles…</span>}
      </p>
      {errors.length > 0 && (
        <div className="errors" role="status">
          <span>{describeErrors(errors, stale)}</span>
          {!loading && (
            <button type="button" className="btn btn-retry" onClick={retry}>
              Try again
            </button>
          )}
        </div>
      )}
      <div className="grid">
        {articles.map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i % 20} />
        ))}
        {loading && !pages[req.page] &&
          Array.from({ length: articles.length ? 2 : 6 }, (_, i) => <div key={i} className="card skeleton" />)}
      </div>
      {!loading && !articles.length && !errors.length && <p className="empty">No articles match these filters.</p>}
      {hasMore && !loading && (
        <button type="button" className="btn btn-more" onClick={() => request(req.page + 1)}>
          Load more
        </button>
      )}
    </section>
  );
}
