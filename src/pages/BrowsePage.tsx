import { Link, useSearchParams } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import InstallBanner from '../components/InstallBanner';
import { JOURNALS, REGIONS } from '../data/journals';
import { SPECIALTIES, specialtyLabel } from '../data/specialties';
import Filters from '../components/Filters';
import { topicById } from '../data/topics';
import { filtersFromParams, filtersToParams, filtersToQuery, type FilterState } from '../lib/filters';
import { getMyTopics } from '../lib/mytopics';

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const setFilters = (f: FilterState) => setParams(filtersToParams(f), { replace: true });
  const mine = getMyTopics();
  const shortsLink = filters.specialty === 'omfs' || filters.specialty === 'all' ? '/' : `/?spec=${filters.specialty}`;

  return (
    <>
      <InstallBanner />
      <div className="layout">
        <header className="page-head">
          <p className="eyebrow">
            {JOURNALS.length} journals · {SPECIALTIES.length} specialties · {REGIONS.length} regions · updated live
          </p>
          <h1>Latest {filters.specialty === 'all' ? '' : `${specialtyLabel(filters.specialty)} `}research</h1>
          <p className="lede">Free-to-read papers, newest first. Green cards open in full, no subscription needed.</p>
          <Link className="shorts-banner glass" to={shortsLink}>
            <span aria-hidden>⚡</span>
            <span>
              <strong>Shorts</strong> · the newest free meta-analyses, trials and guidelines, one card at a time
            </span>
            <span aria-hidden>→</span>
          </Link>
          {mine.length > 0 && (
            <div className="specialty-chips my-topic-chips" role="group" aria-label="My topics">
              {mine.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`chip-btn ${filters.topic === id ? 'active' : ''}`}
                  aria-pressed={filters.topic === id}
                  onClick={() => setFilters({ ...filters, topic: filters.topic === id ? '' : id })}
                >
                  {topicById(id)!.label}
                </button>
              ))}
            </div>
          )}
        </header>
        <aside className="sidebar glass" aria-label="Filters">
          <Filters value={filters} onChange={setFilters} />
        </aside>
        <div className="results">
          <ArticleList query={filtersToQuery(filters)} />
        </div>
      </div>
    </>
  );
}
