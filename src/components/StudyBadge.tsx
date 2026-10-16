import { studyTypeById } from '../data/studyTypes';

/** Study type label, coloured by strength of evidence. Renders nothing when the type is unknown. */
export default function StudyBadge({ type }: { type?: string }) {
  const t = studyTypeById(type);
  if (!t) return null;
  return (
    <span className={`study study-${t.tier}`} title={`Study type: ${t.label}`}>
      {t.label}
    </span>
  );
}
