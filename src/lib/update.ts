import { registerSW } from 'virtual:pwa-register';

/**
 * Keeps installed copies current. A new version installs in the background and the page reloads
 * into it; without this, a phone could keep showing an old build until every tab was closed.
 * Also checks for a new version every 30 minutes and whenever the app comes back to the screen.
 */
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => {
      if (navigator.onLine) registration.update().catch(() => undefined);
    };
    setInterval(check, 30 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },
});
