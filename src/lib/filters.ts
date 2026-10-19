import { DEFAULT_SPECIALTY, SPECIALTIES } from '../data/specialties';
import type { Region, SpecialtyId } from './types';

export interface FilterState {
  /** Specialty view: OMFS unless chosen otherwise. */
  specialty: SpecialtyId | 'all';
  region: Region | '';
  journal: string;
  topic: string;
  studyType: string;
  yearFrom: string;
  yearTo: string;
  /** On by default: postgraduates should land on articles they can actually read. */
  freeOnly: boolean;
}

/** Reads/writes filter state from URL search params so Back keeps the filters. */
export function filtersFromParams(p: URLSearchParams): FilterState {
  const spec = p.get('spec');
  return {
    specialty: spec === 'all' || SPECIALTIES.some((x) => x.id === spec) ? (spec as SpecialtyId | 'all') : DEFAULT_SPECIALTY,
    region: (p.get('region') ?? '') as Region | '',
    journal: p.get('journal') ?? '',
    topic: p.get('topic') ?? '',
    studyType: p.get('type') ?? '',
    yearFrom: p.get('from') ?? '',
    yearTo: p.get('to') ?? '',
    freeOnly: p.get('all') !== '1',
  };
}

export function filtersToParams(f: FilterState, extra: Record<string, string> = {}) {
  const entries = {
    spec: f.specialty === DEFAULT_SPECIALTY ? '' : f.specialty,
    region: f.region, journal: f.journal, topic: f.topic, type: f.studyType, from: f.yearFrom, to: f.yearTo,
    all: f.freeOnly ? '' : '1',
    ...extra,
  };
  return new URLSearchParams(Object.entries(entries).filter(([, v]) => v) as [string, string][]);
}

export function filtersToQuery(f: FilterState) {
  return {
    specialty: f.specialty === DEFAULT_SPECIALTY ? undefined : f.specialty,
    regions: f.region ? [f.region] : undefined,
    journalIds: f.journal ? [f.journal] : undefined,
    topic: f.topic || undefined,
    studyType: f.studyType || undefined,
    yearFrom: f.yearFrom ? Number(f.yearFrom) : undefined,
    yearTo: f.yearTo ? Number(f.yearTo) : undefined,
    freeOnly: f.freeOnly || undefined,
  };
}
