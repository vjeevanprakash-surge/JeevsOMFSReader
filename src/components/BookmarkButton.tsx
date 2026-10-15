import { useEffect, useState } from 'react';
import { addBookmark, isBookmarked, removeBookmark } from '../lib/db';

export default function BookmarkButton({ id, withLabel }: { id: string; withLabel?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    isBookmarked(id).then(setSaved).catch(() => undefined);
  }, [id]);

  const toggle = async () => {
    await (saved ? removeBookmark(id) : addBookmark(id));
    setSaved(!saved);
  };

  return (
    <button
      type="button"
      className={`bookmark ${saved ? 'is-saved' : ''}`}
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save article'}
      title={saved ? 'Remove from saved' : 'Save article'}
    >
      {saved ? '★' : '☆'}
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
