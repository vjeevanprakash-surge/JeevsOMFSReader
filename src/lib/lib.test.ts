import xml from './__fixtures__/pubmed.xml?raw';
import { describe, expect, it } from 'vitest';
import { JOURNALS, journalById } from '../data/journals';
import { classify } from '../data/topics';
import { toBibtex, toVancouver } from './citation';
import { mapCrossrefWork } from './crossref';
import { isNew } from './pdf';
import { buildPubmedTerm, parsePubmedXml } from './pubmed';


describe('parsePubmedXml', () => {
  const [a] = parsePubmedXml(xml);

  it('reads identifiers from the article, not its reference list', () => {
    expect(a.pmid).toBe('42723089');
    expect(a.pmcid).toBe('PMC13560194');
    expect(a.doi).toBe('10.1186/s13005-026-00650-w');
  });

  it('maps the journal by ISSN and reads metadata', () => {
    expect(a.journalId).toBe('hfm');
    expect(a.title).toMatch(/^Evaluation of precision.*digital models$/);
    expect(a.pubDate).toBe('2026-09-09');
    expect(a.authors[0]).toEqual({ last: 'Schell', first: 'Juliana-Theresa', initials: 'JT' });
    expect(a.authors).toHaveLength(6);
    expect(a.abstract).toMatch(/^BACKGROUND: Children born/);
  });

  it('labels topics from text and MeSH', () => {
    expect(a.topics).toContain('Cleft & Craniofacial');
    expect(a.topics).toContain('Imaging & 3D');
  });
});

