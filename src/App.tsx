import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import FloatingSearch from './components/FloatingSearch';
import { SEARCH_SHORTCUT } from './lib/recent';
import { applyUpdate, onNavigate, onUpdatePending, updatePending } from './lib/update';
import { APP_VERSION } from './data/changelog';
import ArticlePage from './pages/ArticlePage';
import BrowsePage from './pages/BrowsePage';
import ChangelogPage from './pages/ChangelogPage';
import ClassicsPage from './pages/ClassicsPage';
import ReaderPage from './pages/ReaderPage';
import SavedPage from './pages/SavedPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import StatsPage from './pages/StatsPage';
import { APP_NAME, TAGLINE } from './data/brand';

const NAV = [
  { to: '/', label: 'Browse', icon: '▦' },
  { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/classics', label: 'Classics', icon: '❖' },
  { to: '/saved', label: 'Saved', icon: '★' },
  { to: '/stats', label: 'Stats', icon: '▤' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** Pages that get the floating search bar on phones (not articles, so it never covers reading). */
const FLOATING_SEARCH_ON = ['/', '/classics', '/saved', '/stats'];

/** Ctrl+K / ⌘K: focus the search box, opening the Search page if needed. */
function useSearchShortcut() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>('form.search input[type="search"]');
      if (input) {
        input.focus();
        input.select();
      } else navigate('/search', { state: { focus: true } });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}

/** A small notice when a new version is ready (it is also applied on the next page change). */
function UpdateNotice() {
  const [ready, setReady] = useState(updatePending);
  useEffect(() => onUpdatePending(() => setReady(true)), []);
  if (!ready) return null;
  return (
    <div className="update-notice glass" role="status">
      <span>✨ New features are ready</span>
      <button type="button" className="btn btn-primary" onClick={applyUpdate}>
        Update
      </button>
    </div>
  );
}

const SEEN_KEY = 'omfs-seen-version';

/** After an update: which version this device was on before, if it changed (read once per load). */
function previousVersion(): string | undefined {
  try {
    const seen = localStorage.getItem(SEEN_KEY);
    localStorage.setItem(SEEN_KEY, APP_VERSION);
    return seen && seen !== APP_VERSION ? seen : undefined;
  } catch {
    return undefined;
  }
}
const UPDATED_FROM = previousVersion();

/** "Updated to vX": shown once after a new version arrives, linking to what changed. */
function UpdatedNotice() {
  const [open, setOpen] = useState(!!UPDATED_FROM);
  const { pathname } = useLocation();
  if (!open || pathname === '/changelog') return null;
  return (
    <div className="update-notice glass" role="status">
      <span>🎉 Updated to v{APP_VERSION}</span>
      <NavLink to="/changelog" className="btn btn-primary" onClick={() => setOpen(false)}>
        What’s new
      </NavLink>
      <button type="button" className="notice-close" aria-label="Dismiss" onClick={() => setOpen(false)}>
        ×
      </button>
    </div>
  );
}

function Shell() {
  const online = useOnline();
  const { pathname } = useLocation();
  useSearchShortcut();
  // Braces matter: newer browsers' scrollTo returns a Promise, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0);
    onNavigate();
  }, [pathname]);

  return (
    <>
      {/* Soft moving light behind the glass surfaces. */}
      <div className="backdrop" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <header className="topbar glass">
        <NavLink to="/" className="brand" aria-label={`${APP_NAME} home`}>
          <img className="brand-logo" src={`${import.meta.env.BASE_URL}favicon.svg`} width={36} height={36} alt="" />
          <span className="brand-text">
            <span className="brand-name">
              <span className="brand-owner">Jeevs</span> OMFS <span>Reader</span>
            </span>
            <span className="brand-tag">{TAGLINE}</span>
          </span>
        </NavLink>
      </header>
      {/* Outside the header: a blurred (backdrop-filter) header would trap a fixed bottom bar. */}
      <nav className="nav glass" aria-label="Main">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            // On phones search lives in the floating bar instead of the tab bar (see CSS).
            className={n.to === '/search' ? 'nav-search' : undefined}
            title={n.to === '/search' ? `Search (${SEARCH_SHORTCUT})` : n.label}
          >
            <span className="nav-icon" aria-hidden>
              {n.icon}
            </span>
            <span className="nav-label">{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <UpdateNotice />
      <UpdatedNotice />
      {!online && <div className="offline">You're offline — showing saved and cached articles.</div>}
      <main className="main">
        {/* Keyed by route so each page fades in. */}
        <div className="page" key={pathname}>
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/article/*" element={<ArticlePage />} />
            <Route path="/read/*" element={<ReaderPage />} />
            <Route path="/classics" element={<ClassicsPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route
              path="*"
              element={
                <p className="empty">
                  Page not found. <NavLink to="/">Back to browse</NavLink>
                </p>
              }
            />
          </Routes>
        </div>
      </main>
      {FLOATING_SEARCH_ON.includes(pathname) && <FloatingSearch />}
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
