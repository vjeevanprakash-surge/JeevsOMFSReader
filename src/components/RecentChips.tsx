import type { RecentSearch } from '../lib/recent';

/** Tappable recent searches. `onPointerDown` keeps focus in the search box so the tap isn't lost to blur. */
export default function RecentChips({ items, onPick, onClear }: { items: RecentSearch[]; onPick: (r: RecentSearch) => void; onClear?: () => void }) {
  if (!items.length) return null;
  return (
    <div className="recent">
      <span className="recent-label">Recent</span>
      {items.map((r) => (
        <button
          key={`${r.by}:${r.q}`}
          type="button"
          className="chip-btn recent-chip"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onPick(r)}
        >
          {r.by === 'author' && <span className="recent-kind">Author</span>}
          {r.q}
        </button>
      ))}
      {onClear && (
        <button type="button" className="recent-clear" onPointerDown={(e) => e.preventDefault()} onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
