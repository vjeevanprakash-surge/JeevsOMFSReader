import { Link } from 'react-router-dom';
import { formatDate } from '../components/ArticleCard';
import { APP_VERSION, CHANGELOG, type Release } from '../data/changelog';

export function ReleaseCard({ r, index = 0 }: { r: Release; index?: number }) {
  return (
    <article className="release glass" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <header className="release-head">
        <span className="release-version">v{r.version}</span>
        {r.version === APP_VERSION && <span className="release-current">Current</span>}
        <time dateTime={r.date}>{formatDate(r.date)}</time>
      </header>
      <h2>{r.title}</h2>
      <ul>
        {r.changes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </article>
  );
}

export default function ChangelogPage() {
  return (
    <div className="changelog">
      <Link className="back" to="/settings">
        ← Settings
      </Link>
      <div className="page-head">
        <p className="eyebrow">
          {CHANGELOG.length} versions · you have v{APP_VERSION}
        </p>
        <h1>Version history</h1>
        <p className="lede">What changed in each build, newest first.</p>
      </div>
      <div className="releases">
        {CHANGELOG.map((r, i) => (
          <ReleaseCard key={r.version} r={r} index={i} />
        ))}
      </div>
    </div>
  );
}
