import { topicById } from '../data/topics';

/** Topics the reader follows (ids from data/topics.ts), kept on this device only. */
const KEY = 'omfs-my-topics';

export function getMyTopics(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((id): id is string => typeof id === 'string' && !!topicById(id)) : [];
  } catch {
    return [];
  }
}

export function setMyTopics(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Private mode or storage full: the choice just isn't remembered.
  }
}

/** Labels of the followed topics, as they appear in Article.topics. */
export const myTopicLabels = () => new Set(getMyTopics().map((id) => topicById(id)!.label));
