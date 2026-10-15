import { useState } from 'react';
import { APP_NAME } from '../data/brand';
import { useInstall } from '../lib/install';

const DISMISS_KEY = 'omfs-install-dismissed';

const dismissedRecently = () => {
  try {
    return Date.now() - Number(localStorage.getItem(DISMISS_KEY) ?? 0) < 14 * 86_400_000;
  } catch {
    return false;
  }
};

/** Invites the reader to install the app; `always` ignores a previous dismissal (Settings page). */
export default function InstallBanner({ always = false }: { always?: boolean }) {
  const { canPrompt, manualIOS, installed, promptInstall } = useInstall();
  const [hidden, setHidden] = useState(() => !always && dismissedRecently());
  const [showSteps, setShowSteps] = useState(false);

  if (installed) return always ? <p className="muted">{APP_NAME} is installed on this device.</p> : null;
  if (hidden || (!canPrompt && !manualIOS)) {
    return always ? (
      <p className="muted">
        To install, open this site in Chrome or Edge and choose <strong>Install app</strong> from the browser menu.
      </p>
    ) : null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable: hide for this visit only */
    }
    setHidden(true);
  };

  return (
    <div className="install glass" role="region" aria-label="Install the app">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} width={44} height={44} alt="" className="install-logo" />
      <div className="install-text">
        <strong>Install {APP_NAME}</strong>
        <span>One tap from your home screen, and saved articles open offline.</span>
        {manualIOS && showSteps && (
          <ol className="install-steps">
            <li>
              Tap <b>Share</b>{' '}
              <svg width="15" height="15" viewBox="0 0 24 24" aria-label="Share icon">
                <path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>{' '}
              (in Chrome it's at the top right, in Safari at the bottom).
            </li>
            <li>
              Choose <b>Add to Home Screen</b>, then <b>Add</b>.
            </li>
          </ol>
        )}
      </div>
      <div className="install-actions">
        {canPrompt ? (
          <button type="button" className="btn btn-primary" onClick={promptInstall}>
            Install
          </button>
        ) : (
          !showSteps && (
            <button type="button" className="btn btn-primary" onClick={() => setShowSteps(true)}>
              How to install
            </button>
          )
        )}
        {!always && (
          <button type="button" className="install-close" onClick={dismiss} aria-label="Not now">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
