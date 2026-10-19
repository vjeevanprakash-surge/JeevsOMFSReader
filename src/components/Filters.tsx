import { useEffect, useRef, useState } from 'react';
import { ACCESS_TIERS, accessTier, byFreeAccess, JOURNALS, REGIONS, specialtyOf } from '../data/journals';
import { SPECIALTIES } from '../data/specialties';
import { STUDY_TYPES } from '../data/studyTypes';
import { TOPICS } from '../data/topics';
import type { FilterState } from '../lib/filters';

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => String(THIS_YEAR - i));

export default function Filters({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });
  // Phones: filters fold away so articles come first (always shown from tablet width up, see CSS).
  const [open, setOpen] = useState(false);
  // Phones show regions as a swipe row: keep the selected one in view.
  const chipsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>('.chip-btn.active');
    if (row && chip && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2 });
    }
  }, [value.region, open]);
  const active = [value.region, value.journal, value.topic, value.studyType, value.yearFrom, value.yearTo].filter(Boolean).length;
  const journals = JOURNALS.filter(
    (j) => (!value.region || j.region === value.region) && (value.specialty === 'all' || specialtyOf(j) === value.specialty),
  ).sort(byFreeAccess);

  return (
    <div className="filters">
      <label className={`free-toggle ${value.freeOnly ? 'on' : ''}`}>
        <input type="checkbox" checked={value.freeOnly} onChange={(e) => set({ freeOnly: e.target.checked })} />
        <span className="switch" aria-hidden />
        <span>
          <strong>Free to read only</strong>
          <small>{value.freeOnly ? 'Showing articles you can open in full' : 'Including subscription articles'}</small>
        </span>
      </label>
      <div className="specialty-chips" role="group" aria-label="Specialty">
        {[...SPECIALTIES, { id: 'all' as const, label: 'All' }].map((sp) => (
          <button
            key={sp.id}
            type="button"
            className={`chip-btn ${value.specialty === sp.id ? 'active' : ''}`}
            aria-pressed={value.specialty === sp.id}
            onClick={() => set({ specialty: sp.id, journal: '' })}
          >
            {sp.label}
          </button>
        ))}
      </div>
      <div className="filters-bar">
        <button type="button" className="filters-toggle" aria-expanded={open} aria-controls="filters-body" onClick={() => setOpen(!open)}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          Filters
          {active > 0 && <span className="filters-count">{active}</span>}
          <span className={`chev ${open ? 'up' : ''}`} aria-hidden>
            ▾
          </span>
        </button>
        {active > 0 && (
          <button
            type="button"
            className="filters-clear"
            onClick={() => onChange({ ...value, region: '', journal: '', topic: '', studyType: '', yearFrom: '', yearTo: '' })}
          >
            Clear
          </button>
        )}
      </div>
      <div id="filters-body" className={`filters-body ${open ? 'open' : ''}`}>
        <div className="region-chips" role="group" aria-label="Region" ref={chipsRef}>
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
              {ACCESS_TIERS.map(({ tier, label }) => {
                const group = journals.filter((j) => accessTier(j) === tier);
                return (
                  group.length > 0 && (
                    <optgroup key={tier} label={`${label} (${group.length})`}>
                      {group.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                          {tier !== 'free' ? ` — ${j.freePct}% free` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )
                );
              })}
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
            Study type
            <select value={value.studyType} onChange={(e) => set({ studyType: e.target.value })}>
              <option value="">All study types</option>
              {STUDY_TYPES.map((t) => (
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
    </div>
  );
}
