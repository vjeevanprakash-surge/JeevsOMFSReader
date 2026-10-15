# JeevsOMFSReader

An installable web app (PWA) for Oral & Maxillofacial Surgery research. It pulls articles live from
**PubMed** (matched by journal ISSN), checks open-access status and PDFs with **Europe PMC**, and uses
**Crossref** for journals that PubMed doesn't index. It has no server of its own: everything runs in the
browser and is saved on the device.

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
(results are then limited to OMFS-relevant articles), and `openAccess: true` if it's listed in DOAJ.

## Offline PDFs and hosting

Open-access PDFs come from PMC's open data on AWS, which doesn't allow direct browser downloads. A tiny proxy
([`proxy/`](proxy/)) fixes that. In `npm run dev` / `npm run preview` it's built in. When hosting the app
elsewhere (GitHub Pages, Netlify…), deploy the proxy as a free Cloudflare Worker:

```bash
cd proxy && npx wrangler deploy
```

then paste the worker's URL into **Settings → PDF proxy URL**. Without a proxy, PDFs still open online in a new tab.

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
