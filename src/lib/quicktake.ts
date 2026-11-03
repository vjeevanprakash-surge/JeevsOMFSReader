import type { Article } from './types';

/**
 * A short takeaway built from the paper's own words, with no AI: its conclusion (or, for
 * unstructured abstracts, its last two sentences), trimmed to about 60 words, plus the key number
 * from its results. Undefined when there is no abstract to work from.
 */
export interface QuickTake {
  text: string;
  keyNumber?: string;
  result?: KeyResult;
  /** The sentence the key number comes from. */
  context?: string;
}

const MAX_WORDS = 60;
const CONCLUSION = /conclusion|interpretation|clinical (relevance|significance)|implications|take.?home/i;
const RESULTS = /results?|findings/i;

/** `LABEL: text` paragraphs, as parsePubmedXml stores structured abstracts. */
function sections(abstract: string): { label: string; text: string }[] {
  return abstract
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = /^([A-Z][A-Za-z ,&/-]{1,60}):\s+([\s\S]*)$/.exec(p);
      return m ? { label: m[1], text: m[2] } : { label: '', text: p };
    });
}

// Full stops that don't end a sentence.
const ABBREV = /\b(vs|et al|e\.g|i\.e|approx|fig|no|ca|cf)\./gi;

export function sentences(text: string): string[] {
  return text
    .replace(ABBREV, (m) => m.replace(/\./g, '․'))
    .split(/(?<=[.!?])\s+(?=[A-Z(\d])/)
    .map((s) => s.replace(/․/g, '.').trim())
    .filter(Boolean);
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Whole sentences up to about MAX_WORDS; a single long sentence is cut with an ellipsis. */
function trimToWords(parts: string[]): string {
  const out: string[] = [];
  let n = 0;
  for (const s of parts) {
    if (out.length && n + words(s) > MAX_WORDS) break;
    out.push(s);
    n += words(s);
  }
  const text = out.join(' ');
  if (words(text) <= MAX_WORDS + 15) return text;
  return `${text.split(/\s+/).slice(0, MAX_WORDS).join(' ').replace(/[,;:]$/, '')}…`;
}

const NUM = String.raw`[-−–]?\d+(?:\.\d+)?`;
const RANGE = String.raw`(${NUM})\s*(?:[-–−]|to|,)\s*(${NUM})`;
const EFFECT = new RegExp(
  String.raw`\b(a?HR|a?OR|a?RR|IRR|SMD|WMD|MD)\b\s*(?:[=:,]|of)?\s*(${NUM})(?:\s*[(\[;,]?\s*95\s*%\s*(?:CI|confidence interval)\s*[:,=]?\s*${RANGE})?`,
);
const PERCENTS = /(\d+(?:\.\d+)?)\s*%\s*(?:\([^)]{0,30}\)\s*)?(?:vs\.?|versus|compared with|compared to)\s*(\d+(?:\.\d+)?)\s*%/i;
const ACCURACY = /\b(AUC|area under the (?:ROC )?curve|sensitivity|specificity|accuracy)\b[^.\d]{0,25}?(\d+(?:\.\d+)?\s*%?)/i;
const SAMPLE =
  /\b(\d{1,3}(?:,\d{3})+|\d{2,6})\s+(patients|participants|subjects|cases|studies|trials|children|adults|women|men|implants|flaps|teeth)\b/i;
const N_EQUALS = /\bn\s*=\s*(\d[\d,]*)/i;

const dash = (s: string) => s.replace(/^[−–]/, '-');
const num = (s: string) => Number(dash(s));

/** The key number, structured so it can be drawn (components/KeyResultChart.tsx). */
export type KeyResult = (
  | { kind: 'effect'; measure: string; value: number; lo?: number; hi?: number }
  | { kind: 'compare'; a: number; b: number }
  | { kind: 'accuracy'; measure: string; value: number; percent: boolean }
  | { kind: 'count'; n: string; noun: string }
) & {
  /** As written in the abstract, e.g. "OR 0.53 (95% CI 0.41–0.69)". */
  label: string;
};

/** The sentence a match sits in, as context for a chart. */
export interface Found {
  result: KeyResult;
  sentence: string;
}

function sentenceAround(text: string, at: number) {
  const start = Math.max(text.lastIndexOf('. ', at) + 2, 0);
  const end = text.indexOf('. ', at);
  return text.slice(start === 1 ? 0 : start, end < 0 ? undefined : end + 1).trim();
}

/** The most telling number in a passage: an effect size, a % comparison, an accuracy figure, or the sample size. */
export function findKeyResult(text: string): Found | undefined {
  let m = EFFECT.exec(text);
  const found = (result: KeyResult): Found => ({ result, sentence: sentenceAround(text, m!.index) });
  if (m) {
    const ci = m[3] !== undefined ? { lo: num(m[3]), hi: num(m[4]) } : {};
    const label = `${m[1]} ${dash(m[2])}${m[3] !== undefined ? ` (95% CI ${dash(m[3])}–${dash(m[4])})` : ''}`;
    return found({ kind: 'effect', measure: m[1], value: num(m[2]), ...ci, label });
  }
  if ((m = PERCENTS.exec(text))) return found({ kind: 'compare', a: Number(m[1]), b: Number(m[2]), label: `${m[1]}% vs ${m[2]}%` });
  if ((m = ACCURACY.exec(text))) {
    const measure = /area under|auc/i.test(m[1]) ? 'AUC' : m[1].toLowerCase();
    const v = m[2].replace(/\s+/g, '');
    return found({ kind: 'accuracy', measure, value: parseFloat(v), percent: v.includes('%'), label: `${measure} ${v}` });
  }
  if ((m = SAMPLE.exec(text))) return found({ kind: 'count', n: m[1], noun: m[2].toLowerCase(), label: `${m[1]} ${m[2].toLowerCase()}` });
  if ((m = N_EQUALS.exec(text))) return found({ kind: 'count', n: m[1], noun: 'participants', label: `${m[1]} participants` });
  return undefined;
}

/** Sample sizes aren't drawn: the number says it all. */
export const canChart = (r?: KeyResult) => !!r && r.kind !== 'count';

export const keyNumber = (text: string) => {
  const f = findKeyResult(text);
  return f?.result.label;
};

export function quickTake(a: Pick<Article, 'abstract'>): QuickTake | undefined {
  const abstract = a.abstract?.trim();
  if (!abstract || words(abstract) < 25) return undefined;
  const secs = sections(abstract);
  const conclusion = secs.filter((s) => CONCLUSION.test(s.label)).map((s) => s.text).join(' ');
  const body = conclusion || secs.map((s) => s.text).join(' ');
  const parts = sentences(body);
  const text = trimToWords(conclusion ? parts : parts.slice(-2));
  const results = secs.filter((s) => RESULTS.test(s.label)).map((s) => s.text).join(' ');
  const found = (results && findKeyResult(results)) || findKeyResult(abstract);
  return found ? { text, keyNumber: found.result.label, result: found.result, context: found.sentence } : { text };
}
