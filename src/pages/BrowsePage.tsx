import { useSearchParams } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import { JOURNALS } from '../data/journals';
import Filters, { filtersFromParams, filtersToParams, filtersToQuery } from '../components/Filters';

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);

  return (
    <>
      <div className="page-head">
        <h1>Latest OMFS research</h1>
        <p className="lede">
          Free-to-read research from {JOURNALS.length} OMFS journals. Green cards open in full, no subscription needed.
        </p>
      </div>
      <div className="layout">
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
