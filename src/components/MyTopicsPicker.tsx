import { useState } from 'react';
import { TOPICS } from '../data/topics';
import { getMyTopics, setMyTopics } from '../lib/mytopics';

/** Toggle chips for the topics the reader follows. Saved on this device as they change. */
export default function MyTopicsPicker() {
  const [mine, setMine] = useState(getMyTopics);
  const toggle = (id: string) => {
    const next = mine.includes(id) ? mine.filter((x) => x !== id) : [...mine, id];
    setMine(next);
    setMyTopics(next);
  };
  return (
    <div className="specialty-chips" role="group" aria-label="My topics">
      {TOPICS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`chip-btn ${mine.includes(t.id) ? 'active' : ''}`}
          aria-pressed={mine.includes(t.id)}
          onClick={() => toggle(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
