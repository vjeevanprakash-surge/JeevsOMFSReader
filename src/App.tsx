import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
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

export default function App() {
  const online = useOnline();
  return (
    <HashRouter>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            ✚
          </span>
          OMFS <span>Reader</span>
        </NavLink>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>
              <span className="nav-icon" aria-hidden>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      {!online && <div className="offline">You're offline — showing saved and cached articles.</div>}
      <main className="main">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
