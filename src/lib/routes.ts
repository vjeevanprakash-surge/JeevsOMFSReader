/**
 * Article URLs: `/article/pmid:123` or `/article/doi:10.1016/j.x.2026.1`.
 * The route is a splat (`/article/*`), so DOI slashes are fine whether or not the browser decodes the
 * hash (some, e.g. iPhone browsers, have; an encoded `%2F` that gets decoded used to break the route).
 * Only characters that would end the path (`?`, `#`, `%`, spaces…) are encoded.
 */
export const articlePath = (id: string) =>
  `/article/${encodeURIComponent(id).replace(/%2F/gi, '/').replace(/%3A/gi, ':')}`;

/** Recovers the article id from the splat, tolerating already-decoded or malformed input. */
export function parseArticleId(raw: string | undefined): string {
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw; // a literal % in an already-decoded DOI
  }
}
