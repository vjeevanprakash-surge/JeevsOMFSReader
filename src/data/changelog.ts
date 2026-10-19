/**
 * What changed in each build, newest first, in plain words for readers (not developers).
 * Add an entry at the top with every release: its version becomes the app's version.
 */
export interface Release {
  version: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: Release[] = [
  {
    version: '1.11',
    date: '2026-10-19',
    title: 'Version history',
    changes: [
      'This page: every version of the app and what it changed, from the first build.',
      'After an update, a short notice tells you the new version number and links here.',
    ],
  },
  {
    version: '1.10',
    date: '2026-10-19',
    title: 'Updates arrive by themselves',
    changes: [
      'The app checks for new versions often and installs them in the background, on every device.',
      'It switches over without interrupting you: when you next change page, when the app is in the background, or from a small “New features are ready” notice.',
    ],
  },
  {
    version: '1.9',
    date: '2026-10-19',
    title: '100 journals and specialties',
    changes: [
      '18 more journals: facial plastic and aesthetic surgery, more OMFS titles, Systematic Reviews, two evidence-based dentistry journals and the Journal of Otolaryngology – Head & Neck Surgery.',
      'A Specialty filter: OMFS, Head & Neck, Facial Plastics, Evidence & Methods, or All. The app opens on OMFS.',
      'Search follows the specialty you are browsing.',
      'Reader: reference lists now show for every paper, including Springer Nature ones that were coming up empty.',
      'Keloids and scar revision now count as Facial Plastics topics.',
    ],
  },
  {
    version: '1.8',
    date: '2026-10-17',
    title: 'Read in app',
    changes: [
      'Free papers open as clean text sized for your phone: no more pinching and zooming a PDF.',
      'Contents menu to jump between sections, figures in place, tables that scroll sideways.',
      'Tap a citation number to see the reference; open cited PubMed papers in the app.',
      'Adjustable text size and a reading-progress bar.',
      'Papers you open once stay readable offline.',
    ],
  },
  {
    version: '1.7',
    date: '2026-10-17',
    title: 'Fresher and clearer',
    changes: [
      'Old copies of the app now update themselves.',
      'Plain-language messages when the journal databases can’t be reached, with a Try again button. The app retries by itself when your connection returns.',
    ],
  },
  {
    version: '1.6',
    date: '2026-10-16',
    title: 'Jeevs OMFS Reader, and help choosing what to read',
    changes: [
      'New name: Jeevs OMFS Reader.',
      'Every paper is labelled by study type: meta-analysis, systematic review, RCT, guideline, case report and more. Filter by study type too.',
      'Searches sort by most relevant (or newest, if you prefer).',
      'Classics: 20 landmark OMFS papers every trainee should read, each with a line on why it matters.',
      'Stats now include a breakdown by study type.',
    ],
  },
  {
    version: '1.5',
    date: '2026-10-16',
    title: 'Search, always at hand',
    changes: [
      'On phones, a floating search bar sits just above the tab bar.',
      'Your recent searches are remembered for one-tap repeat.',
      'On computers, Ctrl+K (⌘K on a Mac) jumps straight to search.',
    ],
  },
  {
    version: '1.4',
    date: '2026-10-15',
    title: '82 journals, a logo and an install button',
    changes: [
      '28 more journals, including Latin America and the Middle East (82 in all).',
      'A logo, the Clarity City typeface and the tagline “Rekindling the reading habit, one paper at a time.”',
      'An Install button to add the app to your home screen, with step-by-step help on iPhone.',
    ],
  },
  {
    version: '1.3',
    date: '2026-10-15',
    title: 'Offline PDFs and iPhone fix',
    changes: [
      'Save free PDFs to read offline, now on the hosted site too.',
      'Article pages no longer open blank on iPhone.',
    ],
  },
  {
    version: '1.2',
    date: '2026-10-15',
    title: 'A new look',
    changes: [
      'Frosted-glass design with subtle animations.',
      'Layouts made for phones, tablets and computers.',
    ],
  },
  {
    version: '1.1',
    date: '2026-10-15',
    title: 'Free papers first',
    changes: ['Free-to-read papers come first, so postgraduates land on articles they can actually open.'],
  },
  {
    version: '1.0',
    date: '2026-10-15',
    title: 'First version',
    changes: [
      'The latest research from 54 OMFS journals worldwide, from PubMed and Crossref.',
      'Browse by region, topic and year; search by keyword or author.',
      'Green cards for free papers, a padlock for subscription ones.',
      'Article pages with the abstract, authors and journal; citations in Vancouver and BibTeX.',
      '“New” badges, a saved list, reading stats, and offline PDF saving.',
      'Installable as an app on phones and computers.',
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
