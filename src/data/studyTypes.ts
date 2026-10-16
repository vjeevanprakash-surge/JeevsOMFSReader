/**
 * Study types, strongest evidence first. PubMed tags each article with publication types; journals
 * that come from Crossref have none, so the title is used as a fallback ("…: a systematic review").
 */
export interface StudyType {
  id: string;
  label: string;
  /** Badge colour band: high = synthesised/experimental evidence, low = single cases. */
  tier: 'high' | 'mid' | 'low';
  /** PubMed query fragment for the Study type filter. */
  query: string;
  /** PubMed publication types (exact, case-insensitive) that mean this study type. */
  pubTypes: string[];
  /** Title wording that means this study type when no publication type says so. */
  title: RegExp;
}

export const STUDY_TYPES: StudyType[] = [
  {
    id: 'meta', label: 'Meta-analysis', tier: 'high',
    query: '("meta-analysis"[pt] OR meta-analys*[ti])',
    pubTypes: ['meta-analysis'], title: /meta-?analys/i,
  },
  {
    id: 'sr', label: 'Systematic review', tier: 'high',
    query: '("systematic review"[pt] OR "systematic review"[ti] OR "scoping review"[ti])',
    pubTypes: ['systematic review'], title: /systematic review|scoping review/i,
  },
  {
    id: 'rct', label: 'RCT', tier: 'high',
    query: '("randomized controlled trial"[pt] OR randomized[ti] OR randomised[ti])',
    pubTypes: ['randomized controlled trial'], title: /randomi[sz]ed/i,
  },
  {
    id: 'guideline', label: 'Guideline', tier: 'high',
    query: '(guideline[pt] OR "practice guideline"[pt] OR "consensus development conference"[pt] OR consensus[ti] OR "position paper"[ti] OR guideline*[ti])',
    pubTypes: ['guideline', 'practice guideline', 'consensus development conference'],
    title: /guideline|consensus|position paper/i,
  },
  {
    id: 'trial', label: 'Clinical trial', tier: 'mid',
    query: '("clinical trial"[pt] OR "controlled clinical trial"[pt])',
    pubTypes: ['clinical trial', 'controlled clinical trial', 'clinical trial, phase i', 'clinical trial, phase ii', 'clinical trial, phase iii', 'clinical trial, phase iv'],
    title: /clinical trial|prospective trial/i,
  },
  {
    id: 'case', label: 'Case report', tier: 'low',
    query: '("case reports"[pt] OR "case report"[ti] OR "case series"[ti])',
    pubTypes: ['case reports'], title: /case report|case series|\ba case of\b|: a case\b/i,
  },
  {
    id: 'observational', label: 'Cohort / observational', tier: 'mid',
    query: '("observational study"[pt] OR "comparative study"[pt] OR cohort[ti] OR retrospective[ti] OR prospective[ti] OR "cross-sectional"[ti] OR "case-control"[ti])',
    pubTypes: ['observational study', 'comparative study', 'multicenter study', 'evaluation study'],
    title: /cohort|retrospective|prospective|cross-sectional|case-control/i,
  },
  {
    id: 'review', label: 'Review', tier: 'mid',
    query: '(review[pt] NOT "systematic review"[pt])',
    pubTypes: ['review'], title: /\breview\b|\boverview\b/i,
  },
];

export const studyTypeById = (id?: string) => STUDY_TYPES.find((t) => t.id === id);

/**
 * PubMed filter for one study type that agrees with the badges: the type's own query, minus
 * anything that qualifies as a stronger type (e.g. RCT excludes meta-analyses of randomized trials).
 * Stronger types are excluded by publication type, plus by title for meta-analyses and systematic
 * reviews, which are often only identifiable by title.
 */
export function studyTypeQuery(id: string): string | undefined {
  const i = STUDY_TYPES.findIndex((t) => t.id === id);
  if (i < 0) return undefined;
  const stronger = STUDY_TYPES.slice(0, i).map((t) =>
    t.id === 'meta' || t.id === 'sr' ? t.query : `(${t.pubTypes.map((p) => `"${p}"[pt]`).join(' OR ')})`,
  );
  return stronger.length ? `(${STUDY_TYPES[i].query} NOT (${stronger.join(' OR ')}))` : STUDY_TYPES[i].query;
}

/** Types recognised by title even when PubMed tags them only as a generic "Review". */
const TITLE_TRUSTED = new Set(['meta', 'sr']);

/**
 * The strongest study type an article qualifies for: meta-analysis / systematic review by publication
 * type or title, then other types by publication type, then (when PubMed gives none, e.g. Crossref)
 * by title. Mirrors studyTypeQuery so a badge and the filter that found it agree.
 */
export function detectStudyType(pubTypes: string[], title: string): string | undefined {
  const pts = pubTypes.map((p) => p.toLowerCase());
  const byPt = (t: StudyType) => t.pubTypes.some((p) => pts.includes(p));
  return (
    STUDY_TYPES.find((t) => TITLE_TRUSTED.has(t.id) && (byPt(t) || t.title.test(title)))?.id ??
    STUDY_TYPES.find(byPt)?.id ??
    STUDY_TYPES.find((t) => t.title.test(title))?.id
  );
}
