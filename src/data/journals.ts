import type { ArticleQuery, Journal, Region, SpecialtyId } from '../lib/types';
import { DEFAULT_SPECIALTY, RELEVANCE_QUERY } from './specialties';

// ISSNs verified against the NLM catalog and live PubMed / Crossref counts (2026-10-15).
// freePct = share of the journal's 2025 articles that are free to read (PubMed "free full text" filter;
// Crossref journals: share with a Creative Commons licence), measured 2026-10-15.
// To add a journal: append one entry. Use source 'crossref' if PubMed has no records for it,
// specialty if it isn't OMFS, and broad: true if it publishes much outside its specialty.
export const JOURNALS: Journal[] = [
  // USA
  { id: 'joms', name: 'Journal of Oral and Maxillofacial Surgery', abbr: 'J Oral Maxillofac Surg', region: 'USA', issns: ['0278-2391', '1531-5053'], source: 'pubmed', freePct: 11 },
  { id: 'jcs', name: 'The Journal of Craniofacial Surgery', abbr: 'J Craniofac Surg', region: 'USA', issns: ['1049-2275', '1536-3732'], source: 'pubmed', broad: true, freePct: 5 },
  { id: 'cmtr', name: 'Craniomaxillofacial Trauma & Reconstruction', abbr: 'Craniomaxillofac Trauma Reconstr', region: 'USA', issns: ['1943-3875', '1943-3883'], source: 'pubmed', freePct: 100 },
  { id: 'oooo', name: 'Oral Surgery, Oral Medicine, Oral Pathology and Oral Radiology', abbr: 'Oral Surg Oral Med Oral Pathol Oral Radiol', region: 'USA', issns: ['2212-4403', '2212-4411'], source: 'pubmed', freePct: 14 },
  { id: 'joi', name: 'Journal of Oral Implantology', abbr: 'J Oral Implantol', region: 'USA', issns: ['0160-6972', '1548-1336'], source: 'pubmed', freePct: 1 },
  { id: 'semorth', name: 'Seminars in Orthodontics', abbr: 'Semin Orthod', region: 'USA', issns: ['1073-8746', '1558-4631'], source: 'crossref', freePct: 25 },
  { id: 'omscna', name: 'Oral and Maxillofacial Surgery Clinics of North America', abbr: 'Oral Maxillofac Surg Clin North Am', region: 'USA', issns: ['1042-3699', '1558-1365'], source: 'pubmed', freePct: 0 },
  { id: 'atlas', name: 'Atlas of the Oral and Maxillofacial Surgery Clinics', abbr: 'Atlas Oral Maxillofac Surg Clin North Am', region: 'USA', issns: ['1061-3315', '1558-4275'], source: 'pubmed', freePct: 0 },
  { id: 'headneck', name: 'Head & Neck', abbr: 'Head Neck', region: 'USA', issns: ['1043-3074', '1097-0347'], specialty: 'headneck', source: 'pubmed', broad: true, freePct: 39 },
  { id: 'jamaoto', name: 'JAMA Otolaryngology–Head & Neck Surgery', abbr: 'JAMA Otolaryngol Head Neck Surg', region: 'USA', issns: ['2168-6181', '2168-619X'], specialty: 'headneck', source: 'pubmed', broad: true, freePct: 48 },
  { id: 'hnpath', name: 'Head and Neck Pathology', abbr: 'Head Neck Pathol', region: 'USA', issns: ['1936-055X', '1936-0568'], specialty: 'headneck', source: 'pubmed', freePct: 89 },
  { id: 'cidrr', name: 'Clinical Implant Dentistry and Related Research', abbr: 'Clin Implant Dent Relat Res', region: 'USA', issns: ['1523-0899', '1708-8208'], source: 'pubmed', freePct: 41 },
  { id: 'prsgo', name: 'Plastic and Reconstructive Surgery – Global Open', abbr: 'Plast Reconstr Surg Glob Open', region: 'USA', issns: ['2169-7574'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  // Formerly JAMA Facial Plastic Surgery (2013–2019): its ISSNs bring in the back issues.
  { id: 'fpsam', name: 'Facial Plastic Surgery & Aesthetic Medicine', abbr: 'Facial Plast Surg Aesthet Med', region: 'USA', issns: ['2689-3614', '2689-3622', '2168-6076', '2168-6092'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 8 },
  { id: 'microsurg', name: 'Microsurgery', abbr: 'Microsurgery', region: 'USA', issns: ['0738-1085', '1098-2752'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 15 },
  { id: 'jrm', name: 'Journal of Reconstructive Microsurgery', abbr: 'J Reconstr Microsurg', region: 'USA', issns: ['0743-684X', '1098-8947'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 7 },

  { id: 'ijscr', name: 'International Journal of Surgery Case Reports', abbr: 'Int J Surg Case Rep', region: 'USA', issns: ['2210-2612'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'cedr', name: 'Clinical and Experimental Dental Research', abbr: 'Clin Exp Dent Res', region: 'USA', issns: ['2057-4347'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'jomi', name: 'International Journal of Oral & Maxillofacial Implants', abbr: 'Int J Oral Maxillofac Implants', region: 'USA', issns: ['0882-2786', '1942-4434'], source: 'pubmed', freePct: 0 },
  { id: 'cpcj', name: 'The Cleft Palate-Craniofacial Journal', abbr: 'Cleft Palate Craniofac J', region: 'USA', issns: ['1055-6656', '1545-1569'], source: 'pubmed', freePct: 21 },
  { id: 'face', name: 'FACE', abbr: 'FACE', region: 'USA', issns: ['2732-5016'], source: 'crossref', freePct: 0 },
  { id: 'jofph', name: 'Journal of Oral & Facial Pain and Headache', abbr: 'J Oral Facial Pain Headache', region: 'USA', issns: ['2333-0384', '2333-0376'], source: 'pubmed', freePct: 100 },
  { id: 'cranio', name: 'Cranio: The Journal of Craniomandibular & Sleep Practice', abbr: 'Cranio', region: 'USA', issns: ['0886-9634', '2151-0903'], source: 'pubmed', freePct: 8 },
  { id: 'ajodo', name: 'American Journal of Orthodontics and Dentofacial Orthopedics', abbr: 'Am J Orthod Dentofacial Orthop', region: 'USA', issns: ['0889-5406', '1097-6752'], source: 'pubmed', broad: true, freePct: 19 },
  { id: 'angle', name: 'The Angle Orthodontist', abbr: 'Angle Orthod', region: 'USA', issns: ['0003-3219', '1945-7103'], source: 'pubmed', broad: true, freePct: 100 },

  // UK
  { id: 'bjoms', name: 'British Journal of Oral and Maxillofacial Surgery', abbr: 'Br J Oral Maxillofac Surg', region: 'UK', issns: ['0266-4356', '1532-1940'], source: 'pubmed', freePct: 11 },
  { id: 'oralsurg', name: 'Oral Surgery (BAOS)', abbr: 'Oral Surg', region: 'UK', issns: ['1752-2471', '1752-248X'], source: 'crossref', freePct: 14 },

  { id: 'bmcoh', name: 'BMC Oral Health', abbr: 'BMC Oral Health', region: 'UK', issns: ['1472-6831'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'jpras', name: 'Journal of Plastic, Reconstructive & Aesthetic Surgery', abbr: 'J Plast Reconstr Aesthet Surg', region: 'UK', issns: ['1748-6815', '1878-0539'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 19 },
  { id: 'jprasopen', name: 'JPRAS Open', abbr: 'JPRAS Open', region: 'UK', issns: ['2352-5878'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'jor', name: 'Journal of Oral Rehabilitation', abbr: 'J Oral Rehabil', region: 'UK', issns: ['0305-182X', '1365-2842'], source: 'pubmed', broad: true, freePct: 45 },
  { id: 'dmfr', name: 'Dentomaxillofacial Radiology', abbr: 'Dentomaxillofac Radiol', region: 'UK', issns: ['0250-832X', '1476-542X'], source: 'pubmed', broad: true, freePct: 100 },

  // Europe
  { id: 'ijoms', name: 'International Journal of Oral and Maxillofacial Surgery', abbr: 'Int J Oral Maxillofac Surg', region: 'Europe', issns: ['0901-5027', '1399-0020'], source: 'pubmed', freePct: 24 },
  { id: 'jcms', name: 'Journal of Cranio-Maxillofacial Surgery', abbr: 'J Craniomaxillofac Surg', region: 'Europe', issns: ['1010-5182', '1878-4119'], source: 'pubmed', freePct: 30 },
  { id: 'jsomfs', name: 'Journal of Stomatology, Oral and Maxillofacial Surgery', abbr: 'J Stomatol Oral Maxillofac Surg', region: 'Europe', issns: ['2468-7855', '2468-8509'], source: 'pubmed', freePct: 13 },
  { id: 'oraloncol', name: 'Oral Oncology', abbr: 'Oral Oncol', region: 'Europe', issns: ['1368-8375', '1879-0593'], specialty: 'headneck', source: 'pubmed', broad: true, freePct: 16 },
  { id: 'oralonrep', name: 'Oral Oncology Reports', abbr: 'Oral Oncol Rep', region: 'Europe', issns: ['2772-9060'], source: 'crossref', freePct: 100 },
  { id: 'oraldis', name: 'Oral Diseases', abbr: 'Oral Dis', region: 'Europe', issns: ['1354-523X', '1601-0825'], source: 'pubmed', broad: true, freePct: 26 },
  { id: 'cloi', name: 'Clinical Oral Investigations', abbr: 'Clin Oral Investig', region: 'Europe', issns: ['1432-6981', '1436-3771'], source: 'pubmed', broad: true, freePct: 46 },
  { id: 'quint', name: 'Quintessence International', abbr: 'Quintessence Int', region: 'Europe', issns: ['0033-6572', '1936-7163'], source: 'pubmed', broad: true, freePct: 1 },
  { id: 'hfm', name: 'Head & Face Medicine', abbr: 'Head Face Med', region: 'Europe', issns: ['1746-160X'], source: 'pubmed', freePct: 100 },
  // Formerly European Journal of Oral Implantology (renamed 2019); old ISSNs kept for back-issues.
  { id: 'ijoi', name: 'International Journal of Oral Implantology', abbr: 'Int J Oral Implantol (Berl)', region: 'Europe', issns: ['2631-6420', '2631-6439', '1756-2406', '1756-2414'], source: 'pubmed', freePct: 0 },
  { id: 'omfs', name: 'Oral and Maxillofacial Surgery', abbr: 'Oral Maxillofac Surg', region: 'Europe', issns: ['1865-1550', '1865-1569'], source: 'pubmed', freePct: 24 },
  { id: 'medoral', name: 'Medicina Oral, Patología Oral y Cirugía Bucal', abbr: 'Med Oral Patol Oral Cir Bucal', region: 'Europe', issns: ['1698-4447', '1698-6946'], source: 'pubmed', freePct: 100 },
  { id: 'jopm', name: 'Journal of Oral Pathology & Medicine', abbr: 'J Oral Pathol Med', region: 'Europe', issns: ['0904-2512', '1600-0714'], source: 'pubmed', freePct: 31 },
  { id: 'ijid', name: 'International Journal of Implant Dentistry', abbr: 'Int J Implant Dent', region: 'Europe', issns: ['2198-4034'], source: 'pubmed', freePct: 100 },
  { id: 'jced', name: 'Journal of Clinical and Experimental Dentistry', abbr: 'J Clin Exp Dent', region: 'Europe', issns: ['1989-5488'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'dentj', name: 'Dentistry Journal', abbr: 'Dent J (Basel)', region: 'Europe', issns: ['2304-6767'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'fdm', name: 'Frontiers in Dental Medicine', abbr: 'Front Dent Med', region: 'Europe', issns: ['2673-4915'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'coir', name: 'Clinical Oral Implants Research', abbr: 'Clin Oral Implants Res', region: 'Europe', issns: ['0905-7161', '1600-0501'], source: 'pubmed', freePct: 57 },
  { id: 'dt', name: 'Dental Traumatology', abbr: 'Dent Traumatol', region: 'Europe', issns: ['1600-4469', '1600-9657'], source: 'pubmed', broad: true, freePct: 32 },
  { id: 'ejo', name: 'European Journal of Orthodontics', abbr: 'Eur J Orthod', region: 'Europe', issns: ['0141-5387', '1460-2210'], source: 'pubmed', broad: true, freePct: 81 },
  { id: 'progorth', name: 'Progress in Orthodontics', abbr: 'Prog Orthod', region: 'Europe', issns: ['1723-7785', '2196-1042'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'foh', name: 'Frontiers in Oral Health', abbr: 'Front Oral Health', region: 'Europe', issns: ['2673-4842'], source: 'pubmed', broad: true, freePct: 100 },
  // Ceased 2019: archive articles only (no records in PubMed or Europe PMC).
  { id: 'ohdm', name: 'Oral Health and Dental Management', abbr: 'Oral Health Dent Manag', region: 'Europe', issns: ['2247-2452'], source: 'crossref', freePct: 0 },

  // India
  { id: 'jmos', name: 'Journal of Maxillofacial and Oral Surgery', abbr: 'J Maxillofac Oral Surg', region: 'India', issns: ['0972-8279', '0974-942X'], source: 'pubmed', freePct: 63 },
  { id: 'ams', name: 'Annals of Maxillofacial Surgery', abbr: 'Ann Maxillofac Surg', region: 'India', issns: ['2231-0746', '2249-3816'], source: 'pubmed', freePct: 100 },
  { id: 'jobcr', name: 'Journal of Oral Biology and Craniofacial Research', abbr: 'J Oral Biol Craniofac Res', region: 'India', issns: ['2212-4268', '2212-4276'], source: 'pubmed', freePct: 100 },
  { id: 'njms', name: 'National Journal of Maxillofacial Surgery', abbr: 'Natl J Maxillofac Surg', region: 'India', issns: ['0975-5950', '2229-3418'], source: 'pubmed', freePct: 100 },
  { id: 'ijps', name: 'Indian Journal of Plastic Surgery', abbr: 'Indian J Plast Surg', region: 'India', issns: ['0970-0358', '1998-376X'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'ccd', name: 'Contemporary Clinical Dentistry', abbr: 'Contemp Clin Dent', region: 'India', issns: ['0976-237X', '0976-2361'], source: 'pubmed', broad: true, freePct: 100 },

  // Korea
  { id: 'jkaoms', name: 'Journal of the Korean Association of Oral and Maxillofacial Surgeons', abbr: 'J Korean Assoc Oral Maxillofac Surg', region: 'Korea', issns: ['2234-7550', '2234-5930'], source: 'pubmed', freePct: 100 },
  { id: 'acfs', name: 'Archives of Craniofacial Surgery', abbr: 'Arch Craniofac Surg', region: 'Korea', issns: ['2287-1152', '2287-5603'], source: 'pubmed', freePct: 100 },
  { id: 'mprs', name: 'Maxillofacial Plastic and Reconstructive Surgery', abbr: 'Maxillofac Plast Reconstr Surg', region: 'Korea', issns: ['2288-8101', '2288-8586'], source: 'pubmed', freePct: 100 },
  { id: 'isd', name: 'Imaging Science in Dentistry', abbr: 'Imaging Sci Dent', region: 'Korea', issns: ['2233-7822', '2233-7830'], source: 'pubmed', broad: true, freePct: 100 },

  // Japan
  { id: 'osi', name: 'Oral Science International', abbr: 'Oral Sci Int', region: 'Japan', issns: ['1348-8643', '1881-4204'], source: 'crossref', freePct: 8 },
  { id: 'jjoms', name: 'Japanese Journal of Oral and Maxillofacial Surgery', abbr: 'Jpn J Oral Maxillofac Surg', region: 'Japan', issns: ['0021-5163'], source: 'crossref', freePct: 0 },
  { id: 'oralrad', name: 'Oral Radiology', abbr: 'Oral Radiol', region: 'Japan', issns: ['0911-6028', '1613-9674'], source: 'pubmed', broad: true, freePct: 12 },
  { id: 'jdsr', name: 'Japanese Dental Science Review', abbr: 'Jpn Dent Sci Rev', region: 'Japan', issns: ['1882-7616', '2213-6851'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'odont', name: 'Odontology', abbr: 'Odontology', region: 'Japan', issns: ['1618-1247', '1618-1255'], source: 'pubmed', broad: true, freePct: 25 },

  // China
  { id: 'ijos', name: 'International Journal of Oral Science', abbr: 'Int J Oral Sci', region: 'China', issns: ['1674-2818', '2049-3169'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'wcjs', name: 'West China Journal of Stomatology', abbr: 'Hua Xi Kou Qiang Yi Xue Za Zhi', region: 'China', issns: ['1000-1182', '2618-0456'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'cjs', name: 'Chinese Journal of Stomatology', abbr: 'Zhonghua Kou Qiang Yi Xue Za Zhi', region: 'China', issns: ['1002-0098'], source: 'pubmed', broad: true, freePct: 0 },

  // Asia (regional)
  { id: 'jomsmp', name: 'Journal of Oral and Maxillofacial Surgery, Medicine, and Pathology', abbr: 'J Oral Maxillofac Surg Med Pathol', region: 'Asia', issns: ['2212-5558', '2212-5566'], source: 'crossref', freePct: 19 },
  { id: 'jds', name: 'Journal of Dental Sciences (Taiwan)', abbr: 'J Dent Sci', region: 'Asia', issns: ['1991-7902', '2213-8862'], source: 'pubmed', broad: true, freePct: 100 },

  // Australia
  { id: 'adj', name: 'Australian Dental Journal', abbr: 'Aust Dent J', region: 'Australia', issns: ['0045-0421', '1834-7819'], source: 'pubmed', broad: true, freePct: 42 },
  { id: 'anzjs', name: 'ANZ Journal of Surgery', abbr: 'ANZ J Surg', region: 'Australia', issns: ['1445-1433', '1445-2197'], source: 'pubmed', broad: true, freePct: 29 },
  // Launched 2025; registered with Crossref only.
  { id: 'ajoms', name: 'The Australasian Journal of Oral and Maxillofacial Surgery', abbr: 'Australas J Oral Maxillofac Surg', region: 'Australia', issns: ['2982-0065'], source: 'crossref', freePct: 0 },

  // Canada
  { id: 'jcda', name: 'Journal of the Canadian Dental Association', abbr: 'J Can Dent Assoc', region: 'Canada', issns: ['0709-8936', '1488-2159'], source: 'pubmed', broad: true, freePct: 100 },

  // Latin America
  { id: 'jaos', name: 'Journal of Applied Oral Science', abbr: 'J Appl Oral Sci', region: 'Latin America', issns: ['1678-7757', '1678-7765'], source: 'pubmed', broad: true, freePct: 100 },
  { id: 'bor', name: 'Brazilian Oral Research', abbr: 'Braz Oral Res', region: 'Latin America', issns: ['1806-8324', '1807-3107'], source: 'pubmed', broad: true, freePct: 100 },

  // Middle East
  { id: 'sdj', name: 'The Saudi Dental Journal', abbr: 'Saudi Dent J', region: 'Middle East', issns: ['1013-9052', '1658-3558'], source: 'pubmed', broad: true, freePct: 100 },

  // ---- Added 2026-10-19: facial plastics, OMFS gaps, evidence, head & neck ----------------------
  // Facial plastic and aesthetic surgery (broad ones are narrowed to the head, face and neck).
  { id: 'prs', name: 'Plastic and Reconstructive Surgery', abbr: 'Plast Reconstr Surg', region: 'USA', issns: ['0032-1052', '1529-4242'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 10 },
  { id: 'asj', name: 'Aesthetic Surgery Journal', abbr: 'Aesthet Surg J', region: 'USA', issns: ['1090-820X', '1527-330X'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 97 },
  { id: 'asjof', name: 'Aesthetic Surgery Journal Open Forum', abbr: 'Aesthet Surg J Open Forum', region: 'USA', issns: ['2631-4797'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'aps', name: 'Aesthetic Plastic Surgery', abbr: 'Aesthetic Plast Surg', region: 'USA', issns: ['0364-216X', '1432-5241'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 12 },
  { id: 'fps', name: 'Facial Plastic Surgery', abbr: 'Facial Plast Surg', region: 'USA', issns: ['0736-6825', '1098-8793'], specialty: 'facial', source: 'pubmed', freePct: 8 },
  { id: 'fpscna', name: 'Facial Plastic Surgery Clinics of North America', abbr: 'Facial Plast Surg Clin North Am', region: 'USA', issns: ['1064-7406', '1558-1926'], specialty: 'facial', source: 'pubmed', freePct: 0 },
  { id: 'annplast', name: 'Annals of Plastic Surgery', abbr: 'Ann Plast Surg', region: 'USA', issns: ['0148-7043', '1536-3708'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 6 },
  // Fully open access, but Crossref holds no licence data for it: its free share is the publisher's model.
  { id: 'par', name: 'Plastic and Aesthetic Research', abbr: 'Plast Aesthet Res', region: 'USA', issns: ['2347-9264', '2349-6150'], specialty: 'facial', source: 'crossref', freePct: 100 },
  // OMFS
  { id: 'advoms', name: 'Advances in Oral and Maxillofacial Surgery', abbr: 'Adv Oral Maxillofac Surg', region: 'UK', issns: ['2667-1476'], source: 'crossref', freePct: 97 },
  { id: 'omscases', name: 'Oral and Maxillofacial Surgery Cases', abbr: 'Oral Maxillofac Surg Cases', region: 'USA', issns: ['2214-5419'], source: 'crossref', freePct: 100 },
  { id: 'jomos', name: 'Journal of Oral Medicine and Oral Surgery', abbr: 'J Oral Med Oral Surg', region: 'Europe', issns: ['2608-1326'], source: 'crossref', freePct: 100 },
  { id: 'jomfp', name: 'Journal of Oral and Maxillofacial Pathology', abbr: 'J Oral Maxillofac Pathol', region: 'India', issns: ['0973-029X', '1998-393X'], source: 'pubmed', freePct: 100 },
  { id: 'jdapm', name: 'Journal of Dental Anesthesia and Pain Medicine', abbr: 'J Dent Anesth Pain Med', region: 'Korea', issns: ['2383-9309', '2383-9317'], source: 'pubmed', freePct: 100 },
  { id: 'ocr', name: 'Orthodontics & Craniofacial Research', abbr: 'Orthod Craniofac Res', region: 'Europe', issns: ['1601-6335', '1601-6343'], source: 'pubmed', broad: true, freePct: 43 },
  // Evidence and methods (narrowed to OMFS, head and neck, and facial topics)
  { id: 'sysrev', name: 'Systematic Reviews', abbr: 'Syst Rev', region: 'UK', issns: ['2046-4053'], specialty: 'evidence', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'jebdp', name: 'Journal of Evidence-Based Dental Practice', abbr: 'J Evid Based Dent Pract', region: 'USA', issns: ['1532-3382', '1532-3390'], specialty: 'evidence', source: 'pubmed', broad: true, freePct: 29 },
  { id: 'ebd', name: 'Evidence-Based Dentistry', abbr: 'Evid Based Dent', region: 'UK', issns: ['1462-0049', '1476-5446'], specialty: 'evidence', source: 'pubmed', broad: true, freePct: 23 },
  // Head and neck
  { id: 'johns', name: 'Journal of Otolaryngology – Head & Neck Surgery', abbr: 'J Otolaryngol Head Neck Surg', region: 'Canada', issns: ['1916-0216', '1916-0208'], specialty: 'headneck', source: 'pubmed', broad: true, freePct: 100 },
  // ---- Added 2026-10-19 (v1.12): more facial plastics and aesthetic medicine ---------------------
  { id: 'archps', name: 'Archives of Plastic Surgery', abbr: 'Arch Plast Surg', region: 'Korea', issns: ['2234-6163', '2234-6171'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'semps', name: 'Seminars in Plastic Surgery', abbr: 'Semin Plast Surg', region: 'USA', issns: ['1535-2188', '1536-0067'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 76 },
  { id: 'dermsurg', name: 'Dermatologic Surgery', abbr: 'Dermatol Surg', region: 'USA', issns: ['1076-0512', '1524-4725'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 4 },
  { id: 'jcd', name: 'Journal of Cosmetic Dermatology', abbr: 'J Cosmet Dermatol', region: 'UK', issns: ['1473-2130', '1473-2165'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'jcad', name: 'Journal of Clinical and Aesthetic Dermatology', abbr: 'J Clin Aesthet Dermatol', region: 'USA', issns: ['1941-2789', '2689-9175'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'ccid', name: 'Clinical, Cosmetic and Investigational Dermatology', abbr: 'Clin Cosmet Investig Dermatol', region: 'UK', issns: ['1178-7015'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  { id: 'cjprs', name: 'Chinese Journal of Plastic and Reconstructive Surgery', abbr: 'Chin J Plast Reconstr Surg', region: 'China', issns: ['2096-6911'], specialty: 'facial', source: 'crossref', freePct: 100 },
  { id: 'ijt', name: 'International Journal of Trichology', abbr: 'Int J Trichology', region: 'India', issns: ['0974-7753', '0974-9241'], specialty: 'facial', source: 'pubmed', broad: true, freePct: 100 },
  // Open access (Medknow) but few recent records in Crossref and none in PubMed; earlier title's ISSNs kept for its archive.
  { id: 'tjps', name: 'Turkish Journal of Plastic Surgery', abbr: 'Turk J Plast Surg', region: 'Europe', issns: ['1300-6878', '1308-8475', '2528-8644'], specialty: 'facial', source: 'crossref', freePct: 100 },
];

export const REGIONS: Region[] = ['USA', 'UK', 'Europe', 'India', 'Korea', 'Japan', 'China', 'Asia', 'Australia', 'Canada', 'Latin America', 'Middle East'];

export type AccessTier = 'free' | 'mixed' | 'subscription';
export const ACCESS_TIERS: { tier: AccessTier; label: string }[] = [
  { tier: 'free', label: 'Free to read' },
  { tier: 'mixed', label: 'Partly free' },
  { tier: 'subscription', label: 'Mostly subscription' },
];
export const accessTier = (j: Journal): AccessTier => (j.freePct >= 95 ? 'free' : j.freePct >= 20 ? 'mixed' : 'subscription');

/** Journals ordered by how much they publish free to read (most first), then by name. */
export const byFreeAccess = (a: Journal, b: Journal) => b.freePct - a.freePct || a.name.localeCompare(b.name);

const byIssn = new Map<string, Journal>();
for (const j of JOURNALS) for (const i of j.issns) byIssn.set(i.toUpperCase(), j);

export const journalById = (id: string) => JOURNALS.find((j) => j.id === id);
export const journalByIssn = (issn: string) => byIssn.get(issn.toUpperCase());

export const specialtyOf = (j: Journal): SpecialtyId => j.specialty ?? 'omfs';

/** The specialty view a query is in: 'all' when it names journals (they are taken as they are). */
export const viewOf = (q: Pick<ArticleQuery, 'specialty' | 'journalIds'>): SpecialtyId | 'all' =>
  q.journalIds?.length ? 'all' : q.specialty ?? DEFAULT_SPECIALTY;

/**
 * Journals a view draws on: its own journals, and in the OMFS view also every other PubMed journal
 * (narrowed to OMFS papers, see relevanceFor). Crossref can't be narrowed by topic, so it isn't.
 */
export const inView = (j: Journal, view: SpecialtyId | 'all') =>
  view === 'all' || specialtyOf(j) === view || (view === 'omfs' && j.source === 'pubmed');

/** The relevance filter a journal's articles must match in a view, if any. */
export function relevanceFor(j: Journal, view: SpecialtyId | 'all'): string | undefined {
  if (view === 'omfs' && specialtyOf(j) !== 'omfs') return RELEVANCE_QUERY.omfs;
  return j.broad ? RELEVANCE_QUERY[specialtyOf(j)] : undefined;
}

export function selectJournals(q: Pick<ArticleQuery, 'specialty' | 'regions' | 'journalIds'>): Journal[] {
  const view = viewOf(q);
  return JOURNALS.filter(
    (j) =>
      inView(j, view) &&
      (!q.regions?.length || q.regions.includes(j.region)) &&
      (!q.journalIds?.length || q.journalIds.includes(j.id)),
  );
}
