export type Region =
  | 'USA'
  | 'UK'
  | 'Europe'
  | 'India'
  | 'Korea'
  | 'Japan'
  | 'China'
  | 'Asia'
  | 'Australia'
  | 'Canada'
  | 'Latin America'
  | 'Middle East';

/** Journal groupings (data/specialties.ts). */
export type SpecialtyId = 'omfs' | 'headneck' | 'facial' | 'evidence';

export interface Journal {
  id: string;
  name: string;
  abbr: string;
  region: Region;
  /** Print and/or electronic ISSNs (older titles of renamed journals included). */
  issns: string[];
  /** Where articles come from. Crossref is used for journals with no PubMed records. */
  source: 'pubmed' | 'crossref';
  /** Home specialty; default OMFS. */
  specialty?: SpecialtyId;
  /** Publishes a lot outside its specialty: results are AND-ed with that specialty's relevance filter. */
  broad?: boolean;
  /** % of the journal's 2025 articles that are free to read (see journals.ts). ≥ 95 = every article free. */
  freePct: number;
  /** PubMed falls months behind on it: recent papers are filled in from Crossref (see lib/gap.ts). */
  pubmedLag?: boolean;
  /** Stopped publishing (or registering papers): the year of its last ones. Kept for its archive. */
  lastPapers?: number;
}

export interface Author {
  last: string;
  first: string;
  initials: string;
}

export interface Article {
  /** `pmid:123` or `doi:10.x/y` */
  id: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  abstract: string;
  authors: Author[];
  journalId: string;
  journalTitle: string;
  journalAbbr: string;
  volume?: string;
  issue?: string;
  pages?: string;
  /** ISO date, YYYY-MM-DD (day/month default to 01 when unknown). */
  pubDate: string;
  /** ISO date the article was added to the index (PubMed entrez / Crossref created). Used for sorting and "New". */
  addedDate: string;
  year: number;
  keywords: string[];
  topics: string[];
  /** Strongest study type detected (see data/studyTypes.ts); absent = not identified. */
  studyType?: string;
  isOpenAccess: boolean;
  /** Direct PDF link (opens in a new tab). */
  pdfUrl?: string;
  /** Epoch ms when this device first saw the article. */
  firstSeen?: number;
}

export interface ArticleQuery {
  /** Specialty view; default OMFS. 'all' = every journal. Ignored when journals are named. */
  specialty?: SpecialtyId | 'all';
  regions?: Region[];
  journalIds?: string[];
  topic?: string;
  yearFrom?: number;
  yearTo?: number;
  keyword?: string;
  author?: string;
  /** Only articles that are free to read. */
  freeOnly?: boolean;
  /** Study type id (data/studyTypes.ts). */
  studyType?: string;
  /** Search order; default newest. */
  sort?: 'newest' | 'relevance';
  page: number;
}

export interface QueryResult {
  articles: Article[];
  total: number;
  /** Per-journal or per-source failures, shown without hiding other results. */
  errors: string[];
  hasMore: boolean;
}
