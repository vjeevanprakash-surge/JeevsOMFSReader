import { getPdf, savePdf } from './db';
import { getSettings } from './settings';
import type { Article } from './types';

/** True when the PDF can be downloaded for offline use (open access with a PMC copy). */
export const canCachePdf = (a: Article) => a.isOpenAccess && !!a.pmcid;

/**
 * Downloads the open-access PDF through the PDF proxy (PMC Open Data does not send CORS headers)
 * and stores it in IndexedDB.
 */
export async function downloadPdf(a: Article): Promise<Blob> {
  const base = getSettings().pdfProxyUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/pdf/${a.pmcid}`);
  if (!res.ok) throw new Error(res.status === 404 ? 'No PDF in the PMC open-access set' : `PDF proxy responded ${res.status}`);
  const blob = await res.blob();
  if (!blob.type.includes('pdf')) throw new Error('PDF proxy did not return a PDF');
  await savePdf(a.id, blob);
  return blob;
}

export async function openCachedPdf(id: string): Promise<boolean> {
  const rec = await getPdf(id);
  if (!rec) return false;
  window.open(URL.createObjectURL(rec.blob), '_blank', 'noopener');
  return true;
}

/**
 * "New": added to PubMed/Crossref in the last 30 days and first seen on this device in the last 7 days.
 * (Requiring a recent added date stops every article being "new" on a first visit.)
 */
export const isNew = (a: Article, now = Date.now()) => {
  const DAY = 86_400_000;
  const seenRecently = now - (a.firstSeen ?? now) <= 7 * DAY;
  const addedRecently = now - Date.parse(a.addedDate ?? a.pubDate) <= 30 * DAY;
  return seenRecently && addedRecently;
};
