# OMFS Reader — Design

Browser-only React + Vite PWA that aggregates Oral & Maxillofacial Surgery articles.

## Sources
| Source | Used for | CORS |
|---|---|---|
| NCBI E-utilities (`esearch`, `efetch`) | Article search + metadata for PubMed-indexed journals, filtered by ISSN | yes |
| Europe PMC REST (`search`, `resultType=core`) | Open-access status, PMCID, PDF availability, by PMID | yes |
| Crossref REST (`/works?filter=issn:…`) | Journals with no PubMed records | yes |
| PMC Open Data on AWS (`pmc-oa-opendata` S3) | OA PDFs for offline caching | **no** → via PDF proxy |

PDF proxy: `GET /pdf/PMCxxxx` lists `PMCxxxx.` versions in the bucket, streams the latest
`PMCxxxx.N/PMCxxxx.N.pdf` with `Access-Control-Allow-Origin: *`. Same handler runs as Vite dev
middleware and as a Cloudflare Worker (`proxy/`). If no proxy URL is configured, the PDF opens in a new tab.

## Journal registry (`src/data/journals.ts`)
Each entry: `name, abbr, region, issns[], source ('pubmed' | 'crossref'), broad?, freePct`.
ISSNs verified against the NLM catalog and live PubMed counts on 2026-10-15. `freePct` = share of 2025 articles
free to read (PubMed `free full text[sb]`; Crossref: CC licence). Tiers: ≥ 95 Free to read, ≥ 20 Partly free,
else Mostly subscription; journal menus list free journals first.

**Free first (added after launch feedback):** the app is for postgraduates, so Browse/Search default to
"Free to read only" (`free full text[sb]` on PubMed, CC-licence filter on Crossref; URL `all=1` turns it off).
In the mixed view, one extra esearch per page (`<pmids>[uid] AND free full text[sb]`) marks free articles
immediately, instead of waiting months for Europe PMC deposit. Free articles link to PMC full text, or to
the publisher's free full text when there's no PMC copy.

Free journals added for volume (all 100% free, OMFS-filtered): BMC Oral Health, Dentistry Journal,
J Clin Exp Dent, Clin Exp Dent Res, Int J Surg Case Rep, Front Dent Med, Imaging Sci Dent, Int J Oral Sci (China).

- `broad` journals (Oral Oncol, Oral Dis, Clin Oral Investig, Quintessence Int, Aust Dent J, J Can Dent Assoc,
  Head Neck, JAMA Otolaryngol, PRS Global Open, Microsurgery, J Reconstr Microsurg, ANZ J Surg, Indian J Plast Surg,
  Facial Plast Surg Aesthet Med, J Craniofac Surg) are AND-ed with an OMFS relevance query.
- Crossref-sourced: Oral Surgery (BAOS), Oral Science International, Japanese J OMS, J OMS Medicine & Pathology,
  Seminars in Orthodontics, Oral Oncology Reports.
- Dropped (no records in PubMed, Europe PMC or Crossref): Oral Health and Dental Management,
  China Journal of OMS, "Australasian Journal of OMS" (no such title in NLM catalog).
- European J Oral Implantol → renamed Int J Oral Implantol (2019); both ISSN pairs kept.

## Query model
One `ArticleQuery { regions?, journalIds?, topic?, yearFrom?, yearTo?, keyword?, author?, page }`.
- PubMed: `(issn[is] OR …) AND (relevance if broad) AND topicQuery AND yearFrom:yearTo[dp] AND kw[tiab] AND au[au]`,
  default sort (most recently added), 20 per page; `efetch` XML parsed with DOMParser.
- Crossref: one `/works` request with repeated `issn:` filters (OR-ed), `type:journal-article`, sorted by `created`;
  front matter (editorial board, ToC, newsletters…) and author-less items dropped; topic filtered locally.
- Results merged and sorted by **added date** (PubMed entrez date / Crossref created), so future-dated issues
  don't jump ahead; citations still use the issue date. Enriched with Europe PMC OA info (one call per page).
- Rate limits: NCBI 3/s (10/s with an optional API key); Crossref public pool 1/s, concurrency 1 (requests are
  queued 1.1 s apart; a network TypeError — how a CORS-less 429 appears — is retried).
  No email is sent unless the user enters one in Settings.
- Each query's last result is stored (IndexedDB `queries`) and shown immediately on the next visit while fresh
  results load (repeat visits render in ~150 ms; also covers offline).

## Topics (`src/data/topics.ts`)
Trauma, Orthognathic, Oncology, Implants, TMJ, Cleft & Craniofacial, Reconstruction, Dentoalveolar,
Infection, Pathology, Imaging & 3D, Anaesthesia & Sedation. Each has a PubMed query (MeSH + tiab) and local
keywords for labelling. Labelling scores keyword hits (title 3, keywords/MeSH 2, abstract 1), needs ≥ 3,
keeps the top 3; unmatched → "Other".

## Storage (IndexedDB via `idb`)
`articles` (cache + `firstSeen`), `bookmarks`, `pdfs` (Blob), `queries` (last result per query).
Settings (API key, email, PDF proxy URL) live in localStorage.

## UI
Routes: Browse (`/`), Search, Article (`/article/:id`), Saved, Stats, Settings.
- Card: OA → frosted green glass + "Free PDF"; subscription → blue + padlock, DOI link.
- "New" badge: added to PubMed/Crossref ≤ 30 days ago **and** first seen on this device ≤ 7 days ago
  (so a first visit doesn't mark everything new).
- Citation export: BibTeX / Vancouver → `.txt` download.
- Stats: counts by region, topic, year, OA share — over saved + cached articles.
- PWA: `vite-plugin-pwa`, app-shell precache, API responses network-first.

## Errors
Per-source failures are reported per journal without blanking results; offline → cached articles + banner;
HTTP 429 → backoff + retry.

## Testing
Vitest unit tests: PubMed XML parsing, Crossref mapping, topic classification, citation formatting, query building.
Manual verification in the browser.
