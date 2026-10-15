export interface Settings {
  /** Optional NCBI API key: raises the rate limit from 3 to 10 requests/second. */
  ncbiApiKey: string;
  /** Optional contact email sent to NCBI/Crossref as their etiquette requests. Empty = not sent. */
  contactEmail: string;
  /** Base URL of the PDF proxy (see proxy/). Empty = same origin (works in `npm run dev`). */
  pdfProxyUrl: string;
}

const KEY = 'omfs-settings';
const DEFAULTS: Settings = { ncbiApiKey: '', contactEmail: '', pdfProxyUrl: '' };

export function getSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: settings last for this session only */
  }
}
