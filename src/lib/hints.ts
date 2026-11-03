/** Whether the Shorts tour has been shown on this device. */
const KEY = 'omfs-shorts-hints';

export function hintsSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === 'seen';
  } catch {
    return true; // can't remember it: don't show it on every visit
  }
}

export function markHintsSeen() {
  try {
    localStorage.setItem(KEY, 'seen');
  } catch {
    // Private mode.
  }
}

export function resetHints() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Private mode.
  }
}
