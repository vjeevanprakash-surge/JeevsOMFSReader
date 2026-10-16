/** Recent searches, kept on this device only (newest first, at most six). */
export interface RecentSearch {
  q: string;
  by: 'keyword' | 'author';
}

const KEY = 'omfs-recent-searches';

export const SEARCH_SHORTCUT = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl+K';
const MAX = 6;

export function getRecent(): RecentSearch[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((r) => r && typeof r.q === 'string') : [];
  } catch {
    return [];
  }
}

export function addRecent(r: RecentSearch) {
  const q = r.q.trim();
  if (!q) return;
  const rest = getRecent().filter((x) => !(x.q.toLowerCase() === q.toLowerCase() && x.by === r.by));
  try {
    localStorage.setItem(KEY, JSON.stringify([{ q, by: r.by }, ...rest].slice(0, MAX)));
  } catch {
    /* storage unavailable: nothing to remember */
  }
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const searchPath = (r: RecentSearch) => `/search?${new URLSearchParams({ q: r.q, by: r.by })}`;
