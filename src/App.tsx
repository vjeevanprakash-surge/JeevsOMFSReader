import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import ArticlePage from './pages/ArticlePage';
import BrowsePage from './pages/BrowsePage';
import SavedPage from './pages/SavedPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import StatsPage from './pages/StatsPage';

const NAV = [
  { to: '/', label: 'Browse', icon: '▦' },
  { to: '/search', label: 'Search', icon: '⌕' },
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

function Shell() {
  const online = useOnline();
  const { pathname } = useLocation();
  // Braces matter: newer browsers' scrollTo returns a Promise, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0);
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
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            ✚
          </span>
          OMFS <span>Reader</span>
        </NavLink>
      </header>
      {/* Outside the header: a blurred (backdrop-filter) header would trap a fixed bottom bar. */}
      <nav className="nav glass" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}>
            <span className="nav-icon" aria-hidden>
              {n.icon}
            </span>
            <span className="nav-label">{n.label}</span>
          </NavLink>
        ))}
      </nav>
      {!online && <div className="offline">You're offline — showing saved and cached articles.</div>}
      <main className="main">
        {/* Keyed by route so each page fades in. */}
        <div className="page" key={pathname}>
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/article/*" element={<ArticlePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
