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
    version: '1.19',
    date: '2026-11-03',
    title: 'Update news as a banner',
    changes: [
      'After each update, a slim banner under the header says what’s new, instead of a floating pill that could sit on top of the Shorts tour. It stays until you close it or open What’s new.',
    ],
  },
  {
    version: '1.18',
    date: '2026-11-03',
    title: 'Shorts fits your phone',
    changes: [
      'On phones, Shorts now fills exactly the screen between the header and the tab bar, whatever its size: a smaller title, compact specialty chips, and a long card scrolls inside itself so Skip, Save, Read and Share always stay just above the tab bar.',
      'The tour is lighter: a small tip, a softer dim, and it no longer covers the buttons it points at.',
      'The chime now plays on iPhone and Android too, on your first tap or swipe. On an iPhone with the silent switch on, web pages stay silent.',
    ],
  },
  {
    version: '1.17',
    date: '2026-11-03',
    title: 'A quick tour of Shorts, and a welcome chime',
    changes: [
      'First time on Shorts, a four-step tour shows how to swipe to the next paper, switch specialty, open the full paper and find Browse. Replay it any time from the ? next to the title.',
      'A soft chime greets you on your first tap, and a gentle note confirms a saved paper. Browsers don’t allow sound before you touch the page, so it can’t play at load.',
      'Settings → Sound and tips: switch the sounds off, or show the tour again.',
    ],
  },
  {
    version: '1.16',
    date: '2026-11-03',
    title: 'Key results you can see, and a proper welcome',
    changes: [
      'Key result charts on Shorts cards and a new Quick take panel on every paper: hazard and odds ratios as a mini forest plot that tells you whether the confidence interval crosses “no difference”, two percentages as bars, and AUC or sensitivity as a gauge. Drawn from the figures in the abstract.',
      'A branded welcome screen while the app loads, including on iPhone and Android home-screen apps.',
      'Links you share now show a Jeevs OMFS Reader preview card in WhatsApp, iMessage and LinkedIn.',
    ],
  },
  {
    version: '1.15',
    date: '2026-11-03',
    title: 'The app opens on Shorts',
    changes: [
      'Shorts is now the home page: open the app and the newest evidence is waiting, one card at a time.',
      'Browse (every journal, all filters) is the second tab. Links shared before still open where they used to.',
    ],
  },
  {
    version: '1.14',
    date: '2026-11-03',
    title: 'Shorts: the best new evidence, one card at a time',
    changes: [
      'Shorts (⚡ in the tab bar): the newest free meta-analyses, systematic reviews, trials and guidelines as cards. Each shows the authors’ conclusion in about 60 words and the key number (a hazard ratio, a percentage, the sample size). Swipe right to save, left to skip, or tap Read.',
      'Your reading on the Stats page: a daily streak, papers read today and the last 7 days. Read papers get a “✓ Read” tag.',
      'My topics (in Settings): topics you follow come first in Shorts and get one-tap filters on Browse.',
      'Share any paper from its page or from Shorts.',
      'All of this stays on your device: no account needed.',
    ],
  },
  {
    version: '1.13',
    date: '2026-10-28',
    title: 'Papers PubMed hasn’t caught up with',
    changes: [
      'PubMed can fall weeks or months behind for some journals (12 of them, including the Journal of Cranio-Maxillofacial Surgery, BMC Oral Health and Journal of Cosmetic Dermatology). For those, the app now also brings in their recent papers straight from the publisher records (Crossref), until PubMed lists them. No paper is shown twice.',
      'Settings shows which journals get this, and marks two that have stopped publishing (their back issues stay readable).',
      'On a bad connection, the list no longer stays on “Loading articles…” forever: after 45 seconds it says so and offers Try again.',
      'Peer-review reports and meeting abstracts no longer appear as papers.',
      'Behind-the-scenes updates and fixes.',
    ],
  },
  {
    version: '1.12',
    date: '2026-10-19',
    title: 'More facial plastics and aesthetic medicine',
    changes: [
      'Nine more journals in Facial Plastics: Archives of Plastic Surgery, Seminars in Plastic Surgery, Dermatologic Surgery, Journal of Cosmetic Dermatology, Journal of Clinical and Aesthetic Dermatology, Clinical, Cosmetic and Investigational Dermatology, Chinese Journal of Plastic and Reconstructive Surgery, International Journal of Trichology and Turkish Journal of Plastic Surgery (109 journals in all).',
      'JAMA Facial Plastic Surgery back issues (2013–2019) now appear under Facial Plastic Surgery & Aesthetic Medicine, its new name.',
      'Dermatology journals are narrowed to the face, head and neck; hair restoration now counts as a Facial Plastics topic.',
    ],
  },
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
