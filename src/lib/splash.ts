/**
 * The splash in index.html shows from the first paint. It fades out once there is something to
 * read: Shorts' first card, or any other page as soon as it renders, and never later than MAX_MS.
 */
const MAX_MS = 2500;

let hidden = false;
export function hideSplash() {
  if (hidden) return;
  hidden = true;
  const el = document.getElementById('splash');
  if (!el) return;
  el.classList.add('is-hidden');
  setTimeout(() => el.remove(), 400);
}

setTimeout(hideSplash, Math.max(0, MAX_MS - performance.now()));