describe('buildPubmedTerm', () => {
  it('ANDs broad journals with the OMFS relevance filter, and adds filters', () => {
    const term = buildPubmedTerm([journalById('joms')!, journalById('oraldis')!], {
      page: 0, topic: 'tmj', yearFrom: 2024, yearTo: 2025, author: 'Smith J',
    });
    expect(term).toContain('(0278-2391[is] OR 1531-5053[is])');
    expect(term).toMatch(/\(\(1354-523X\[is\] OR 1601-0825\[is\]\) AND \("Surgery, Oral"/);
    expect(term).toContain('Temporomandibular');
    expect(term).toContain('2024:2025[dp]');
    expect(term).toContain('Smith J[au]');
  });
});

describe('mapCrossrefWork', () => {
  it('maps a Crossref work and detects CC licences as open access', () => {
    const a = mapCrossrefWork(
      {
        DOI: '10.1002/ORS.1',
        title: ['Third molar <i>surgery</i> outcomes'],
        abstract: '<jats:p>Abstract An audit.</jats:p>',
        author: [{ given: 'Anna Maria', family: 'Jones' }],
        published: { 'date-parts': [[2025, 3]] },
        license: [{ URL: 'http://creativecommons.org/licenses/by/4.0/' }],
      },
      journalById('oralsurg')!,
    );
    expect(a.id).toBe('doi:10.1002/ors.1');
    expect(a.title).toBe('Third molar surgery outcomes');
    expect(a.abstract).toBe('An audit.');
    expect(a.authors[0].initials).toBe('AM');
    expect(a.pubDate).toBe('2025-03-01');
    expect(a.isOpenAccess).toBe(true);
    expect(a.topics).toContain('Dentoalveolar');
  });
});

describe('citations', () => {
  const [a] = parsePubmedXml(xml);

  it('formats Vancouver', () => {
    expect(toVancouver(a)).toBe(
      'Schell JT, Braumann B, Kruse T, Achterrath S, Shamlian TN, Graf I. Evaluation of precision and trueness of intraoral scanners for newborns with cleft lip and palate: 3D analysis of digital models. Head Face Med. 2026 Sep;22(1):75. doi:10.1186/s13005-026-00650-w PMID: 42723089.',
    );
  });

  it('formats BibTeX', () => {
    const bib = toBibtex(a);
    expect(bib).toMatch(/^@article\{schell2026evaluation,/);
    expect(bib).toContain('author = {Schell, Juliana-Theresa and Braumann, Bert');
    expect(bib).toContain('doi = {10.1186/s13005-026-00650-w}');
  });
});

describe('isNew', () => {
  const now = Date.parse('2026-10-15');
  const base = parsePubmedXml(xml)[0];
  it('needs a recent added date and a recent first sighting', () => {
    expect(isNew({ ...base, addedDate: '2026-10-01', firstSeen: now - 86_400_000 }, now)).toBe(true);
    expect(isNew({ ...base, addedDate: '2026-01-01', firstSeen: now }, now)).toBe(false);
    expect(isNew({ ...base, addedDate: '2026-10-01', firstSeen: now - 10 * 86_400_000 }, now)).toBe(false);
  });
});

describe('registry and topics', () => {
  it('has unique ids and well-formed ISSNs', () => {
    expect(new Set(JOURNALS.map((j) => j.id)).size).toBe(JOURNALS.length);
    for (const j of JOURNALS) for (const i of j.issns) expect(i).toMatch(/^\d{4}-\d{3}[\dX]$/);
  });

  it('falls back to Other', () => {
    expect(classify({ title: 'A survey of dental students' })).toEqual(['Other']);
    expect(classify({ title: 'Mandibular fracture fixation', abstract: 'infection rates' })).toEqual(['Trauma']);
  });
});

describe('pubmed added date', () => {
  it('uses the entrez date for sorting', () => {
    expect(parsePubmedXml(xml)[0].addedDate).toBe('2026-09-11');
  });
});

describe('crossref junk filter', () => {
  it('keeps real titles that start like front matter words', async () => {
    const { JUNK_TITLE } = await import('./crossref');
    expect(JUNK_TITLE.test('Editorial Board')).toBe(true);
    expect(JUNK_TITLE.test('BAOS Newsletter')).toBe(true);
    expect(JUNK_TITLE.test('FMii --- Table of Contents')).toBe(true);
    expect(JUNK_TITLE.test('Tocilizumab in oral mucositis')).toBe(false);
    expect(JUNK_TITLE.test('Coverage of flaps')).toBe(false);
  });
});

describe('free access', () => {
  it('adds the PubMed free full text filter when freeOnly', () => {
    expect(buildPubmedTerm([journalById('joms')!], { page: 0, freeOnly: true })).toMatch(/AND free full text\[sb\]$/);
    expect(buildPubmedTerm([journalById('joms')!], { page: 0 })).not.toContain('free full text');
  });

  it('tiers journals by free share and lists free journals first', async () => {
    const { accessTier, byFreeAccess } = await import('../data/journals');
    expect(accessTier(journalById('bmcoh')!)).toBe('free');
    expect(accessTier(journalById('jmos')!)).toBe('mixed');
    expect(accessTier(journalById('joms')!)).toBe('subscription');
    expect([...JOURNALS].sort(byFreeAccess)[0].freePct).toBe(100);
  });

  it('marks every article in a fully free journal as free', () => {
    expect(parsePubmedXml(xml)[0].isOpenAccess).toBe(true); // Head & Face Medicine
  });
});

describe('article routes', () => {
  it('keeps DOI slashes readable and survives browsers that decode the hash', async () => {
    const { articlePath, parseArticleId } = await import('./routes');
    const id = 'doi:10.1016/j.oor.2026.100804';
    expect(articlePath(id)).toBe('/article/doi:10.1016/j.oor.2026.100804');
    expect(parseArticleId('doi:10.1016/j.oor.2026.100804')).toBe(id); // decoded by the browser
    expect(parseArticleId('doi%3A10.1016%2Fj.oor.2026.100804')).toBe(id); // old encoded links
    expect(parseArticleId(articlePath('doi:10.1002/(SICI)1097#x?y').slice(9))).toBe('doi:10.1002/(SICI)1097#x?y');
    expect(parseArticleId('doi:10.1/50%off')).toBe('doi:10.1/50%off'); // literal % does not throw
  });
});

describe('study types', () => {
  it('prefers PubMed publication types, strongest first', async () => {
    const { detectStudyType } = await import('../data/studyTypes');
    expect(detectStudyType(['Journal Article', 'Review', 'Systematic Review', 'Meta-Analysis'], 'x')).toBe('meta');
    expect(detectStudyType(['Journal Article', 'Randomized Controlled Trial'], 'x')).toBe('rct');
    expect(detectStudyType(['Case Reports'], 'x')).toBe('case');
    expect(detectStudyType(['Journal Article', 'Review'], 'x')).toBe('review');
    expect(detectStudyType(['Journal Article', 'Review'], 'Third molar difficulty scales: systematic review')).toBe('sr');
  });

  it('falls back to the title when there are no publication types (Crossref)', async () => {
    const { detectStudyType } = await import('../data/studyTypes');
    expect(detectStudyType([], 'Solitary bone cysts of the anterior mandible: systematic review')).toBe('sr');
    expect(detectStudyType([], 'A case of odontogenic keratocyst')).toBe('case');
    expect(detectStudyType([], 'A retrospective cohort of 300 fractures')).toBe('observational');
    expect(detectStudyType([], 'Mandibular fracture fixation')).toBeUndefined();
  });

  it('adds the study type filter to the PubMed query', () => {
    const term = buildPubmedTerm([journalById('joms')!], { page: 0, studyType: 'rct' });
    expect(term).toContain('"randomized controlled trial"[pt]');
    expect(term).toMatch(/NOT \(\("meta-analysis"\[pt\]/); // stronger types excluded, matching the badge
  });

  it('reads publication types from PubMed XML', () => {
    expect(parsePubmedXml(xml)[0].studyType).toBeUndefined(); // fixture is a "Journal Article" lab study
  });
});

describe('classics', () => {
  it('lists each PMID once, with a note', async () => {
    const { CLASSICS } = await import('../data/classics');
    const pmids = CLASSICS.flatMap((s) => s.papers.map((p) => p.pmid));
    expect(new Set(pmids).size).toBe(pmids.length);
    for (const s of CLASSICS) for (const p of s.papers) {
      expect(p.pmid).toMatch(/^\d+$/);
      expect(p.why.length).toBeGreaterThan(20);
    }
  });
});
