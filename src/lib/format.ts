import type { Article } from './types';

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export function shortAuthors(a: Article) {
  if (!a.authors.length) return 'No authors listed';
  const first = `${a.authors[0].last} ${a.authors[0].initials}`;
  return a.authors.length > 2 ? `${first} et al.` : a.authors.map((x) => `${x.last} ${x.initials}`).join(', ');
}
