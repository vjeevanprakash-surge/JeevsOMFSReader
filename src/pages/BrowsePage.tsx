import { useSearchParams } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import Filters, { filtersFromParams, filtersToParams, filtersToQuery } from '../components/Filters';

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);

  return (
    <>
      <div className="page-head">
        <h1>Latest OMFS research</h1>
        <p className="lede">Browse journals by region, topic and year. Green cards are free to read.</p>
      </div>
      <Filters value={filters} onChange={(f) => setParams(filtersToParams(f), { replace: true })} />
      <ArticleList query={filtersToQuery(filters)} />
    </>
  );
}
