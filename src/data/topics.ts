export interface Topic {
  id: string;
  label: string;
  /** PubMed query fragment used when filtering by this topic. */
  query: string;
  /** Lower-case stems matched against title, abstract and keywords for labelling. */
  keywords: string[];
}

export const TOPICS: Topic[] = [
  {
    id: 'trauma', label: 'Trauma',
    query: '("Maxillofacial Injuries"[MeSH] OR "Facial Injuries"[MeSH] OR fracture*[tiab] OR trauma*[tiab])',
    keywords: ['fracture', 'trauma', 'injur', 'zygomatic', 'orbital floor', 'condylar fracture', 'mandibular fracture'],
  },
  {
    id: 'orthognathic', label: 'Orthognathic',
    query: '("Orthognathic Surgical Procedures"[MeSH] OR orthognathic[tiab] OR osteotom*[tiab] OR "dentofacial deformit*"[tiab])',
    keywords: ['orthognathic', 'osteotom', 'le fort i', 'bsso', 'sagittal split', 'genioplasty', 'dentofacial deformit', 'malocclusion'],
  },
  {
    id: 'oncology', label: 'Oncology',
    query: '("Mouth Neoplasms"[MeSH] OR "Head and Neck Neoplasms"[MeSH] OR "oral cancer"[tiab] OR carcinoma[tiab] OR tumo*[tiab])',
    keywords: ['cancer', 'carcinoma', 'neoplasm', 'tumor', 'tumour', 'oscc', 'malignan', 'neck dissection', 'metasta'],
  },
  {
    id: 'implants', label: 'Implants',
    query: '("Dental Implants"[MeSH] OR implant*[tiab] OR "sinus lift"[tiab] OR "bone graft*"[tiab])',
    keywords: ['implant', 'osseointegrat', 'sinus lift', 'sinus floor', 'peri-implant', 'zygomatic implant', 'bone graft', 'guided bone'],
  },
  {
    id: 'tmj', label: 'TMJ',
    query: '("Temporomandibular Joint Disorders"[MeSH] OR "Temporomandibular Joint"[MeSH] OR temporomandibular[tiab] OR TMJ[tiab])',
    keywords: ['temporomandibular', 'tmj', 'tmd', 'arthrocentesis', 'ankylosis', 'condyl'],
  },
  {
    id: 'cleft', label: 'Cleft & Craniofacial',
    query: '("Cleft Lip"[MeSH] OR "Cleft Palate"[MeSH] OR "Craniosynostoses"[MeSH] OR cleft[tiab] OR craniosynostosis[tiab] OR syndromic[tiab])',
    keywords: ['cleft', 'craniosynostos', 'alveolar bone graft', 'velopharyngeal', 'syndrom', 'distraction osteogenesis', 'hemifacial'],
  },
  {
    id: 'reconstruction', label: 'Reconstruction',
    query: '("Reconstructive Surgical Procedures"[MeSH] OR "Free Tissue Flaps"[MeSH] OR flap*[tiab] OR reconstruct*[tiab])',
    keywords: ['reconstruct', 'flap', 'fibula', 'microvascular', 'free tissue', 'virtual surgical planning', 'patient-specific'],
  },
  {
    id: 'dentoalveolar', label: 'Dentoalveolar',
    query: '("Tooth, Impacted"[MeSH] OR "Tooth Extraction"[MeSH] OR "third molar*"[tiab] OR extraction*[tiab] OR impacted[tiab])',
    keywords: ['third molar', 'wisdom', 'extraction', 'impacted', 'dry socket', 'alveolar osteitis', 'socket preservation', 'apicoectomy'],
  },
  {
    id: 'infection', label: 'Infection',
    query: '("Osteonecrosis"[MeSH] OR "Osteomyelitis"[MeSH] OR infection*[tiab] OR abscess[tiab] OR osteonecrosis[tiab] OR MRONJ[tiab])',
    keywords: ['infection', 'abscess', 'cellulitis', 'osteomyelitis', 'osteonecrosis', 'mronj', 'bronj', 'osteoradionecrosis', 'antibiotic'],
  },
  {
    id: 'pathology', label: 'Pathology',
    query: '("Jaw Cysts"[MeSH] OR "Odontogenic Tumors"[MeSH] OR "Mouth Diseases"[MeSH] OR cyst*[tiab] OR ameloblastoma[tiab] OR leukoplakia[tiab])',
    keywords: ['cyst', 'ameloblastoma', 'keratocyst', 'odontogenic', 'leukoplakia', 'lichen planus', 'histopatholog', 'salivary', 'lesion'],
  },
  {
    id: 'imaging', label: 'Imaging & 3D',
    query: '("Cone-Beam Computed Tomography"[MeSH] OR "Printing, Three-Dimensional"[MeSH] OR CBCT[tiab] OR "3D"[tiab] OR navigation[tiab])',
    keywords: ['cbct', 'cone-beam', 'cone beam', '3d', 'three-dimensional', 'navigation', 'virtual', 'artificial intelligence', 'deep learning', 'radiograph'],
  },
  {
    id: 'anaesthesia', label: 'Anaesthesia & Sedation',
    query: '("Anesthesia, Dental"[MeSH] OR "Conscious Sedation"[MeSH] OR anesthe*[tiab] OR anaesthe*[tiab] OR sedation[tiab] OR analgesi*[tiab])',
    keywords: ['anesthe', 'anaesthe', 'sedation', 'analgesi', 'nerve block', 'postoperative pain', 'opioid'],
  },
];

export const OTHER_TOPIC = 'Other';

/**
 * AND-ed with "broad" journals so they only contribute OMFS-relevant articles.
 */
export const OMFS_RELEVANCE_QUERY =
  '("Surgery, Oral"[MeSH] OR "Oral Surgical Procedures"[MeSH] OR "Maxillofacial Injuries"[MeSH] OR "Jaw"[MeSH] OR "Mouth Neoplasms"[MeSH] OR "Temporomandibular Joint"[MeSH] OR "Cleft Palate"[MeSH] OR "Dental Implants"[MeSH] OR maxillofacial[tiab] OR mandib*[tiab] OR maxill*[tiab] OR "oral cavity"[tiab] OR "oral cancer"[tiab] OR "oral squamous"[tiab] OR jaw[tiab] OR orbital[tiab] OR zygoma*[tiab] OR cleft[tiab] OR temporomandibular[tiab] OR orthognathic[tiab] OR "dental implant*"[tiab] OR "third molar*"[tiab])';

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

/**
 * Labels an article with up to 3 topics. A keyword in the title scores 3, in keywords/MeSH 2,
 * in the abstract 1 (per distinct keyword); a topic needs a score of 3 to count, so a passing
 * mention in the abstract alone doesn't tag it.
 */
export function classify(parts: { title: string; keywords?: string[]; abstract?: string }): string[] {
  const title = parts.title.toLowerCase();
  const kw = (parts.keywords ?? []).join(' ').toLowerCase();
  const abs = (parts.abstract ?? '').toLowerCase();
  const scored = TOPICS.map((topic) => ({
    label: topic.label,
    score: topic.keywords.reduce(
      (s, k) => s + (title.includes(k) ? 3 : 0) + (kw.includes(k) ? 2 : 0) + (abs.includes(k) ? 1 : 0),
      0,
    ),
  }))
    .filter((t) => t.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return scored.length ? scored.map((t) => t.label) : [OTHER_TOPIC];
}
