/**
 * PDF proxy for PMC Open Data on AWS (bucket `pmc-oa-opendata`), which serves open-access PDFs
 * without CORS headers. `GET /pdf/PMC1234567` → latest version's PDF, with CORS enabled.
 * Runs as Vite dev middleware (vite.config.ts) and as a Cloudflare Worker (worker.ts).
 */
const BUCKET = 'https://pmc-oa-opendata.s3.amazonaws.com';
const CORS = { 'Access-Control-Allow-Origin': '*' };

export async function handlePdfRequest(pathname: string): Promise<Response> {
  const m = pathname.match(/^\/pdf\/(PMC\d+)$/i);
  if (!m) return new Response('Not found', { status: 404, headers: CORS });
  const pmcid = m[1].toUpperCase();

  // Versions are folders named PMCxxxx.1/, PMCxxxx.2/ …; pick the highest.
  const list = await fetch(`${BUCKET}/?list-type=2&delimiter=/&prefix=${pmcid}.`);
  const xml = await list.text();
  const versions = [...xml.matchAll(new RegExp(`<Prefix>${pmcid}\\.(\\d+)/</Prefix>`, 'g'))].map((x) => Number(x[1]));
  if (!versions.length) return new Response('Not in PMC open-access set', { status: 404, headers: CORS });
  const v = Math.max(...versions);

  const pdf = await fetch(`${BUCKET}/${pmcid}.${v}/${pmcid}.${v}.pdf`);
  if (!pdf.ok) return new Response('PDF not available', { status: 404, headers: CORS });
  return new Response(pdf.body, {
    headers: {
      ...CORS,
      'Content-Type': 'application/pdf',
      'Cache-Control': 'public, max-age=604800',
      'Content-Disposition': `inline; filename="${pmcid}.pdf"`,
    },
  });
}
