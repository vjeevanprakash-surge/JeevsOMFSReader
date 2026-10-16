import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { JOURNALS } from '../data/journals';
import { addRecent, clearRecent, getRecent, searchPath, type RecentSearch } from '../lib/recent';
import RecentChips from './RecentChips';

/** How far the on-screen keyboard covers the page, so the bar can sit just above it. */
function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);
  return inset;
}

/** Phones only (hidden from tablet width up by CSS): a search bar floating above the tab bar. */
export default function FloatingSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const keyboard = useKeyboardInset();

  const go = (r: RecentSearch) => {
    addRecent(r);
    (document.activeElement as HTMLElement | null)?.blur();
    navigate(searchPath(r));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) go({ q: q.trim(), by: 'keyword' });
  };

  return (
    <div
      className={`fsearch ${focused ? 'is-focused' : ''}`}
      // With the keyboard up the tab bar is hidden behind it: sit directly above the keyboard instead.
      style={keyboard > 40 ? { bottom: keyboard + 8 } : undefined}
    >
      {focused && recent.length > 0 && (
        <div className="fsearch-recent glass">
          <RecentChips
            items={recent}
            onPick={go}
            onClear={() => {
              clearRecent();
              setRecent([]);
            }}
          />
        </div>
      )}
      <form className="fsearch-bar glass" role="search" onSubmit={submit}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          enterKeyHint="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setRecent(getRecent());
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={`Search ${JOURNALS.length} journals`}
          aria-label="Search articles"
        />
        {q && (
          <button type="button" className="fsearch-clear" aria-label="Clear search" onPointerDown={(e) => e.preventDefault()} onClick={() => setQ('')}>
            ×
          </button>
        )}
      </form>
    </div>
  );
}
