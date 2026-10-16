import { useEffect, useState } from 'react';
import { journalById, REGIONS } from '../data/journals';
import { STUDY_TYPES } from '../data/studyTypes';
import { OTHER_TOPIC, TOPICS } from '../data/topics';
import { allArticles, bookmarkedArticles, pdfIds } from '../lib/db';
import type { Article } from '../lib/types';

function count<T extends string | number>(items: T[]) {
  const m = new Map<T, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return m;
}

function Bars({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length ? (
        <ul className="bars">
          {rows.map(([label, n]) => (
            <li key={label}>
              <span className="bar-label">{label}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="bar-value">{n}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No data yet.</p>
      )}
    </section>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<{ all: Article[]; saved: Article[]; pdfs: number } | null>(null);
  const [scope, setScope] = useState<'all' | 'saved'>('all');

  useEffect(() => {
    Promise.all([allArticles(), bookmarkedArticles(), pdfIds()])
      .then(([all, saved, pdfs]) => setData({ all, saved, pdfs: pdfs.length }))
      .catch(() => setData({ all: [], saved: [], pdfs: 0 }));
  }, []);

  if (!data) return <p className="empty">Loading…</p>;
  const items = scope === 'all' ? data.all : data.saved;
  const oa = items.filter((a) => a.isOpenAccess).length;
  const regions = count(items.map((a) => journalById(a.journalId)?.region ?? 'Other'));
  const topics = count(items.flatMap((a) => a.topics));
  const types = count(items.map((a) => a.studyType ?? 'other'));
  const years = count(items.map((a) => a.year));
  const journals = count(items.map((a) => a.journalAbbr));

  return (
    <>
      <div className="page-head">
        <h1>Stats</h1>
        <div className="seg" role="group" aria-label="Scope">
          <button type="button" className={scope === 'all' ? 'active' : ''} aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
            All viewed
          </button>
          <button type="button" className={scope === 'saved' ? 'active' : ''} aria-pressed={scope === 'saved'} onClick={() => setScope('saved')}>
            Saved
          </button>
        </div>
      </div>
      <div className="tiles">
        <div className="tile">
          <span className="tile-value">{data.all.length}</span>
          <span className="tile-label">Articles viewed on this device</span>
        </div>
        <div className="tile">
          <span className="tile-value">{data.saved.length}</span>
          <span className="tile-label">Saved</span>
        </div>
        <div className="tile tile-free">
          <span className="tile-value">{items.length ? Math.round((oa / items.length) * 100) : 0}%</span>
          <span className="tile-label">Open access ({oa} of {items.length})</span>
        </div>
        <div className="tile">
          <span className="tile-value">{data.pdfs}</span>
          <span className="tile-label">PDFs offline</span>
        </div>
      </div>
      <div className="panels">
        <Bars title="By region" rows={REGIONS.filter((r) => regions.has(r)).map((r) => [r, regions.get(r)!])} />
        <Bars
          title="By topic"
          rows={[...TOPICS.map((t) => t.label), OTHER_TOPIC].filter((t) => topics.has(t)).map((t) => [t, topics.get(t)!])}
        />
        <Bars
          title="By study type"
          rows={[...STUDY_TYPES.map((t) => [t.id, t.label]), ['other', 'Other / not stated']].filter(([id]) => types.has(id)).map(([id, label]) => [label, types.get(id)!])}
        />
        <Bars title="By year" rows={[...years].sort((a, b) => b[0] - a[0]).slice(0, 12).map(([y, n]) => [String(y), n])} />
        <Bars title="Top journals" rows={[...journals].sort((a, b) => b[1] - a[1]).slice(0, 10)} />
      </div>
    </>
  );
}
