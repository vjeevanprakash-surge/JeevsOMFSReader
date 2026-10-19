/**
 * Keeps every copy of the app current: open tabs, and installed home-screen apps on phones and
 * computers (they run from the same sites, so they share this service worker).
 *
 * - Checks for a new version on start, whenever the app comes back to the screen or back online,
 *   on in-app navigation (at most once a minute) and every 10 minutes while open.
 * - A new version installs in the background and takes over at once (skipWaiting/clientsClaim in
 *   vite.config.ts). The page then switches to it when that can't interrupt anyone: straight away
 *   if the app was only just opened or is in the background, otherwise on the next in-app
 *   navigation, the next time it leaves the screen, or when "Update" is tapped on the notice.
 *   (A page left on the old version keeps working: the app is one bundle, already loaded.)
 */
const CHECK_EVERY_MS = 10 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000;
const FRESH_MS = 15 * 1000;

let registration: ServiceWorkerRegistration | undefined;
let lastCheck = 0;
let pending = false;
const listeners = new Set<() => void>();

export const updatePending = () => pending;
export function onUpdatePending(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
export const applyUpdate = () => window.location.reload();

/** Called on every route change: a waiting update is applied then, between pages. */
export function onNavigate() {
  if (pending) applyUpdate();
  else check();
}

function check(force = false) {
  if (!registration || !navigator.onLine) return;
  if (!force && Date.now() - lastCheck < MIN_GAP_MS) return;
  lastCheck = Date.now();
  registration.update().catch(() => undefined);
}

function newVersionReady() {
  if (document.visibilityState === 'hidden' || performance.now() < FRESH_MS) return applyUpdate();
  pending = true;
  listeners.forEach((fn) => fn());
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // The first take-over of an uncontrolled page is the first install, not an update.
  let controlled = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controlled) newVersionReady();
    controlled = true;
  });
  navigator.serviceWorker
    .register('./sw.js', { scope: './' })
    .then((r) => {
      registration = r;
      lastCheck = Date.now(); // registering just checked
    })
    .catch(() => undefined);

  setInterval(() => document.visibilityState === 'visible' && check(true), CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check(true);
    else if (pending) applyUpdate(); // switch while nobody is looking
  });
  window.addEventListener('online', () => check(true));
}
