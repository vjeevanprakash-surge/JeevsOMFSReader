import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { journalById } from '../data/journals';
import { isNew } from '../lib/pdf';
import { articlePath } from '../lib/routes';
import { formatDate, shortAuthors } from '../lib/format';
import type { Article } from '../lib/types';
import BookmarkButton from './BookmarkButton';
import StudyBadge from './StudyBadge';

/** `index` staggers the entrance animation (position within its page of results). */
/** `note`: an optional line shown under the title (e.g. why a classic paper matters). */
export default function ArticleCard({ article: a, index = 0, note }: { article: Article; index?: number; note?: string }) {
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
        <StudyBadge type={a.studyType} />
        {isNew(a) && <span className="badge-new">New</span>}
        <BookmarkButton id={a.id} />
      </div>
      <h3 className="card-title">
        <Link to={articlePath(a.id)} state={{ article: a }}>
          {a.title}
        </Link>
      </h3>
      {note && <p className="card-note">{note}</p>}
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
