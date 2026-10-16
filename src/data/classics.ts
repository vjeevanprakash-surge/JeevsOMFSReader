/**
 * Landmark papers every OMFS trainee should know: a starter list to curate.
 * Every PMID was checked against PubMed (title, authors, journal, year) on 2026-10-16.
 * To add one: find its PMID on pubmed.ncbi.nlm.nih.gov and add an entry under the right section.
 */
export interface Classic {
  pmid: string;
  /** One line on why it matters. */
  why: string;
}

export interface ClassicSection {
  title: string;
  papers: Classic[];
}

export const CLASSICS: ClassicSection[] = [
  {
    title: 'Trauma',
    papers: [
      { pmid: '274501', why: 'Champy et al.: monocortical miniplate fixation along the ideal lines of osteosynthesis.' },
      { pmid: '3856795', why: 'Ellis et al.: ten years and 2,137 mandibular fractures — the classic epidemiology.' },
      { pmid: '12553928', why: 'Gassner et al.: 9,543 cranio-maxillofacial trauma cases, their causes and injury patterns.' },
    ],
  },
  {
    title: 'Orthognathic and distraction',
    papers: [
      { pmid: '13441284', why: 'Trauner and Obwegeser: the paper that introduced the sagittal split osteotomy.' },
      { pmid: '1054396', why: 'Bell et al.: bone healing and blood supply after maxillary osteotomy — the biology behind the Le Fort I.' },
      { pmid: '1727238', why: 'McCarthy et al.: the first distraction osteogenesis of the human mandible.' },
    ],
  },
  {
    title: 'Head and neck oncology',
    papers: [
      { pmid: '2221244', why: 'Shah: predictable patterns of neck node spread, the basis for selective neck dissection.' },
      { pmid: '12117328', why: 'Robbins et al.: the neck dissection classification and levels in use today.' },
      { pmid: '28128848', why: 'Lydiatt et al.: AJCC 8th edition changes, including depth of invasion for oral cancer.' },
    ],
  },
  {
    title: 'Reconstruction and implants',
    papers: [
      { pmid: '2734406', why: 'Hidalgo: the fibula free flap for mandibular reconstruction.' },
      { pmid: '356184', why: 'Brånemark et al.: ten years of osseointegrated implants in the edentulous jaw.' },
      { pmid: '3527955', why: 'Albrektsson et al.: the criteria for implant success.' },
    ],
  },
  {
    title: 'Temporomandibular joint',
    papers: [
      { pmid: '2923691', why: 'Wilkes: the staging of TMJ internal derangement.' },
      { pmid: '1941330', why: 'Nitzan et al.: TMJ arthrocentesis for severe limited mouth opening.' },
      { pmid: '24482784', why: 'Schiffman et al.: the DC/TMD diagnostic criteria.' },
    ],
  },
  {
    title: 'Medication-related osteonecrosis',
    papers: [
      { pmid: '12966493', why: 'Marx: the first large report of bisphosphonate-related necrosis of the jaws.' },
      { pmid: '35300956', why: 'Ruggiero et al.: the AAOMS 2022 position paper on MRONJ — definitions, staging, management.' },
    ],
  },
  {
    title: 'Cleft and dentoalveolar',
    papers: [
      { pmid: '14140821', why: 'Millard: the rotation-advancement principle in cleft lip repair.' },
      { pmid: '4550446', why: 'Boyne and Sands: secondary bone grafting of alveolar clefts.' },
      { pmid: '1569360', why: 'Mercier and Precious: risks and benefits of removing impacted third molars.' },
    ],
  },
];
