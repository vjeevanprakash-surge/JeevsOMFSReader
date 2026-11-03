import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ShareButton from '../components/ShareButton';
import StudyBadge from '../components/StudyBadge';
import { DEFAULT_SPECIALTY, SPECIALTIES } from '../data/specialties';
import { OTHER_TOPIC } from '../data/topics';
import { addBookmark, addSkip, skipIds } from '../lib/db';
import { formatDate } from '../lib/format';
import { myTopicLabels } from '../lib/mytopics';
import { runQuery } from '../lib/query';
import { quickTake, type QuickTake } from '../lib/quicktake';
import { loadReadIds, markRead } from '../lib/reads';
import { articlePath } from '../lib/routes';
import type { Article, SpecialtyId } from '../lib/types';

interface Card {
  a: Article;
  take: QuickTake;
  mine: boolean;
}

const SWIPE_PX = 90;
/** Pages tried in one go when everything on a page has been read or skipped already. */
const MAX_PAGES_PER_FILL = 3;

/**
 * The next cards: the newest free high-evidence papers in the specialty that have a quick take and
 * haven't been read, skipped or shown already. Papers in My topics come first.
 */
async function fill(spec: SpecialtyId, page: number, shown: Set<string>) {
  const [read, skipped] = await Promise.all([loadReadIds(), skipIds().catch(() => new Set<string>())]);
  const mine = myTopicLabels();
  let cards: Card[] = [];
  let hasMore = true;
  let p = page;
  for (let tries = 0; tries < MAX_PAGES_PER_FILL && !cards.length && hasMore; tries++, p++) {
    const r = await runQuery({ specialty: spec, freeOnly: true, evidence: 'high', sort: 'newest', page: p });
    if (r.errors.length && !r.articles.length) return { cards, page: p, hasMore, failed: true };
    hasMore = r.hasMore;
    cards = r.articles
      .filter((a) => !read.has(a.id) && !skipped.has(a.id) && !shown.has(a.id))
      .flatMap((a) => {
        const take = quickTake(a);
        return take ? [{ a, take, mine: a.topics.some((t) => mine.has(t)) }] : [];
      });
  }
  // Stable: within each group the newest stay first.
  cards.sort((x, y) => Number(y.mine) - Number(x.mine));
  return { cards, page: p, hasMore, failed: false };
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function ShortsPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('spec');
  const spec: SpecialtyId = SPECIALTIES.some((s) => s.id === raw) ? (raw as SpecialtyId) : DEFAULT_SPECIALTY;
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Card[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [next, setNext] = useState({ page: 0, hasMore: true });
  const [leaving, setLeaving] = useState<'left' | 'right' | null>(null);
  const [dx, setDx] = useState(0);
  const [toast, setToast] = useState('');
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; id: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fill(spec, 0, new Set()).then((r) => {
      if (cancelled) return;
      setDeck(r.cards);
      setNext({ page: r.page, hasMore: r.hasMore });
      setStatus(r.failed && !r.cards.length ? 'failed' : 'ready');
    });
    return () => {
      cancelled = true;
    };
  }, [spec]);

  const chooseSpec = (id: SpecialtyId) => {
    if (id === spec) return;
    setDeck([]);
    setStatus('loading');
    setParams(id === DEFAULT_SPECIALTY ? {} : { spec: id }, { replace: true });
  };

  const loadMore = () => {
    setStatus('loading');
    fill(spec, next.page, new Set(deck.map((c) => c.a.id))).then((r) => {
      setDeck((d) => [...d, ...r.cards]);
      setNext({ page: r.page, hasMore: r.hasMore });
      setStatus(r.failed && !r.cards.length ? 'failed' : 'ready');
    });
  };

  const current = deck[0];
  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  };
  const advance = (dir: 'left' | 'right') => {
    setLeaving(dir);
    setTimeout(
      () => {
        setDeck((d) => d.slice(1));
        setLeaving(null);
        setDx(0);
      },
      reduceMotion() ? 0 : 200,
    );
  };
  const skip = () => {
    if (!current || leaving) return;
    addSkip(current.a.id).catch(() => undefined);
    advance('left');
  };
  const save = () => {
    if (!current || leaving) return;
    addBookmark(current.a.id).catch(() => undefined);
    flash('★ Saved');
    advance('right');
  };
  const read = () => {
    if (!current) return;
    void markRead(current.a.id);
    navigate(articlePath(current.a.id), { state: { article: current.a } });
  };

  // Arrow keys: ← skip, → save, Enter opens.
  const keys = useRef({ skip, save, read });
  useEffect(() => {
    keys.current = { skip, save, read };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, button, a')) return;
      if (e.key === 'ArrowLeft') keys.current.skip();
      else if (e.key === 'ArrowRight') keys.current.save();
      else if (e.key === 'Enter') keys.current.read();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (leaving) return;
    drag.current = { x: e.clientX, id: e.pointerId };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (drag.current?.id === e.pointerId) setDx(e.clientX - drag.current.x);
  };
  const onPointerEnd = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (dx <= -SWIPE_PX) skip();
    else if (dx >= SWIPE_PX) save();
    else setDx(0);
  };

  const transform = leaving
    ? undefined
    : dx
      ? { transform: `translateX(${dx}px) rotate(${dx / 25}deg)`, transition: dragging ? 'none' : undefined }
      : undefined;

  return (
    <div className="shorts">
      <header className="page-head">
        <p className="eyebrow">Three minutes between cases</p>
        <h1>Shorts</h1>
        <p className="lede">
          The newest free meta-analyses, systematic reviews, trials and guidelines, one card at a time. Swipe right
          to save, left to skip.
        </p>
      </header>
      <div className="specialty-chips" role="group" aria-label="Specialty">
        {SPECIALTIES.map((sp) => (
          <button
            key={sp.id}
            type="button"
            className={`chip-btn ${spec === sp.id ? 'active' : ''}`}
            aria-pressed={spec === sp.id}
            onClick={() => chooseSpec(sp.id)}
          >
            {sp.label}
          </button>
        ))}
      </div>

      {current ? (
        <>
          <p className="shorts-count" aria-live="polite">
            {deck.length}
            {next.hasMore ? '+' : ''} {deck.length === 1 && !next.hasMore ? 'card' : 'cards'} left
          </p>
          <div className="short-stack">
            {deck[1] && <div className="short short-peek glass" aria-hidden />}
            <article
              key={current.a.id}
              className={`short glass ${leaving ? `leaving-${leaving}` : ''} ${dx > 40 ? 'hint-save' : dx < -40 ? 'hint-skip' : ''}`}
              style={transform}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              aria-label={current.a.title}
            >
              <span className="short-hint short-hint-save" aria-hidden>
                Save ★
              </span>
              <span className="short-hint short-hint-skip" aria-hidden>
                Skip ✕
              </span>
              <div className="card-top">
                <StudyBadge type={current.a.studyType} />
                {current.a.topics
                  .filter((t) => t !== OTHER_TOPIC)
                  .slice(0, 2)
                  .map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                {current.mine && <span className="badge-new">My topic</span>}
              </div>
              <h2 className="short-title">{current.a.title}</h2>
              {current.take.keyNumber && <p className="short-number">{current.take.keyNumber}</p>}
              <p className="short-take">{current.take.text}</p>
              <p className="short-meta">
                <span className="journal">{current.a.journalAbbr}</span> · {formatDate(current.a.pubDate)} · from the
                authors’ abstract
              </p>
            </article>
          </div>
          <div className="short-actions">
            <button type="button" className="btn" onClick={skip} aria-label="Skip (left arrow)">
              ✕ Skip
            </button>
            <button type="button" className="btn" onClick={save} aria-label="Save (right arrow)">
              ★ Save
            </button>
            <button type="button" className="btn btn-primary" onClick={read}>
              Read →
            </button>
            <ShareButton article={current.a} />
          </div>
        </>
      ) : status === 'loading' ? (
        <p className="empty">Finding the newest evidence…</p>
      ) : status === 'failed' ? (
        <div className="empty">
          <p>Couldn’t reach the journal databases. Check your connection and try again.</p>
          <button type="button" className="btn" onClick={loadMore}>
            Try again
          </button>
        </div>
      ) : (
        <div className="empty">
          <p>🎉 You’re up to date.</p>
          {next.hasMore ? (
            <button type="button" className="btn btn-primary" onClick={loadMore}>
              Load older papers
            </button>
          ) : (
            <p className="muted">Nothing new in this specialty right now.</p>
          )}
          <p>
            <Link to="/">Browse everything →</Link>
          </p>
        </div>
      )}
      {toast && (
        <div className="short-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
