import type { SpecialtyId } from '../lib/types';
import { OMFS_RELEVANCE_QUERY } from './topics';

/**
 * Specialties group the journals. OMFS is the default view; in it, journals from the other
 * specialties (PubMed-indexed ones) still contribute their OMFS papers, as they always have.
 */
export const SPECIALTIES: { id: SpecialtyId; label: string }[] = [
  { id: 'omfs', label: 'OMFS' },
  { id: 'headneck', label: 'Head & Neck' },
  { id: 'facial', label: 'Facial Plastics' },
  { id: 'evidence', label: 'Evidence & Methods' },
];
export const DEFAULT_SPECIALTY: SpecialtyId = 'omfs';
export const specialtyLabel = (id: SpecialtyId) => SPECIALTIES.find((s) => s.id === id)?.label ?? id;

/** Head and neck surgery and oncology (not otology or general rhinology). */
export const HEAD_NECK_RELEVANCE_QUERY =
  '("Head and Neck Neoplasms"[MeSH] OR "Neck Dissection"[MeSH] OR "head and neck"[tiab] OR oral[tiab] OR oropharyn*[tiab] OR hypopharyn*[tiab] OR nasopharyn*[tiab] OR pharyn*[tiab] OR laryn*[tiab] OR thyroid*[tiab] OR parathyroid*[tiab] OR salivary[tiab] OR parotid*[tiab] OR submandibular[tiab] OR "neck dissection"[tiab] OR tracheostom*[tiab] OR "skull base"[tiab] OR sinonasal[tiab] OR tongue[tiab] OR mandib*[tiab] OR maxill*[tiab] OR "free flap*"[tiab] OR HPV[tiab])';

/** Facial plastic, aesthetic and reconstructive surgery of the head, face and neck (not breast or body). */
export const FACIAL_RELEVANCE_QUERY =
  '("Face"[MeSH] OR "Rhinoplasty"[MeSH] OR "Blepharoplasty"[MeSH] OR "Rhytidoplasty"[MeSH] OR "Botulinum Toxins"[MeSH] OR face[tiab] OR facial[tiab] OR rhinoplast*[tiab] OR nose[tiab] OR nasal[tiab] OR blepharoplast*[tiab] OR eyelid*[tiab] OR brow[tiab] OR forehead[tiab] OR facelift*[tiab] OR rhytidectom*[tiab] OR otoplast*[tiab] OR auricul*[tiab] OR ear[tiab] OR lip[tiab] OR lips[tiab] OR chin[tiab] OR genioplast*[tiab] OR neck[tiab] OR scalp[tiab] OR orbit*[tiab] OR craniofacial[tiab] OR cleft[tiab] OR mandib*[tiab] OR maxill*[tiab] OR botulinum[tiab] OR "dermal filler*"[tiab] OR "facial filler*"[tiab] OR "head and neck"[tiab])';

/** What a "broad" journal of each specialty is narrowed to. Evidence journals: anything in the other three. */
export const RELEVANCE_QUERY: Record<SpecialtyId, string> = {
  omfs: OMFS_RELEVANCE_QUERY,
  headneck: HEAD_NECK_RELEVANCE_QUERY,
  facial: FACIAL_RELEVANCE_QUERY,
  evidence: `(${OMFS_RELEVANCE_QUERY} OR ${HEAD_NECK_RELEVANCE_QUERY} OR ${FACIAL_RELEVANCE_QUERY})`,
};
