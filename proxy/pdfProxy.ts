/**
 * Proxy for PMC Open Data on AWS (bucket `pmc-oa-opendata`), which serves open-access files
 * without CORS headers. Runs as Vite dev middleware (vite.config.ts) and as a Cloudflare Worker (worker.ts).
 *   GET /pdf/PMC1234567            → latest version's PDF
 *   GET /file/PMC1234567/fig1.jpg  → a figure image from the latest version (the extension may be
 *                                    left out, as article XML often does: the image file is found)
 */
const BUCKET = 'https://pmc-oa-opendata.s3.amazonaws.com';
const CORS = { 'Access-Control-Allow-Origin': '*' };
const IMAGE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

const notFound = (msg: string) => new Response(msg, { status: 404, headers: CORS });
const ext = (key: string) => key.slice(key.lastIndexOf('.') + 1).toLowerCase();

/** Versions are folders named PMCxxxx.1/, PMCxxxx.2/ …; returns the highest, if any. */
async function latestVersion(pmcid: string): Promise<number | undefined> {
  const xml = await (await fetch(`${BUCKET}/?list-type=2&delimiter=/&prefix=${pmcid}.`)).text();
  const versions = [...xml.matchAll(new RegExp(`<Prefix>${pmcid}\\.(\\d+)/</Prefix>`, 'g'))].map((x) => Number(x[1]));
  return versions.length ? Math.max(...versions) : undefined;
}

export function handlePdfRequest(pathname: string): Promise<Response> {
  const file = pathname.match(/^\/file\/(PMC\d+)\/([\w.-]+)$/i);
  if (file) return handleFile(file[1].toUpperCase(), file[2]);
  const pdf = pathname.match(/^\/pdf\/(PMC\d+)$/i);
  if (pdf) return handlePdf(pdf[1].toUpperCase());
  return Promise.resolve(notFound('Not found'));
}

async function handlePdf(pmcid: string): Promise<Response> {
  const v = await latestVersion(pmcid);
  if (!v) return notFound('Not in PMC open-access set');
  const pdf = await fetch(`${BUCKET}/${pmcid}.${v}/${pmcid}.${v}.pdf`);
  if (!pdf.ok) return notFound('PDF not available');
  return new Response(pdf.body, {
    headers: {
      ...CORS,
      'Content-Type': 'application/pdf',
      'Cache-Control': 'public, max-age=604800',
      'Content-Disposition': `inline; filename="${pmcid}.pdf"`,
    },
  });
}

async function handleFile(pmcid: string, name: string): Promise<Response> {
  const v = await latestVersion(pmcid);
  if (!v) return notFound('Not in PMC open-access set');
  // Images only: the exact file if it is one, else an image named `name.<ext>`.
  const xml = await (await fetch(`${BUCKET}/?list-type=2&prefix=${pmcid}.${v}/${name}`)).text();
  const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((x) => x[1]);
  const base = (k: string) => k.slice(k.lastIndexOf('/') + 1);
  const key =
    keys.find((k) => base(k) === name && IMAGE_TYPES[ext(k)]) ??
    keys.find((k) => base(k).startsWith(`${name}.`) && IMAGE_TYPES[ext(k)]);
  if (!key) return notFound('Image not found');
  const img = await fetch(`${BUCKET}/${key}`);
  if (!img.ok) return notFound('Image not available');
  return new Response(img.body, {
    headers: { ...CORS, 'Content-Type': IMAGE_TYPES[ext(key)], 'Cache-Control': 'public, max-age=2592000' },
  });
}
