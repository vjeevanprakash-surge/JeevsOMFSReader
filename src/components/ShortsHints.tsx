import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { markHintsSeen } from '../lib/hints';

/** A coach mark: what to point at (CSS selector) and what to say. */
interface Hint {
  target: string;
  title: string;
  text: string;
  /** Show the swipe gesture over the target. */
  swipe?: boolean;
}

const HINTS: Hint[] = [
  { target: '.short:not(.short-peek)', title: 'Swipe for the next paper', text: 'Swipe left to skip, right to save. Arrow keys work too.', swipe: true },
  { target: '.shorts .specialty-chips', title: 'Switch specialty', text: 'OMFS, Head & Neck, Facial Plastics or Evidence & Methods. Pick topics to put first in Settings.' },
  { target: '[data-hint="read"]', title: 'Read the full paper', text: 'Opens the abstract, the in-app reader for free papers, and the PDF.' },
  { target: '.nav a[href$="/browse"]', title: 'Browse everything', text: 'Every journal, with filters for region, topic, study type and year.' },
];

const PAD = 8;
/** About the height of the tip box. */
const TIP_H = 140;

/** First-visit tour of Shorts: a spotlight on each control in turn, with Next / Skip. */
export default function ShortsHints({ onDone }: { onDone: () => void }) {
  // Only the hints whose control is on screen (e.g. no Browse tab hint if the tab bar is hidden).
  const [hints] = useState(() => HINTS.filter((h) => document.querySelector(h.target)));
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const hint = hints[i];

  const finish = useCallback(() => {
    markHintsSeen();
    onDone();
  }, [onDone]);
  const next = useCallback(() => (i < hints.length - 1 ? setI(i + 1) : finish()), [i, hints.length, finish]);

  // Follow the target as the page scrolls or resizes.
  useLayoutEffect(() => {
    const el = hint && document.querySelector(hint.target);
    if (!el) return;
    el.scrollIntoView({ block: 'nearest' });
    const update = () => setRect(el.getBoundingClientRect());
    const frame = requestAnimationFrame(update);
    // Again once the card has finished sliding in.
    const settled = setTimeout(update, 450);
    el.addEventListener('animationend', update);
    // And when the layout moves it (e.g. the update banner is dismissed).
    const sized = new ResizeObserver(update);
    sized.observe(el);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      el.removeEventListener('animationend', update);
      sized.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [hint]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (e.key === 'Escape') finish();
      else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [next, finish]);

  if (!hint || !rect) return null;
  // The tip goes where it fits: below the target, else above, else inside its lower edge (a card
  // that fills a phone screen), so it never covers the tab bar or the buttons under it.
  const vh = window.innerHeight;
  const room = TIP_H + PAD + 12;
  const below = vh - rect.bottom >= room || (rect.top < room && vh - rect.bottom >= rect.top);
  const spot: CSSProperties = {
    left: rect.left - PAD,
    top: rect.top - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };
  const tip: CSSProperties = below
    ? { top: Math.min(rect.bottom + PAD + 12, vh - TIP_H - 12) }
    : rect.top >= room
      ? { bottom: vh - rect.top + PAD + 12 }
      : { bottom: Math.max(12, vh - rect.bottom + PAD + 4) };

  return (
    <div className="hints" role="dialog" aria-modal="true" aria-labelledby="hint-title" onClick={next}>
      <div className="hint-spot" style={spot}>
        {hint.swipe && (
          <span className="hint-hand" aria-hidden>
            👆
          </span>
        )}
      </div>
      <div className="hint-tip glass" style={tip} onClick={(e) => e.stopPropagation()}>
        <p className="hint-step">
          {i + 1} of {hints.length}
        </p>
        <h2 id="hint-title">{hint.title}</h2>
        <p>{hint.text}</p>
        <div className="hint-actions">
          <button type="button" className="btn" onClick={finish}>
            Skip
          </button>
          <button type="button" className="btn btn-primary" onClick={next} autoFocus>
            {i < hints.length - 1 ? 'Next' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}
