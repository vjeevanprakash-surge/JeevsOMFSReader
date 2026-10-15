import { useEffect, useState } from 'react';

/**
 * Installing the app (PWA).
 * - Chrome/Edge on Android and desktop fire `beforeinstallprompt`; browsers no longer show their own
 *   prompt reliably, so we keep the event and show our own "Install" button.
 * - iPhone/iPad (every browser there is Safari underneath) never fires it: installing is manual via
 *   Share → Add to Home Screen, so we show those steps instead.
 * The listener is registered when this module loads (imported from main.tsx), because the event can
 * fire before React has rendered anything.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as BeforeInstallPromptEvent;
  notify();
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  notify();
});

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function useInstall() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  const installed = isStandalone();
  return {
    installed,
    /** The browser offered an install prompt we can show (Android, desktop Chrome/Edge). */
    canPrompt: !installed && !!deferred,
    /** Installation is manual (Share → Add to Home Screen). */
    manualIOS: !installed && isIOS(),
    async promptInstall() {
      if (!deferred) return false;
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      notify();
      return outcome === 'accepted';
    },
  };
}
