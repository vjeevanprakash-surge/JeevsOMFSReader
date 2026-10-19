import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import Filters, { filtersFromParams, filtersToParams, filtersToQuery } from '../components/Filters';
import RecentChips from '../components/RecentChips';
import { selectJournals } from '../data/journals';
import { specialtyLabel } from '../data/specialties';
import { addRecent, clearRecent, getRecent, SEARCH_SHORTCUT, type RecentSearch } from '../lib/recent';

// Keyboard-shortcut hint only where there is a keyboard and mouse (not on phones/tablets).
const HINT = window.matchMedia('(hover: hover) and (pointer: fine)').matches ? `  (${SEARCH_SHORTCUT})` : '';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const q = params.get('q') ?? '';
  const mode = params.get('by') === 'author' ? 'author' : 'keyword';
  // Searches default to most relevant first; ?sort=newest switches to newest first.
  const sort = params.get('sort') === 'newest' ? 'newest' : 'relevance';
  const keep = { q, by: mode, sort: sort === 'newest' ? 'newest' : '' };
  const [draft, setDraft] = useState(q);
  const [recent, setRecent] = useState(getRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusRequested = (useLocation().state as { focus?: boolean } | null)?.focus;

  // Opened with Ctrl+K / ⌘K, or with nothing searched yet on a big screen: put the cursor in the box.
  useEffect(() => {
    if (focusRequested || (!q && window.matchMedia('(min-width: 720px)').matches)) inputRef.current?.focus();
  }, [focusRequested, q]);

  // Every search that runs (typed here, from the floating bar, or a recent chip) becomes a recent one.
  useEffect(() => {
    if (q) {
      addRecent({ q, by: mode });
      setRecent(getRecent());
    }
  }, [q, mode]);

  const pickRecent = (r: RecentSearch) => {
    setDraft(r.q);
    update({ q: r.q, by: r.by });
  };

  const update = (patch: Record<string, string>) =>
    setParams(filtersToParams(filters, { ...keep, ...patch }), { replace: true });

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
          <Filters value={filters} onChange={(f) => setParams(filtersToParams(f, keep), { replace: true })} />
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
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={mode === 'author' ? 'Ellis E or Ellis Edward' : `mandibular fracture fixation${HINT}`}
              aria-label={mode === 'author' ? 'Author name' : 'Keywords'}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          {q ? (
            <>
              <div className="sort-row">
                <span>Sort</span>
                <div className="seg" role="group" aria-label="Sort results">
                  {(['relevance', 'newest'] as const).map((s) => (
                    <button key={s} type="button" className={sort === s ? 'active' : ''} aria-pressed={sort === s} onClick={() => update({ sort: s === 'newest' ? 'newest' : '' })}>
                      {s === 'relevance' ? 'Most relevant' : 'Newest'}
                    </button>
                  ))}
                </div>
              </div>
              <ArticleList query={{ ...filtersToQuery(filters), [mode]: q, sort }} />
            </>
          ) : (
            <>
              <RecentChips
                items={recent}
                onPick={pickRecent}
                onClear={() => {
                  clearRecent();
                  setRecent([]);
                }}
              />
              <p className="empty">
                Search titles and abstracts across {selectJournals(filtersToQuery(filters)).length}{' '}
                {filters.specialty === 'all' ? '' : `${specialtyLabel(filters.specialty)} `}journals, or find an author's work.
                Pick a specialty above to widen or narrow it.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
