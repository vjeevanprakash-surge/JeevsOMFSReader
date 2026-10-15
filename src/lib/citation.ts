import type { Article } from './types';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Vancouver (ICMJE/NLM) style. Lists up to six authors, then "et al." */
export function toVancouver(a: Article): string {
  const names = a.authors.map((x) => `${x.last} ${x.initials}`.trim());
  const authors = names.length > 6 ? `${names.slice(0, 6).join(', ')}, et al.` : names.join(', ') + (names.length ? '.' : '');
  const month = MONTH_ABBR[Number(a.pubDate.slice(5, 7)) - 1];
  let s = `${authors} ${a.title}. ${a.journalAbbr}. ${a.year}${month ? ` ${month}` : ''}`;
  if (a.volume) s += `;${a.volume}`;
  if (a.issue) s += `(${a.issue})`;
  if (a.pages) s += `:${a.pages}`;
  s += '.';
  if (a.doi) s += ` doi:${a.doi}`;
  if (a.pmid) s += ` PMID: ${a.pmid}.`;
  return s.replace(/\s+/g, ' ').trim();
}

const bibEscape = (s: string) => s.replace(/([{}&%$#_])/g, '\\$1');

export function toBibtex(a: Article): string {
  const firstAuthor = (a.authors[0]?.last ?? 'anon').replace(/[^A-Za-z]/g, '').toLowerCase();
  const firstWord = (a.title.match(/[A-Za-z]{4,}/)?.[0] ?? 'article').toLowerCase();
  const fields: [string, string | undefined][] = [
    ['title', `{${bibEscape(a.title)}}`],
    ['author', a.authors.map((x) => `${x.last}, ${x.first || x.initials}`).join(' and ')],
    ['journal', a.journalTitle],
    ['year', String(a.year)],
    ['month', MONTH_ABBR[Number(a.pubDate.slice(5, 7)) - 1]?.toLowerCase()],
    ['volume', a.volume],
    ['number', a.issue],
    ['pages', a.pages?.replace('-', '--')],
    ['doi', a.doi],
    ['pmid', a.pmid],
  ];
  const body = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k} = {${k === 'title' ? v : bibEscape(v!)}}`)
    .join(',\n');
  return `@article{${firstAuthor}${a.year}${firstWord},\n${body}\n}`;
}

/** Downloads text as a .txt file. */
export function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
