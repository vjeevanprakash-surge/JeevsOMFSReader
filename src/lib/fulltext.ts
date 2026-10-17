import { getFullTextDoc, saveFullTextDoc } from './db';
import { limitedFetch } from './http';
import { proxyBase } from './pdf';

/**
 * Full text of open-access papers for in-app reading. Europe PMC serves the article as JATS XML;
 * it is reduced here to a small, plain structure (no HTML is ever injected into the page) and kept
 * on the device so a paper opened once can be read again offline.
 */

export type Inline =
  | string
  | { t: 'i' | 'b' | 'sup' | 'sub' | 'u' | 'sc' | 'code'; c: Inline[] }
  | { t: 'a'; href: string; c: Inline[] }
  /** A citation or a pointer to a figure/table: `rid` is the target's id. */
  | { t: 'xref'; kind: string; rid: string; c: Inline[] };

export interface Cell {
  head: boolean;
  colSpan?: number;
  rowSpan?: number;
  c: Inline[];
}

export type Block =
  | { t: 'p'; c: Inline[] }
  | { t: 'list'; ordered: boolean; items: Block[][] }
  | { t: 'quote'; c: Block[] }
  | { t: 'box'; title: string; c: Block[] }
  | { t: 'formula'; text: string }
  | { t: 'fig'; id: string; label: string; caption: Block[]; src?: string }
  | { t: 'table'; id: string; label: string; caption: Block[]; rows: Cell[][]; src?: string; foot: Block[] };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
  children: Section[];
}

export interface Reference {
  id: string;
  label: string;
  text: string;
  pmid?: string;
  doi?: string;
}

export interface FullText {
  /** Parser version: stored copies from an older parser are fetched again. */
  v: number;
  pmcid: string;
  sections: Section[];
  references: Reference[];
}

const API = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const PARSER_VERSION = 1;

/** From device storage, else fetched from Europe PMC and stored. Throws `NotAvailable` when there is none. */
export async function loadFullText(articleId: string, pmcid: string): Promise<FullText> {
  const saved = await getFullTextDoc(articleId).catch(() => undefined);
  if (saved?.doc.v === PARSER_VERSION) return saved.doc;
  // An older copy still beats nothing when offline.
  if (saved && !navigator.onLine) return saved.doc;
  let res: Response;
  try {
    res = await limitedFetch(`${API}/${pmcid}/fullTextXML`, 100);
  } catch (e) {
    if (/responded 404/.test((e as Error).message)) throw new NotAvailable();
    throw e;
  }
  const doc = parseFullText(await res.text(), pmcid);
  if (!doc.sections.some((s) => s.blocks.length || s.children.length)) throw new NotAvailable();
  await saveFullTextDoc(articleId, doc).catch(() => undefined);
  return doc;
}

export class NotAvailable extends Error {
  constructor() {
    super('Full text is not available to read in the app');
  }
}

// ---------------------------------------------------------------------------------------------
// JATS → FullText

const kids = (el: Element) => Array.from(el.children);
const child = (el: Element | null | undefined, name: string) => (el ? kids(el).find((c) => c.localName === name) : undefined);
const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const href = (el: Element) => el.getAttribute('xlink:href') ?? el.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ?? '';

const INLINE_TAG: Record<string, 'i' | 'b' | 'sup' | 'sub' | 'u' | 'sc' | 'code'> = {
  italic: 'i',
  bold: 'b',
  sup: 'sup',
  sub: 'sub',
  underline: 'u',
  sc: 'sc',
  monospace: 'code',
};
/** Elements that never show as text. */
const SKIP = new Set(['alt-text', 'object-id', 'label', 'graphic', 'media', 'permissions', 'attrib']);
/** Block-level elements that can appear in the middle of a paragraph. */
const BLOCK_IN_P = new Set(['fig', 'table-wrap', 'list', 'disp-formula', 'disp-quote', 'boxed-text', 'def-list', 'supplementary-material']);

