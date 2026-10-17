import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { FullText } from './fulltext';
import type { Article } from './types';

interface OmfsDB extends DBSchema {
  articles: { key: string; value: Article };
  bookmarks: { key: string; value: { id: string; savedAt: number } };
  pdfs: { key: string; value: { id: string; blob: Blob; savedAt: number } };
  /** Last result of each query, so repeat visits (and offline use) show results instantly. */
  queries: { key: string; value: { key: string; ids: string[]; total: number; hasMore: boolean; at: number } };
  /** Full text opened in the reader, kept for offline reading. */
  fulltext: { key: string; value: { id: string; doc: FullText; savedAt: number } };
}

let dbp: Promise<IDBPDatabase<OmfsDB>> | undefined;
const db = () =>
  (dbp ??= openDB<OmfsDB>('omfs-reader', 3, {
    upgrade(d, oldVersion) {
      if (oldVersion < 1) {
        d.createObjectStore('articles', { keyPath: 'id' });
        d.createObjectStore('bookmarks', { keyPath: 'id' });
        d.createObjectStore('pdfs', { keyPath: 'id' });
      }
      if (oldVersion < 2) d.createObjectStore('queries', { keyPath: 'key' });
      if (oldVersion < 3) d.createObjectStore('fulltext', { keyPath: 'id' });
    },
  }));

/** Caches articles, keeping each one's original `firstSeen` time. Returns them with `firstSeen` set. */
export async function cacheArticles(articles: Article[]): Promise<Article[]> {
  const tx = (await db()).transaction('articles', 'readwrite');
  const now = Date.now();
  const out = await Promise.all(
    articles.map(async (a) => {
      const prev = await tx.store.get(a.id);
      const merged = { ...a, firstSeen: prev?.firstSeen ?? now };
      await tx.store.put(merged);
      return merged;
    }),
  );
  await tx.done;
  return out;
}

export const getArticle = async (id: string) => (await db()).get('articles', id);
export const allArticles = async () => (await db()).getAll('articles');

export const isBookmarked = async (id: string) => !!(await (await db()).get('bookmarks', id));
export const addBookmark = async (id: string) => (await db()).put('bookmarks', { id, savedAt: Date.now() });
export const removeBookmark = async (id: string) => (await db()).delete('bookmarks', id);

export async function bookmarkedArticles(): Promise<Article[]> {
  const d = await db();
  const marks = (await d.getAll('bookmarks')).sort((a, b) => b.savedAt - a.savedAt);
  const arts = await Promise.all(marks.map((m) => d.get('articles', m.id)));
  return arts.filter(Boolean) as Article[];
}

export const getPdf = async (id: string) => (await db()).get('pdfs', id);
export const savePdf = async (id: string, blob: Blob) => (await db()).put('pdfs', { id, blob, savedAt: Date.now() });
export const deletePdf = async (id: string) => (await db()).delete('pdfs', id);
export const pdfIds = async () => (await db()).getAllKeys('pdfs');

export const getFullTextDoc = async (id: string) => (await db()).get('fulltext', id);
export const saveFullTextDoc = async (id: string, doc: FullText) => (await db()).put('fulltext', { id, doc, savedAt: Date.now() });
export const fullTextIds = async () => (await db()).getAllKeys('fulltext');

export async function saveQueryResult(key: string, ids: string[], total: number, hasMore: boolean) {
  await (await db()).put('queries', { key, ids, total, hasMore, at: Date.now() });
}

export async function cachedQueryResult(key: string) {
  const d = await db();
  const q = await d.get('queries', key);
  if (!q) return undefined;
  const articles = (await Promise.all(q.ids.map((id) => d.get('articles', id)))).filter(Boolean) as Article[];
  return { articles, total: q.total, hasMore: q.hasMore };
}
