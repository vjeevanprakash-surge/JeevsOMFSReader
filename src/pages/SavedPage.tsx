import { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard';
import { downloadText, toBibtex, toVancouver } from '../lib/citation';
import { bookmarkedArticles } from '../lib/db';
import type { Article } from '../lib/types';

export default function SavedPage() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  useEffect(() => {
    bookmarkedArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  return (
    <>
      <div className="page-head">
        <h1>Saved</h1>
        <p className="lede">Saved articles stay on this device and are available offline.</p>
      </div>
      {articles && articles.length > 0 && (
        <div className="actions">
          <button type="button" className="btn" onClick={() => downloadText('omfs-saved-vancouver.txt', articles.map((a, i) => `${i + 1}. ${toVancouver(a)}`).join('\n'))}>
            ⤓ Export all — Vancouver
          </button>
          <button type="button" className="btn" onClick={() => downloadText('omfs-saved-bibtex.txt', articles.map(toBibtex).join('\n\n'))}>
            ⤓ Export all — BibTeX
          </button>
        </div>
      )}
      {articles === null ? (
        <p className="empty">Loading…</p>
      ) : articles.length ? (
        <div className="grid">
          {articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </div>
      ) : (
        <p className="empty">Nothing saved yet. Tap ☆ on any article to keep it here.</p>
      )}
    </>
  );
}
