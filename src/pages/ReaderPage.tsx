import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { formatDate } from '../lib/format';
import { loadArticle } from '../lib/article';
import { loadFullText, NotAvailable, type Block, type FullText, type Inline, type Reference, type Section } from '../lib/fulltext';
import { articlePath, parseArticleId } from '../lib/routes';
import type { Article } from '../lib/types';

const SIZES = [0.95, 1.05, 1.15, 1.3, 1.45];
const SIZE_KEY = 'omfs-reader-size';

function readSize(): number {
  try {
    const n = Number(localStorage.getItem(SIZE_KEY));
    return Number.isInteger(n) && n >= 0 && n < SIZES.length ? n : 1;
  } catch {
    return 1;
  }
}

/** Element ids in the reader are prefixed so they never clash with the rest of the page. */
const anchor = (id: string) => `ft-${id}`;
/** Short jumps glide; long ones (across a whole paper) are instant rather than a long slow scroll. */
function jumpTo(id: string) {
  const el = document.getElementById(anchor(id));
  if (!el) return;
  const far = Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: far || still ? 'auto' : 'smooth', block: 'start' });
}

export default function ReaderPage() {
  const id = parseArticleId(useParams()['*']);
  const passed = (useLocation().state as { article?: Article } | null)?.article;
  const [article, setArticle] = useState<Article | null | undefined>(passed?.id === id ? passed : undefined);
  const [doc, setDoc] = useState<FullText | undefined>();
  const [error, setError] = useState<'none' | 'offline' | 'other' | ''>('');
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState(readSize);
  const [tocOpen, setTocOpen] = useState(false);
  const [openRef, setOpenRef] = useState<Reference | undefined>();
  const progress = useReadingProgress();

  useEffect(() => {
    if (passed?.id !== id) loadArticle(id).then((x) => setArticle(x ?? null)).catch(() => setArticle(null));
  }, [id, passed]);

  useEffect(() => {
    if (!article?.pmcid) return;
    let cancelled = false;
    loadFullText(article.id, article.pmcid)
      .then((d) => !cancelled && setDoc(d))
      .catch((e) => !cancelled && setError(e instanceof NotAvailable ? 'none' : navigator.onLine ? 'other' : 'offline'));
    return () => {
      cancelled = true;
    };
  }, [article, attempt]);

  const changeSize = (step: number) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, size + step));
    setSize(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      /* not remembered */
    }
  };

  if (article === undefined) return <p className="empty">Loading…</p>;
  if (article === null || !article.pmcid)
    return (
      <p className="empty">
        This paper can't be read in the app. <Link to={articlePath(id)}>Back to the article</Link>
      </p>
    );

  const onXref = (kind: string, rid: string) => {
    if (kind === 'bibr') {
      const ref = doc?.references.find((r) => r.id === rid);
      if (ref) setOpenRef(ref);
    } else jumpTo(rid);
  };

  return (
    <article className="reader" style={{ '--reader-size': `${SIZES[size]}rem` } as CSSProperties}>
      <div className="reader-bar glass">
        <Link className="reader-back" to={articlePath(article.id)} state={{ article }} aria-label="Back to the article">
          ←
        </Link>
        <button type="button" className="btn reader-toc-btn" onClick={() => setTocOpen(true)} disabled={!doc}>
          ☰ Contents
        </button>
        <div className="reader-size" role="group" aria-label="Text size">
          <button type="button" className="btn" onClick={() => changeSize(-1)} disabled={size === 0} aria-label="Smaller text">
            A−
          </button>
          <button type="button" className="btn" onClick={() => changeSize(1)} disabled={size === SIZES.length - 1} aria-label="Larger text">
            A+
          </button>
        </div>
        <span className="reader-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </div>

      <header className="reader-head">
        <p className="eyebrow">
          {article.journalAbbr || article.journalTitle} · {formatDate(article.pubDate)}
        </p>
        <h1>{article.title}</h1>
        <p className="reader-authors">{article.authors.map((x) => `${x.first} ${x.last}`.trim()).join(', ')}</p>
      </header>

      {!doc && !error && (
        <div className="reader-loading" aria-label="Loading the full text">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="skeleton-line" style={{ width: `${70 + ((i * 13) % 30)}%` }} />
          ))}
        </div>
      )}
      {error && (
        <div className="errors reader-error" role="status">
          <span>
            {error === 'none'
              ? "This paper's full text isn't available to read in the app. Try the PDF or the PMC page instead."
              : error === 'offline'
                ? "You're offline, and this paper hasn't been opened in the reader before. Papers you open once stay readable offline."
                : "Couldn't load the full text. Check your connection and try again."}
          </span>
          {error === 'none' ? (
            <a className="btn btn-retry" href={`https://pmc.ncbi.nlm.nih.gov/articles/${article.pmcid}/`} target="_blank" rel="noreferrer">
              Open on PMC
            </a>
          ) : (
            <button type="button" className="btn btn-retry" onClick={() => {
                setError('');
                setAttempt((n) => n + 1);
              }}>
              Try again
            </button>
          )}
        </div>
      )}

      {doc && (
        <div className="reader-body">
          {doc.sections.map((s) => (
            <SectionView key={s.id} s={s} level={2} onXref={onXref} />
          ))}
          {doc.references.length > 0 && (
            <section id={anchor('references')} className="reader-refs">
              <h2>References</h2>
              <ol>
                {doc.references.map((r, i) => (
                  <li key={r.id || i} id={r.id ? anchor(r.id) : undefined} value={Number(r.label) || undefined}>
                    <RefText r={r} />
                  </li>
                ))}
              </ol>
            </section>
          )}
          <p className="reader-source">
            Full text from Europe PMC ({doc.pmcid}). Saved on this device for offline reading.
          </p>
        </div>
      )}

      {tocOpen && doc && (
        <Sheet title="Contents" onClose={() => setTocOpen(false)}>
          <ul className="reader-toc">
            {doc.sections
              .filter((s) => s.title)
              .map((s) => (
                <li key={s.id}>
                  <TocLink s={s} close={() => setTocOpen(false)} />
                  {s.children.some((c) => c.title) && (
                    <ul>
                      {s.children
                        .filter((c) => c.title)
                        .map((c) => (
                          <li key={c.id}>
                            <TocLink s={c} close={() => setTocOpen(false)} />
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              ))}
            {doc.references.length > 0 && (
              <li>
                <TocLink s={{ id: 'references', title: 'References', blocks: [], children: [] }} close={() => setTocOpen(false)} />
              </li>
            )}
          </ul>
        </Sheet>
      )}

      {openRef && (
        <Sheet title={`Reference ${openRef.label}`} onClose={() => setOpenRef(undefined)}>
          <p className="reader-ref-text">
            <RefText r={openRef} />
          </p>
        </Sheet>
      )}
    </article>
  );
}

function TocLink({ s, close }: { s: Section; close: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        close();
        jumpTo(s.id);
      }}
    >
      {s.title}
    </button>
  );
}

function RefText({ r }: { r: Reference }) {
  return (
    <>
      {r.text}{' '}
      {r.pmid && (
        <Link className="ref-link" to={articlePath(`pmid:${r.pmid}`)}>
          Open in app
        </Link>
      )}
      {!r.pmid && r.doi && (
        <a className="ref-link" href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
          DOI
        </a>
      )}
    </>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet glass" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

type OnXref = (kind: string, rid: string) => void;

function SectionView({ s, level, onXref }: { s: Section; level: number; onXref: OnXref }) {
  const H = `h${Math.min(level, 5)}` as 'h2';
  return (
    <section id={anchor(s.id)} className="reader-section">
      {s.title && <H>{s.title}</H>}
      {s.blocks.map((b, i) => (
        <BlockView key={i} b={b} onXref={onXref} />
      ))}
      {s.children.map((c) => (
        <SectionView key={c.id} s={c} level={level + 1} onXref={onXref} />
      ))}
    </section>
  );
}

function BlockView({ b, onXref }: { b: Block; onXref: OnXref }): ReactNode {
  switch (b.t) {
    case 'p':
      return (
        <p>
          <Inlines c={b.c} onXref={onXref} />
        </p>
      );
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul';
      return (
        <L>
          {b.items.map((item, i) => (
            <li key={i}>
              {item.map((x, j) => (
                <BlockView key={j} b={x} onXref={onXref} />
              ))}
            </li>
          ))}
        </L>
      );
    }
    case 'quote':
      return (
        <blockquote>
          {b.c.map((x, i) => (
            <BlockView key={i} b={x} onXref={onXref} />
          ))}
        </blockquote>
      );
    case 'box':
      return (
        <aside className="reader-box">
          {b.title && <strong>{b.title}</strong>}
          {b.c.map((x, i) => (
            <BlockView key={i} b={x} onXref={onXref} />
          ))}
        </aside>
      );
    case 'formula':
      return <p className="reader-formula">{b.text}</p>;
    case 'fig':
      return (
        <figure id={anchor(b.id)} className="reader-fig">
          {b.src && <FigureImage src={b.src} alt={b.label || 'Figure'} />}
          <figcaption>
            {b.label && <strong>{b.label}. </strong>}
            {b.caption.map((x, i) => (
              <BlockView key={i} b={x} onXref={onXref} />
            ))}
          </figcaption>
        </figure>
      );
    case 'table':
      return (
        <figure id={anchor(b.id)} className="reader-table">
          <figcaption>
            {b.label && <strong>{b.label}. </strong>}
            {b.caption.map((x, i) => (
              <BlockView key={i} b={x} onXref={onXref} />
            ))}
          </figcaption>
          {b.rows.length > 0 ? (
            <div className="reader-table-scroll" tabIndex={0}>
              <table>
                <tbody>
                  {b.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => {
                        const C = cell.head ? 'th' : 'td';
                        return (
                          <C key={j} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>
                            <Inlines c={cell.c} onXref={onXref} />
                          </C>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            b.src && <FigureImage src={b.src} alt={b.label || 'Table'} />
          )}
          {b.foot.length > 0 && (
            <div className="reader-table-foot">
              {b.foot.map((x, i) => (
                <BlockView key={i} b={x} onXref={onXref} />
              ))}
            </div>
          )}
        </figure>
      );
  }
}

function FigureImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p className="muted reader-img-missing">Image not available{navigator.onLine ? '' : ' offline'}.</p>;
  return (
    <a href={src} target="_blank" rel="noreferrer" className="reader-img" aria-label={`${alt}, open full size`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </a>
  );
}

function Inlines({ c, onXref }: { c: Inline[]; onXref: OnXref }) {
  return (
    <>
      {c.map((x, i) => (
        <Fragment key={i}>{renderInline(x, onXref)}</Fragment>
      ))}
    </>
  );
}

function renderInline(x: Inline, onXref: OnXref): ReactNode {
  if (typeof x === 'string') return x;
  const inner = <Inlines c={x.c} onXref={onXref} />;
  switch (x.t) {
    case 'i':
      return <em>{inner}</em>;
    case 'b':
      return <strong>{inner}</strong>;
    case 'sup':
      return <sup>{inner}</sup>;
    case 'sub':
      return <sub>{inner}</sub>;
    case 'u':
      return <u>{inner}</u>;
    case 'sc':
      return <span className="smallcaps">{inner}</span>;
    case 'code':
      return <code>{inner}</code>;
    case 'a':
      return (
        <a href={x.href} target="_blank" rel="noreferrer">
          {inner}
        </a>
      );
    case 'xref':
      return x.rid ? (
        <button type="button" className={`xref xref-${x.kind || 'other'}`} onClick={() => onXref(x.kind, x.rid)}>
          {inner}
        </button>
      ) : (
        inner
      );
  }
}

/** 0–1: how far through the page the reader has scrolled. */
function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return p;
}
