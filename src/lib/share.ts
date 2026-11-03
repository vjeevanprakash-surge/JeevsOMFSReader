import { articlePath } from './routes';
import type { Article } from './types';

/** This app's own link to the article, on whichever site it is running (GitHub Pages or Vercel). */
export const articleUrl = (id: string) => `${location.origin}${location.pathname}#${articlePath(id)}`;

/** The phone's share sheet where there is one; otherwise the link is copied. */
export async function shareArticle(a: Article): Promise<'shared' | 'copied' | 'failed'> {
  const url = articleUrl(a.id);
  if (navigator.share) {
    try {
      await navigator.share({ title: a.title, text: `${a.journalAbbr} · ${a.year}`, url });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'shared'; // closed the sheet: nothing to report
    }
  }
  try {
    await navigator.clipboard.writeText(`${a.title}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
