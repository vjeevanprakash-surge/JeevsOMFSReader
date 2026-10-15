export type Region =
  | 'USA'
  | 'UK'
  | 'Europe'
  | 'India'
  | 'Korea'
  | 'Japan'
  | 'Asia'
  | 'Australia'
  | 'Canada';

export interface Journal {
  id: string;
  name: string;
  abbr: string;
  region: Region;
  /** Print and/or electronic ISSNs (older titles of renamed journals included). */
  issns: string[];
  /** Where articles come from. Crossref is used for journals with no PubMed records. */
  source: 'pubmed' | 'crossref';
  /** Publishes a lot outside OMFS: results are AND-ed with an OMFS relevance filter. */
  broad?: boolean;
  /** Fully open-access journal (listed in DOAJ): every article is free to read. */
  openAccess?: boolean;
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
  isOpenAccess: boolean;
  /** Direct PDF link (opens in a new tab). */
  pdfUrl?: string;
  /** Epoch ms when this device first saw the article. */
  firstSeen?: number;
}

export interface ArticleQuery {
  regions?: Region[];
  journalIds?: string[];
  topic?: string;
  yearFrom?: number;
  yearTo?: number;
  keyword?: string;
  author?: string;
  page: number;
}

export interface QueryResult {
  articles: Article[];
  total: number;
  /** Per-journal or per-source failures, shown without hiding other results. */
  errors: string[];
  hasMore: boolean;
}