export function parseFullText(xml: string, pmcid: string): FullText {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const article = doc.getElementsByTagName('article')[0] ?? doc.documentElement;
  let n = 0;
  const nextId = () => `s${++n}`;
  const imgSrc = (name: string) => (name ? `${proxyBase()}/file/${pmcid}/${encodeURIComponent(name)}` : undefined);

  const formulaText = (el: Element): string => {
    const math = Array.from(el.getElementsByTagName('*')).find((e) => e.localName === 'math');
    if (math) return clean(math.textContent ?? '');
    const tex = Array.from(el.getElementsByTagName('*')).find((e) => e.localName === 'tex-math');
    return clean(tex?.textContent ?? el.textContent ?? '');
  };

  const inlines = (el: Element): Inline[] => inlineNodes(Array.from(el.childNodes));
  const inlineNodes = (nodes: Node[]): Inline[] => {
    const out: Inline[] = [];
    for (const node of nodes) {
      if (node.nodeType === 3) {
        const text = (node.textContent ?? '').replace(/\s+/g, ' ');
        if (text) out.push(text);
        continue;
      }
      if (node.nodeType !== 1) continue;
      const e = node as Element;
      const name = e.localName;
      if (SKIP.has(name) || BLOCK_IN_P.has(name) || name === 'fn') continue;
      if (INLINE_TAG[name]) out.push({ t: INLINE_TAG[name], c: inlines(e) });
      else if (name === 'ext-link' || name === 'uri') {
        const url = href(e) || clean(e.textContent ?? '');
        const c = inlines(e);
        out.push(/^https?:\/\//i.test(url) ? { t: 'a', href: url, c } : { t: 'i', c });
      } else if (name === 'xref') {
        out.push({ t: 'xref', kind: e.getAttribute('ref-type') ?? '', rid: (e.getAttribute('rid') ?? '').split(/\s+/)[0], c: inlines(e) });
      } else if (name === 'inline-formula') out.push(formulaText(e));
      else if (name === 'break') out.push(' ');
      else out.push(...inlines(e));
    }
    return out;
  };

  const caption = (el: Element): Block[] => {
    const cap = child(el, 'caption');
    if (!cap) return [];
    const blocks: Block[] = [];
    const title = child(cap, 'title');
    if (title) blocks.push({ t: 'p', c: [{ t: 'b', c: inlines(title) }] });
    for (const p of kids(cap).filter((c) => c.localName === 'p')) blocks.push(...paragraph(p));
    return blocks;
  };
  const label = (el: Element) => clean(child(el, 'label')?.textContent ?? '');
  const firstGraphic = (el: Element) => Array.from(el.getElementsByTagName('*')).find((e) => e.localName === 'graphic');

  const tableRows = (table: Element): Cell[][] =>
    Array.from(table.getElementsByTagName('*'))
      .filter((e) => e.localName === 'tr')
      .map((tr) => {
        const inHead = tr.parentElement?.localName === 'thead';
        return kids(tr)
          .filter((c) => c.localName === 'td' || c.localName === 'th')
          .map((td) => {
            const cell: Cell = { head: inHead || td.localName === 'th', c: inlines(td) };
            const cs = Number(td.getAttribute('colspan'));
            const rs = Number(td.getAttribute('rowspan'));
            if (cs > 1) cell.colSpan = cs;
            if (rs > 1) cell.rowSpan = rs;
            return cell;
          });
      });

  const block = (el: Element): Block[] => {
    switch (el.localName) {
      case 'p':
        return paragraph(el);
      case 'list':
      case 'def-list': {
        const items = kids(el)
          .filter((c) => c.localName === 'list-item' || c.localName === 'def-item')
          .map((li) => kids(li).flatMap((c) => (c.localName === 'term' || c.localName === 'def' ? blocksOf(c) : block(c))));
        const type = el.getAttribute('list-type') ?? '';
        return [{ t: 'list', ordered: /order|alpha|roman/.test(type) && type !== 'bullet', items }];
      }
      case 'disp-quote':
        return [{ t: 'quote', c: blocksOf(el) }];
      case 'boxed-text':
        return [{ t: 'box', title: clean(child(el, 'caption')?.textContent ?? child(el, 'title')?.textContent ?? ''), c: blocksOf(el, ['caption']) }];
      case 'disp-formula': {
        const text = formulaText(el);
        return text ? [{ t: 'formula', text }] : [];
      }
      case 'fig':
        return [{ t: 'fig', id: el.getAttribute('id') ?? nextId(), label: label(el), caption: caption(el), src: imgSrc(href(firstGraphic(el) ?? el)) }];
      case 'fig-group':
        return kids(el).flatMap(block);
      case 'table-wrap': {
        const table = Array.from(el.getElementsByTagName('*')).find((e) => e.localName === 'table');
        const foot = child(el, 'table-wrap-foot');
        return [
          {
            t: 'table',
            id: el.getAttribute('id') ?? nextId(),
            label: label(el),
            caption: caption(el),
            rows: table ? tableRows(table) : [],
            // A table given only as a picture.
            src: table ? undefined : imgSrc(href(firstGraphic(el) ?? el)),
            foot: foot ? blocksOf(foot) : [],
          },
        ];
      }
      case 'supplementary-material': {
        const text = clean([label(el), child(el, 'caption')?.textContent ?? ''].join(' '));
        return text ? [{ t: 'p', c: [{ t: 'i', c: [`Supplementary material: ${text}`] }] }] : [];
      }
      case 'sec':
      case 'title':
        return [];
      default:
        return blocksOf(el);
    }
  };

  const blocksOf = (el: Element, skip: string[] = []): Block[] =>
    kids(el)
      .filter((c) => !SKIP.has(c.localName) && !skip.includes(c.localName) && c.localName !== 'title' && c.localName !== 'sec')
      .flatMap(block);

  /** A paragraph, split around any block elements nested inside it. */
  function paragraph(p: Element): Block[] {
    const out: Block[] = [];
    let run: Node[] = [];
    const flush = () => {
      const c = inlineNodes(run);
      if (c.some((x) => typeof x !== 'string' || x.trim())) out.push({ t: 'p', c: trimEnds(c) });
      run = [];
    };
    for (const node of Array.from(p.childNodes)) {
      if (node.nodeType === 1 && BLOCK_IN_P.has((node as Element).localName)) {
        flush();
        out.push(...block(node as Element));
      } else run.push(node);
    }
    flush();
    return out;
  }

  const section = (el: Element, fallbackTitle = ''): Section => ({
    id: el.getAttribute('id') ? `sec-${el.getAttribute('id')}` : nextId(),
    title: clean(child(el, 'title')?.textContent ?? '') || fallbackTitle,
    blocks: blocksOf(el),
    children: kids(el)
      .filter((c) => c.localName === 'sec')
      .map((c) => section(c)),
  });

  const sections: Section[] = [];

  // Abstract: the main one, not a graphical abstract or teaser.
  const meta = article.getElementsByTagName('article-meta')[0];
  const abstract = meta && kids(meta).find((c) => c.localName === 'abstract' && !/graphical|teaser|toc/.test(c.getAttribute('abstract-type') ?? ''));
  if (abstract) sections.push({ ...section(abstract), id: 'abstract', title: 'Abstract' });

  const body = child(article, 'body');
  if (body) {
    const loose = blocksOf(body);
    if (loose.length) sections.push({ id: nextId(), title: '', blocks: loose, children: [] });
    sections.push(...kids(body).filter((c) => c.localName === 'sec').map((c) => section(c)));
  }

  // Figures and tables kept apart from the text.
  const floats = child(article, 'floats-group');
  if (floats) {
    const blocks = kids(floats).flatMap(block);
    if (blocks.length) sections.push({ id: 'floats', title: 'Figures and tables', blocks, children: [] });
  }

  const back = child(article, 'back');
  const references: Reference[] = [];
  if (back) {
    for (const c of kids(back)) {
      if (c.localName === 'sec' || c.localName === 'app-group' || c.localName === 'app') {
        const s = section(c, c.localName === 'sec' ? '' : 'Appendix');
        if (c.localName === 'app-group') s.children.push(...kids(c).filter((a) => a.localName === 'app').map((a) => section(a)));
        if (s.blocks.length || s.children.length) sections.push(s);
      } else if (c.localName === 'ack') {
        const s = section(c, 'Acknowledgements');
        if (s.blocks.length) sections.push(s);
      } else if (c.localName === 'ref-list') {
        for (const ref of Array.from(c.getElementsByTagName('*')).filter((e) => e.localName === 'ref')) references.push(reference(ref));
      }
    }
  }
  return { v: PARSER_VERSION, pmcid, sections, references };
}

function trimEnds(run: Inline[]): Inline[] {
  const out = [...run];
  if (typeof out[0] === 'string') out[0] = out[0].trimStart();
  const last = out.length - 1;
  if (typeof out[last] === 'string') out[last] = (out[last] as string).trimEnd();
  return out.filter((x) => x !== '');
}

function reference(ref: Element): Reference {
  const all = Array.from(ref.getElementsByTagName('*'));
  const byName = (name: string) => all.find((e) => e.localName === name);
  const pubId = (type: string) =>
    clean(all.find((e) => e.localName === 'pub-id' && e.getAttribute('pub-id-type') === type)?.textContent ?? '') || undefined;
  const mixed = byName('mixed-citation');
  let text: string;
  if (mixed && clean(mixed.textContent ?? '').length > 20) {
    // Mixed citations carry their own punctuation and spacing; identifiers are shown as links instead.
    const copy = mixed.cloneNode(true) as Element;
    for (const id of Array.from(copy.getElementsByTagName('*')).filter((e) => e.localName === 'pub-id' || e.localName === 'ext-link')) id.remove();
    text = clean(copy.textContent ?? '').replace(/[\s,;]+$/, '');
  } else {
    const cite = byName('element-citation') ?? mixed ?? ref;
    const names = Array.from(cite.getElementsByTagName('*'))
      .filter((e) => e.localName === 'name')
      .map((nm) => {
        const sur = clean(Array.from(nm.children).find((x) => x.localName === 'surname')?.textContent ?? '');
        const given = clean(Array.from(nm.children).find((x) => x.localName === 'given-names')?.textContent ?? '');
        return `${sur} ${given.replace(/[^A-Z]/g, '') || given}`.trim();
      });
    const part = (name: string) => clean(Array.from(cite.getElementsByTagName('*')).find((e) => e.localName === name)?.textContent ?? '');
    const authors = names.length > 6 ? `${names.slice(0, 6).join(', ')}, et al` : names.join(', ');
    const pages = [part('fpage'), part('lpage')].filter(Boolean).join('–');
    text = [
      authors && `${authors}.`,
      part('article-title') && `${part('article-title').replace(/\.$/, '')}.`,
      part('source') && `${part('source')}.`,
      [part('year'), part('volume') && `;${part('volume')}`, pages && `:${pages}`].join('') + '.',
    ]
      .filter((x) => x && x !== '.')
      .join(' ');
  }
  return { id: ref.getAttribute('id') ?? '', label: clean(byName('label')?.textContent ?? '').replace(/\.$/, ''), text, pmid: pubId('pmid'), doi: pubId('doi') };
}

/** Plain text of inline content (for tables of contents, search, tests). */
export const inlineText = (c: Inline[]): string => c.map((x) => (typeof x === 'string' ? x : inlineText(x.c))).join('');
