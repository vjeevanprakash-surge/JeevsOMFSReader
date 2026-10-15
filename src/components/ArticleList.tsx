import { useEffect, useState } from 'react';
import { cachedQuery, runQuery } from '../lib/query';
import type { Article, ArticleQuery } from '../lib/types';
import ArticleCard from './ArticleCard';

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

    setLoading(true);
    setErrors([]);
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
          {stale ? 'Showing saved results. ' : ''}Some sources didn't respond: {errors.join(' · ')}
        </div>
      )}
      <div className="grid">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {loading && !pages[req.page] &&
          Array.from({ length: articles.length ? 2 : 6 }, (_, i) => <div key={i} className="card skeleton" />)}
      </div>
      {!loading && !articles.length && !errors.length && <p className="empty">No articles match these filters.</p>}
      {hasMore && !loading && (
        <button type="button" className="btn btn-more" onClick={() => setReq((r) => ({ ...r, page: r.page + 1 }))}>
          Load more
        </button>
      )}
    </section>
  );
}
