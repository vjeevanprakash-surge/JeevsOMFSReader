# JeevsOMFSReader

An installable web app (PWA) for Oral & Maxillofacial Surgery research. It pulls articles live from
**PubMed** (matched by journal ISSN), checks open-access status and PDFs with **Europe PMC**, and uses
**Crossref** for journals that PubMed doesn't index. It has no server of its own: everything runs in the
browser and is saved on the device.

- **Free to read first**: Browse and Search show only free full-text articles by default (switch off to include
  subscription articles); journals are grouped by how much they publish free
- Browse by region, journal, topic and year; search by keyword or author
- Green frosted cards = free to read · blue cards with a padlock = subscription
- "New" badge on articles recently added to PubMed/Crossref
- Save articles (bookmarks), export citations (Vancouver / BibTeX, `.txt`)
- Save open-access PDFs for offline reading
- Stats dashboard; installable on phone home screens and desktop

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. Tests: `npm test`. Production build: `npm run build` (output in `dist/`).

## Adding a journal

Add one line to [`src/data/journals.ts`](src/data/journals.ts), with its print/electronic ISSNs and region.
Use `source: 'crossref'` if PubMed has no records for it, `broad: true` if it publishes a lot outside OMFS
(results are then limited to OMFS-relevant articles), and set `freePct` to the share of its articles that are
free to read (PubMed: `<issn>[is] AND 2025[dp] AND free full text[sb]` vs. without the filter).

## Offline PDFs and hosting

Open-access PDFs come from PMC's open data on AWS, which doesn't allow direct browser downloads. A tiny proxy
([`proxy/`](proxy/)) fixes that: it only serves PMC open-access PDFs (`/pdf/PMC…`) and nothing else.

- **Local** (`npm run dev` / `npm run preview`): built into the dev server.
- **Hosted**: deployed as a Cloudflare Worker at https://omfs-pdf-proxy.jeevs-omfs.workers.dev (free plan),
  which the app uses by default. To redeploy after changing it: `cd proxy && npx wrangler deploy`.

The app is hosted on GitHub Pages and redeploys automatically on every push to `main`.

## Optional settings

- **NCBI API key**: faster loading (10 requests/second instead of 3). Free from your NCBI account.
- **Contact email**: NCBI and Crossref ask apps to send one; Crossref then allows faster requests. Nothing is
  sent unless you enter it.

## Test

```bash
npm test
```

## License

GPL-3.0 — see [LICENSE](LICENSE).
