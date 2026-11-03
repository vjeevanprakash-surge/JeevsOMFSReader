import { useEffect, useReducer } from 'react';
import { allReads, saveRead } from './db';

/** Ids of papers read on this device, loaded once and kept current by markRead. */
let ids: Set<string> | undefined;
let loading: Promise<void> | undefined;
const listeners = new Set<() => void>();
const EMPTY = new Set<string>();
const notify = () => listeners.forEach((fn) => fn());

function load() {
  return (loading ??= allReads()
    .then((r) => {
      ids = new Set([...r.map((x) => x.id), ...(ids ?? [])]);
      notify();
    })
    .catch(() => undefined));
}

export const loadReadIds = () => load().then(() => ids ?? EMPTY);

export async function markRead(id: string) {
  (ids ??= new Set()).add(id);
  notify();
  await saveRead(id).catch(() => undefined);
}

/** Re-renders when a paper is marked read. */
export function useReadIds(): Set<string> {
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    listeners.add(rerender);
    void load();
    return () => void listeners.delete(rerender);
  }, []);
  return ids ?? EMPTY;
}

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const daysAgo = (now: number, n: number) => {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n).getTime();
};

export interface ReadingStats {
  total: number;
  today: number;
  /** Consecutive days with a read, ending today (or yesterday, if nothing is read yet today). */
  streak: number;
  /** Reads per day for the last 7 days, oldest first. */
  week: { day: number; count: number }[];
}

export function readingStats(reads: { at: number }[], now = Date.now()): ReadingStats {
  const perDay = new Map<string, number>();
  for (const r of reads) perDay.set(dayKey(r.at), (perDay.get(dayKey(r.at)) ?? 0) + 1);
  const on = (n: number) => perDay.get(dayKey(daysAgo(now, n))) ?? 0;
  let streak = 0;
  for (let n = on(0) ? 0 : 1; on(n); n++) streak++;
  return {
    total: reads.length,
    today: on(0),
    streak,
    week: Array.from({ length: 7 }, (_, i) => ({ day: daysAgo(now, 6 - i), count: on(6 - i) })),
  };
}
