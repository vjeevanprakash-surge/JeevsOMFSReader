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
      <Filters value={filters} onChange={(f) => setParams(filtersToParams(f), { replace: true })} />
      <ArticleList query={filtersToQuery(filters)} />
    </>
  );
}
