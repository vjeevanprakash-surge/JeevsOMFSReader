import { useState } from 'react';
import { shareArticle } from '../lib/share';
import type { Article } from '../lib/types';

export default function ShareButton({ article, className = 'btn' }: { article: Article; className?: string }) {
  const [note, setNote] = useState('');
  const share = async () => {
    const r = await shareArticle(article);
    if (r === 'shared') return;
    setNote(r === 'copied' ? 'Link copied' : 'Couldn’t share');
    setTimeout(() => setNote(''), 2000);
  };
  return (
    <button type="button" className={className} onClick={share} aria-live="polite">
      {note || '↗ Share'}
    </button>
  );
}
