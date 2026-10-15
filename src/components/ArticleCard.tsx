import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { journalById } from '../data/journals';
import { isNew } from '../lib/pdf';
import { articlePath } from '../lib/routes';
import type { Article } from '../lib/types';
import BookmarkButton from './BookmarkButton';

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export function shortAuthors(a: Article) {
  if (!a.authors.length) return 'No authors listed';
  const first = `${a.authors[0].last} ${a.authors[0].initials}`;
  return a.authors.length > 2 ? `${first} et al.` : a.authors.map((x) => `${x.last} ${x.initials}`).join(', ');
}

/** `index` staggers the entrance animation (position within its page of results). */
export default function ArticleCard({ article: a, index = 0 }: { article: Article; index?: number }) {
  const region = journalById(a.journalId)?.region;
  return (
    <article
      className={`card ${a.isOpenAccess ? 'card-free' : 'card-paid'}`}
      style={{ '--i': Math.min(index, 11) } as CSSProperties}
    >
      <div className="card-top">
        <span className={`access ${a.isOpenAccess ? 'access-free' : 'access-paid'}`}>
          {a.isOpenAccess ? 'Free' : '🔒 Subscription'}
        </span>
        {isNew(a) && <span className="badge-new">New</span>}
        <BookmarkButton id={a.id} />
      </div>
      <h3 className="card-title">
        <Link to={articlePath(a.id)} state={{ article: a }}>
          {a.title}
        </Link>
      </h3>
      <p className="card-authors">{shortAuthors(a)}</p>
      <p className="card-meta">
        <span className="journal">{a.journalAbbr}</span>
        {region && <span>· {region}</span>}
        <span>· {formatDate(a.pubDate)}</span>
      </p>
      <div className="chips">
        {a.topics.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}
