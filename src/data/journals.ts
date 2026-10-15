import type { Journal, Region } from '../lib/types';

// ISSNs verified against the NLM catalog and live PubMed / Crossref counts (2026-10-15).
// To add a journal: append one entry. Use source 'crossref' if PubMed has no records for it,
// and broad: true if it publishes much outside OMFS.
export const JOURNALS: Journal[] = [
  // USA
  { id: 'joms', name: 'Journal of Oral and Maxillofacial Surgery', abbr: 'J Oral Maxillofac Surg', region: 'USA', issns: ['0278-2391', '1531-5053'], source: 'pubmed' },
  { id: 'jcs', name: 'The Journal of Craniofacial Surgery', abbr: 'J Craniofac Surg', region: 'USA', issns: ['1049-2275', '1536-3732'], source: 'pubmed', broad: true },
  { id: 'cmtr', name: 'Craniomaxillofacial Trauma & Reconstruction', abbr: 'Craniomaxillofac Trauma Reconstr', region: 'USA', issns: ['1943-3875', '1943-3883'], source: 'pubmed', openAccess: true },
  { id: 'oooo', name: 'Oral Surgery, Oral Medicine, Oral Pathology and Oral Radiology', abbr: 'Oral Surg Oral Med Oral Pathol Oral Radiol', region: 'USA', issns: ['2212-4403', '2212-4411'], source: 'pubmed' },
  { id: 'joi', name: 'Journal of Oral Implantology', abbr: 'J Oral Implantol', region: 'USA', issns: ['0160-6972', '1548-1336'], source: 'pubmed' },
  { id: 'semorth', name: 'Seminars in Orthodontics', abbr: 'Semin Orthod', region: 'USA', issns: ['1073-8746', '1558-4631'], source: 'crossref' },
  { id: 'omscna', name: 'Oral and Maxillofacial Surgery Clinics of North America', abbr: 'Oral Maxillofac Surg Clin North Am', region: 'USA', issns: ['1042-3699', '1558-1365'], source: 'pubmed' },
  { id: 'atlas', name: 'Atlas of the Oral and Maxillofacial Surgery Clinics', abbr: 'Atlas Oral Maxillofac Surg Clin North Am', region: 'USA', issns: ['1061-3315', '1558-4275'], source: 'pubmed' },
  { id: 'headneck', name: 'Head & Neck', abbr: 'Head Neck', region: 'USA', issns: ['1043-3074', '1097-0347'], source: 'pubmed', broad: true },
  { id: 'jamaoto', name: 'JAMA Otolaryngology–Head & Neck Surgery', abbr: 'JAMA Otolaryngol Head Neck Surg', region: 'USA', issns: ['2168-6181', '2168-619X'], source: 'pubmed', broad: true },
  { id: 'hnpath', name: 'Head and Neck Pathology', abbr: 'Head Neck Pathol', region: 'USA', issns: ['1936-055X', '1936-0568'], source: 'pubmed' },
  { id: 'cidrr', name: 'Clinical Implant Dentistry and Related Research', abbr: 'Clin Implant Dent Relat Res', region: 'USA', issns: ['1523-0899', '1708-8208'], source: 'pubmed' },
  { id: 'prsgo', name: 'Plastic and Reconstructive Surgery – Global Open', abbr: 'Plast Reconstr Surg Glob Open', region: 'USA', issns: ['2169-7574'], source: 'pubmed', broad: true, openAccess: true },
  { id: 'fpsam', name: 'Facial Plastic Surgery & Aesthetic Medicine', abbr: 'Facial Plast Surg Aesthet Med', region: 'USA', issns: ['2689-3614', '2689-3622'], source: 'pubmed', broad: true },
  { id: 'microsurg', name: 'Microsurgery', abbr: 'Microsurgery', region: 'USA', issns: ['0738-1085', '1098-2752'], source: 'pubmed', broad: true },
  { id: 'jrm', name: 'Journal of Reconstructive Microsurgery', abbr: 'J Reconstr Microsurg', region: 'USA', issns: ['0743-684X', '1098-8947'], source: 'pubmed', broad: true },

  // UK
  { id: 'bjoms', name: 'British Journal of Oral and Maxillofacial Surgery', abbr: 'Br J Oral Maxillofac Surg', region: 'UK', issns: ['0266-4356', '1532-1940'], source: 'pubmed' },
  { id: 'oralsurg', name: 'Oral Surgery (BAOS)', abbr: 'Oral Surg', region: 'UK', issns: ['1752-2471', '1752-248X'], source: 'crossref' },

  // Europe
  { id: 'ijoms', name: 'International Journal of Oral and Maxillofacial Surgery', abbr: 'Int J Oral Maxillofac Surg', region: 'Europe', issns: ['0901-5027', '1399-0020'], source: 'pubmed' },
  { id: 'jcms', name: 'Journal of Cranio-Maxillofacial Surgery', abbr: 'J Craniomaxillofac Surg', region: 'Europe', issns: ['1010-5182', '1878-4119'], source: 'pubmed' },
  { id: 'jsomfs', name: 'Journal of Stomatology, Oral and Maxillofacial Surgery', abbr: 'J Stomatol Oral Maxillofac Surg', region: 'Europe', issns: ['2468-7855', '2468-8509'], source: 'pubmed' },
  { id: 'oraloncol', name: 'Oral Oncology', abbr: 'Oral Oncol', region: 'Europe', issns: ['1368-8375', '1879-0593'], source: 'pubmed', broad: true },
  { id: 'oralonrep', name: 'Oral Oncology Reports', abbr: 'Oral Oncol Rep', region: 'Europe', issns: ['2772-9060'], source: 'crossref', openAccess: true },
  { id: 'oraldis', name: 'Oral Diseases', abbr: 'Oral Dis', region: 'Europe', issns: ['1354-523X', '1601-0825'], source: 'pubmed', broad: true },
  { id: 'cloi', name: 'Clinical Oral Investigations', abbr: 'Clin Oral Investig', region: 'Europe', issns: ['1432-6981', '1436-3771'], source: 'pubmed', broad: true },
  { id: 'quint', name: 'Quintessence International', abbr: 'Quintessence Int', region: 'Europe', issns: ['0033-6572', '1936-7163'], source: 'pubmed', broad: true },
  { id: 'hfm', name: 'Head & Face Medicine', abbr: 'Head Face Med', region: 'Europe', issns: ['1746-160X'], source: 'pubmed', openAccess: true },
  // Formerly European Journal of Oral Implantology (renamed 2019); old ISSNs kept for back-issues.
  { id: 'ijoi', name: 'International Journal of Oral Implantology', abbr: 'Int J Oral Implantol (Berl)', region: 'Europe', issns: ['2631-6420', '2631-6439', '1756-2406', '1756-2414'], source: 'pubmed' },
  { id: 'omfs', name: 'Oral and Maxillofacial Surgery', abbr: 'Oral Maxillofac Surg', region: 'Europe', issns: ['1865-1550', '1865-1569'], source: 'pubmed' },
  { id: 'medoral', name: 'Medicina Oral, Patología Oral y Cirugía Bucal', abbr: 'Med Oral Patol Oral Cir Bucal', region: 'Europe', issns: ['1698-4447', '1698-6946'], source: 'pubmed' },
  { id: 'jopm', name: 'Journal of Oral Pathology & Medicine', abbr: 'J Oral Pathol Med', region: 'Europe', issns: ['0904-2512', '1600-0714'], source: 'pubmed' },
  { id: 'ijid', name: 'International Journal of Implant Dentistry', abbr: 'Int J Implant Dent', region: 'Europe', issns: ['2198-4034'], source: 'pubmed', openAccess: true },

  // India
  { id: 'jmos', name: 'Journal of Maxillofacial and Oral Surgery', abbr: 'J Maxillofac Oral Surg', region: 'India', issns: ['0972-8279', '0974-942X'], source: 'pubmed' },
  { id: 'ams', name: 'Annals of Maxillofacial Surgery', abbr: 'Ann Maxillofac Surg', region: 'India', issns: ['2231-0746', '2249-3816'], source: 'pubmed' },
  { id: 'jobcr', name: 'Journal of Oral Biology and Craniofacial Research', abbr: 'J Oral Biol Craniofac Res', region: 'India', issns: ['2212-4268', '2212-4276'], source: 'pubmed', openAccess: true },
  { id: 'njms', name: 'National Journal of Maxillofacial Surgery', abbr: 'Natl J Maxillofac Surg', region: 'India', issns: ['0975-5950', '2229-3418'], source: 'pubmed' },
  { id: 'ijps', name: 'Indian Journal of Plastic Surgery', abbr: 'Indian J Plast Surg', region: 'India', issns: ['0970-0358', '1998-376X'], source: 'pubmed', broad: true, openAccess: true },

  // Korea
  { id: 'jkaoms', name: 'Journal of the Korean Association of Oral and Maxillofacial Surgeons', abbr: 'J Korean Assoc Oral Maxillofac Surg', region: 'Korea', issns: ['2234-7550', '2234-5930'], source: 'pubmed' },
  { id: 'acfs', name: 'Archives of Craniofacial Surgery', abbr: 'Arch Craniofac Surg', region: 'Korea', issns: ['2287-1152', '2287-5603'], source: 'pubmed' },
  { id: 'mprs', name: 'Maxillofacial Plastic and Reconstructive Surgery', abbr: 'Maxillofac Plast Reconstr Surg', region: 'Korea', issns: ['2288-8101', '2288-8586'], source: 'pubmed', openAccess: true },

  // Japan
  { id: 'osi', name: 'Oral Science International', abbr: 'Oral Sci Int', region: 'Japan', issns: ['1348-8643', '1881-4204'], source: 'crossref' },
  { id: 'jjoms', name: 'Japanese Journal of Oral and Maxillofacial Surgery', abbr: 'Jpn J Oral Maxillofac Surg', region: 'Japan', issns: ['0021-5163'], source: 'crossref' },

  // Asia (regional)
  { id: 'jomsmp', name: 'Journal of Oral and Maxillofacial Surgery, Medicine, and Pathology', abbr: 'J Oral Maxillofac Surg Med Pathol', region: 'Asia', issns: ['2212-5558', '2212-5566'], source: 'crossref' },

  // Australia
  { id: 'adj', name: 'Australian Dental Journal', abbr: 'Aust Dent J', region: 'Australia', issns: ['0045-0421', '1834-7819'], source: 'pubmed', broad: true },
  { id: 'anzjs', name: 'ANZ Journal of Surgery', abbr: 'ANZ J Surg', region: 'Australia', issns: ['1445-1433', '1445-2197'], source: 'pubmed', broad: true },

  // Canada
  { id: 'jcda', name: 'Journal of the Canadian Dental Association', abbr: 'J Can Dent Assoc', region: 'Canada', issns: ['0709-8936', '1488-2159'], source: 'pubmed', broad: true },
];

export const REGIONS: Region[] = ['USA', 'UK', 'Europe', 'India', 'Korea', 'Japan', 'Asia', 'Australia', 'Canada'];

const byIssn = new Map<string, Journal>();
for (const j of JOURNALS) for (const i of j.issns) byIssn.set(i.toUpperCase(), j);

export const journalById = (id: string) => JOURNALS.find((j) => j.id === id);
export const journalByIssn = (issn: string) => byIssn.get(issn.toUpperCase());

export function selectJournals(regions?: Region[], journalIds?: string[]): Journal[] {
  return JOURNALS.filter(
    (j) =>
      (!regions?.length || regions.includes(j.region)) &&
      (!journalIds?.length || journalIds.includes(j.id)),
  );
}
