import { useEffect, useState } from 'react';
import { journalById, REGIONS, specialtyOf } from '../data/journals';
import { SPECIALTIES } from '../data/specialties';
import { STUDY_TYPES } from '../data/studyTypes';
import { OTHER_TOPIC, TOPICS } from '../data/topics';
import { Link } from 'react-router-dom';
import { allArticles, allReads, bookmarkedArticles, pdfIds } from '../lib/db';
import { readingStats, type ReadingStats } from '../lib/reads';
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

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });

/** Streak, today and the last 7 days: papers opened (10 s on the page), read in the app, or opened from Shorts. */
function ReadingPanel({ r }: { r: ReadingStats }) {
  const max = Math.max(1, ...r.week.map((d) => d.count));
  return (
    <section className="panel reading" aria-labelledby="reading-title">
      <h2 id="reading-title">Your reading</h2>
      <div className="reading-row">
        <div className="reading-streak">
          <span className="tile-value">{r.streak ? `🔥 ${r.streak}` : '0'}</span>
          <span className="tile-label">day streak</span>
        </div>
        <div>
          <span className="tile-value">{r.today}</span>
          <span className="tile-label">read today</span>
        </div>
        <div>
          <span className="tile-value">{r.total}</span>
          <span className="tile-label">read in all</span>
        </div>
        <ol className="week" aria-label="Papers read in the last 7 days">
          {r.week.map((d) => (
            <li key={d.day} title={`${new Date(d.day).toDateString()}: ${d.count}`}>
              <span className="week-bar" style={{ height: `${(d.count / max) * 100}%` }} />
              <span className="week-day">{WEEKDAY.format(d.day)}</span>
            </li>
          ))}
        </ol>
      </div>
      {!r.total && (
        <p className="muted">
          Papers you open count here. Try <Link to="/shorts">Shorts</Link> for three minutes of new evidence.
        </p>
      )}
    </section>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<{ all: Article[]; saved: Article[]; pdfs: number; reading: ReadingStats } | null>(null);
  const [scope, setScope] = useState<'all' | 'saved'>('all');

  useEffect(() => {
    Promise.all([allArticles(), bookmarkedArticles(), pdfIds(), allReads()])
      .then(([all, saved, pdfs, reads]) => setData({ all, saved, pdfs: pdfs.length, reading: readingStats(reads) }))
      .catch(() => setData({ all: [], saved: [], pdfs: 0, reading: readingStats([]) }));
  }, []);

  if (!data) return <p className="empty">Loading…</p>;
  const items = scope === 'all' ? data.all : data.saved;
  const oa = items.filter((a) => a.isOpenAccess).length;
  const specialties = count(items.map((a) => { const j = journalById(a.journalId); return j ? specialtyOf(j) : 'omfs'; }));
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
      <ReadingPanel r={data.reading} />
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
        <Bars title="By specialty" rows={SPECIALTIES.filter((s) => specialties.has(s.id)).map((s) => [s.label, specialties.get(s.id)!])} />
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
