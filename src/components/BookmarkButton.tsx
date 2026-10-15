import { useEffect, useState } from 'react';
import { addBookmark, isBookmarked, removeBookmark } from '../lib/db';

export default function BookmarkButton({ id, withLabel }: { id: string; withLabel?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    isBookmarked(id).then(setSaved).catch(() => undefined);
  }, [id]);

  const toggle = async () => {
    await (saved ? removeBookmark(id) : addBookmark(id));
    setSaved(!saved);
    setPop(!saved);
  };

  return (
    <button
      type="button"
      className={`bookmark ${saved ? 'is-saved' : ''} ${pop ? 'pop' : ''}`}
      onClick={toggle}
      onAnimationEnd={() => setPop(false)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save article'}
      title={saved ? 'Remove from saved' : 'Save article'}
    >
      <span className="bookmark-star" aria-hidden>
        {saved ? '★' : '☆'}
      </span>
      {withLabel && <span className="bookmark-label">{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
