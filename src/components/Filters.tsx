import { JOURNALS, REGIONS } from '../data/journals';
import { TOPICS } from '../data/topics';
import type { Region } from '../lib/types';

export interface FilterState {
  region: Region | '';
  journal: string;
  topic: string;
  yearFrom: string;
  yearTo: string;
}

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => String(THIS_YEAR - i));

export default function Filters({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });
  const journals = JOURNALS.filter((j) => !value.region || j.region === value.region);

  return (
    <div className="filters">
      <div className="region-chips" role="group" aria-label="Region">
        {(['', ...REGIONS] as const).map((r) => (
          <button
            key={r || 'all'}
            type="button"
            className={`chip-btn ${value.region === r ? 'active' : ''}`}
            aria-pressed={value.region === r}
            onClick={() => set({ region: r, journal: '' })}
          >
            {r || 'All regions'}
          </button>
        ))}
      </div>
      <div className="filter-row">
        <label>
          Journal
          <select value={value.journal} onChange={(e) => set({ journal: e.target.value })}>
            <option value="">All journals ({journals.length})</option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <select value={value.topic} onChange={(e) => set({ topic: e.target.value })}>
            <option value="">All topics</option>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <select value={value.yearFrom} onChange={(e) => set({ yearFrom: e.target.value })}>
            <option value="">Any</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <label>
          To
          <select value={value.yearTo} onChange={(e) => set({ yearTo: e.target.value })}>
            <option value="">Any</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

/** Reads/writes filter state from URL search params so Back keeps the filters. */
export function filtersFromParams(p: URLSearchParams): FilterState {
  return {
    region: (p.get('region') ?? '') as Region | '',
    journal: p.get('journal') ?? '',
    topic: p.get('topic') ?? '',
    yearFrom: p.get('from') ?? '',
    yearTo: p.get('to') ?? '',
  };
}

export function filtersToParams(f: FilterState, extra: Record<string, string> = {}) {
  const entries = { region: f.region, journal: f.journal, topic: f.topic, from: f.yearFrom, to: f.yearTo, ...extra };
  return new URLSearchParams(Object.entries(entries).filter(([, v]) => v) as [string, string][]);
}

export function filtersToQuery(f: FilterState) {
  return {
    regions: f.region ? [f.region] : undefined,
    journalIds: f.journal ? [f.journal] : undefined,
    topic: f.topic || undefined,
    yearFrom: f.yearFrom ? Number(f.yearFrom) : undefined,
    yearTo: f.yearTo ? Number(f.yearTo) : undefined,
  };
}
