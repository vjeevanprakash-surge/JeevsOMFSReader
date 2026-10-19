import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { APP_VERSION, CHANGELOG } from '../data/changelog';
import { ReleaseCard } from './ChangelogPage';
import { ACCESS_TIERS, accessTier, byFreeAccess, JOURNALS, specialtyOf } from '../data/journals';
import { specialtyLabel } from '../data/specialties';
import InstallBanner from '../components/InstallBanner';
import { DEFAULT_PDF_PROXY } from '../lib/pdf';
import { getSettings, saveSettings } from '../lib/settings';

export default function SettingsPage() {
  const [s, setS] = useState(getSettings);
  const [saved, setSaved] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    saveSettings({ ...s, ncbiApiKey: s.ncbiApiKey.trim(), contactEmail: s.contactEmail.trim(), pdfProxyUrl: s.pdfProxyUrl.trim() });
    setSaved(true);
  };
  const field = (k: keyof typeof s) => ({
    value: s[k],
    onChange: (e: { target: { value: string } }) => {
      setS({ ...s, [k]: e.target.value });
      setSaved(false);
    },
  });

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
      </div>
      <section className="whats-new" aria-labelledby="whats-new-title">
        <div className="whats-new-head">
          <h2 id="whats-new-title">What’s new</h2>
          <span className="muted">Version {APP_VERSION}</span>
        </div>
        <ReleaseCard r={CHANGELOG[0]} />
        <Link className="btn whats-new-all" to="/changelog">
          Version history ({CHANGELOG.length} versions) →
        </Link>
      </section>
      <form className="settings panel" onSubmit={submit}>
        <label>
          NCBI API key <span className="muted">(optional)</span>
          <input type="password" autoComplete="off" {...field('ncbiApiKey')} />
          <small>
            Speeds up loading (10 instead of 3 requests per second). Get one free from your{' '}
            <a href="https://www.ncbi.nlm.nih.gov/account/settings/" target="_blank" rel="noreferrer">
              NCBI account settings
            </a>
            . Stored only on this device.
          </small>
        </label>
        <label>
          Contact email <span className="muted">(optional)</span>
          <input type="email" {...field('contactEmail')} />
          <small>NCBI and Crossref ask apps to include a contact email; Crossref then allows faster requests. Leave blank to send none.</small>
        </label>
        <label>
          PDF proxy URL <span className="muted">(optional)</span>
          <input type="url" placeholder={DEFAULT_PDF_PROXY} {...field('pdfProxyUrl')} />
          <small>Offline PDFs work out of the box through the app's own proxy. Only fill this in to use a different one.</small>
        </label>
        <button type="submit" className="btn btn-primary">
          {saved ? 'Saved ✓' : 'Save settings'}
        </button>
      </form>
      <section className="panel">
        <h2>Install the app</h2>
        <InstallBanner always />
      </section>
      <section className="panel">
        <h2>Journals ({JOURNALS.length})</h2>
        {ACCESS_TIERS.map(({ tier, label }) => {
          const group = JOURNALS.filter((j) => accessTier(j) === tier).sort(byFreeAccess);
          return (
            <div key={tier}>
              <h3 className="journal-group">
                {label} ({group.length})
              </h3>
              <ul className="journal-list">
                {group.map((j) => (
                  <li key={j.id}>
                    <span>{j.name}</span>
                    <span className="muted">
                      {j.freePct}% free · {j.region} · {j.issns.join(', ')}
                      {j.source === 'crossref' && ' · via Crossref'}
                      {specialtyOf(j) !== 'omfs' && ` · ${specialtyLabel(specialtyOf(j))}`}
                      {j.broad && ` · ${specialtyLabel(specialtyOf(j))}-filtered`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <p className="muted">% free = share of 2025 articles free to read, measured October 2026.</p>
      </section>
    </>
  );
}
