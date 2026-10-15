import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import Filters, { filtersFromParams, filtersToParams, filtersToQuery } from '../components/Filters';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const q = params.get('q') ?? '';
  const mode = params.get('by') === 'author' ? 'author' : 'keyword';
  const [draft, setDraft] = useState(q);

  const update = (patch: Record<string, string>) =>
    setParams(filtersToParams(filters, { q, by: mode, ...patch }), { replace: true });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update({ q: draft.trim() });
  };

  return (
    <>
      <div className="layout">
        <header className="page-head">
          <h1>Search</h1>
          <p className="lede">Find papers by keyword or author across every journal.</p>
        </header>
        <aside className="sidebar glass" aria-label="Filters">
          <Filters value={filters} onChange={(f) => setParams(filtersToParams(f, { q, by: mode }), { replace: true })} />
        </aside>
        <div className="results">
          <form className="search glass" onSubmit={submit} role="search">
            <div className="seg" role="group" aria-label="Search by">
              {(['keyword', 'author'] as const).map((m) => (
                <button key={m} type="button" className={mode === m ? 'active' : ''} aria-pressed={mode === m} onClick={() => update({ by: m })}>
                  {m === 'keyword' ? 'Keyword' : 'Author'}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={mode === 'author' ? 'e.g. Ellis E or Ellis Edward' : 'e.g. mandibular fracture fixation'}
              aria-label={mode === 'author' ? 'Author name' : 'Keywords'}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          {q ? (
            <ArticleList query={{ ...filtersToQuery(filters), [mode]: q }} />
          ) : (
            <p className="empty">Search titles and abstracts across all journals, or find an author's work.</p>
          )}
        </div>
      </div>
    </>
  );
}
