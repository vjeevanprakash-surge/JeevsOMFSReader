import { useSearchParams } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import InstallBanner from '../components/InstallBanner';
import { JOURNALS, REGIONS } from '../data/journals';
import Filters, { filtersFromParams, filtersToParams, filtersToQuery } from '../components/Filters';

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);

  return (
    <>
      <InstallBanner />
      <div className="layout">
        <header className="page-head">
          <p className="eyebrow">
            {JOURNALS.length} journals · {REGIONS.length} regions · updated live
          </p>
          <h1>Latest OMFS research</h1>
          <p className="lede">Free-to-read papers, newest first. Green cards open in full, no subscription needed.</p>
        </header>
        <aside className="sidebar glass" aria-label="Filters">
          <Filters value={filters} onChange={(f) => setParams(filtersToParams(f), { replace: true })} />
        </aside>
        <div className="results">
          <ArticleList query={filtersToQuery(filters)} />
        </div>
      </div>
    </>
  );
}
