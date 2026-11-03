import { canChart, type KeyResult } from '../lib/quicktake';

/**
 * The key number, drawn: a forest-plot strip for effect sizes, two bars for a % comparison, a
 * gauge for accuracy. Drawn from the abstract's own figures, so it shows only what the authors
 * reported. Renders nothing for sample sizes (the number says it all).
 */
const W = 320;
const X0 = 18;
const X1 = W - 18;

const RATIO = /^(a?HR|a?OR|a?RR|IRR)$/;
const fmt = (n: number) => String(Math.round(n * 100) / 100);

function Effect({ r }: { r: Extract<KeyResult, { kind: 'effect' }> }) {
  const ratio = RATIO.test(r.measure);
  const nil = ratio ? 1 : 0;
  // Ratios on a log scale (0.5 and 2 sit equally far from 1); differences on a linear one.
  const t = (v: number) => (ratio ? Math.log(Math.max(v, 1e-3)) : v);
  const pts = [r.value, nil, r.lo, r.hi].filter((v): v is number => v !== undefined).map(t);
  let lo = Math.min(...pts);
  let hi = Math.max(...pts);
  const pad = (hi - lo || 1) * 0.25;
  lo -= pad;
  hi += pad;
  const x = (v: number) => X0 + ((t(v) - lo) / (hi - lo)) * (X1 - X0);
  const hasCi = r.lo !== undefined && r.hi !== undefined;
  const clear = hasCi && (r.lo! > nil || r.hi! < nil);
  return (
    <>
      <svg viewBox={`0 0 ${W} 74`} className="kr-svg" role="img" aria-label={`${r.label}. ${ratio ? '1' : '0'} means no difference.`}>
        <line x1={X0} x2={X1} y1={40} y2={40} className="kr-axis" />
        <line x1={x(nil)} x2={x(nil)} y1={14} y2={56} className="kr-nil" />
        <text x={x(nil)} y={70} className="kr-tick" textAnchor="middle">
          {nil} = no difference
        </text>
        {hasCi && (
          <>
            <rect x={x(r.lo!)} y={35} width={Math.max(x(r.hi!) - x(r.lo!), 2)} height={10} rx={5} className={`kr-ci kr-grow-c ${clear ? 'is-clear' : ''}`} />
            <text x={x(r.lo!)} y={30} className="kr-tick" textAnchor="middle">
              {fmt(r.lo!)}
            </text>
            <text x={x(r.hi!)} y={30} className="kr-tick" textAnchor="middle">
              {fmt(r.hi!)}
            </text>
          </>
        )}
        <circle cx={x(r.value)} cy={40} r={7} className={`kr-dot kr-pop ${clear ? 'is-clear' : ''}`} />
        <text x={x(r.value)} y={hasCi ? 14 : 28} className="kr-value" textAnchor="middle">
          {r.measure} {fmt(r.value)}
        </text>
      </svg>
      <p className="kr-verdict">
        {!hasCi
          ? 'No confidence interval given in the abstract.'
          : clear
            ? `Clear difference: the 95% CI doesn’t cross ${nil}.`
            : `No clear difference: the 95% CI crosses ${nil}.`}
      </p>
    </>
  );
}

function Bars({ r }: { r: Extract<KeyResult, { kind: 'compare' }> }) {
  const max = Math.max(r.a, r.b, 1) > 100 ? Math.max(r.a, r.b) : 100;
  const row = (v: number, y: number, cls: string, delay: number) => (
    <>
      <rect x={X0} y={y} width={X1 - X0 - 52} height={18} rx={9} className="kr-track" />
      <rect x={X0} y={y} width={Math.max(((X1 - X0 - 52) * v) / max, 4)} height={18} rx={9} className={`kr-bar ${cls} kr-grow`} style={{ animationDelay: `${delay}s` }} />
      <text x={X1} y={y + 14} className="kr-value" textAnchor="end">
        {v}%
      </text>
    </>
  );
  return (
    <svg viewBox={`0 0 ${W} 58`} className="kr-svg" role="img" aria-label={r.label}>
      {row(r.a, 6, 'kr-bar-a', 0)}
      {row(r.b, 34, 'kr-bar-b', 0.15)}
    </svg>
  );
}

function Gauge({ r }: { r: Extract<KeyResult, { kind: 'accuracy' }> }) {
  // AUC runs from 0.5 (chance) to 1 (perfect); percentages from 0 to 100.
  const auc = !r.percent && r.value <= 1;
  const [from, to] = auc ? [0.5, 1] : [0, 100];
  const share = Math.min(Math.max((r.value - from) / (to - from), 0), 1);
  const width = X1 - X0;
  return (
    <svg viewBox={`0 0 ${W} 56`} className="kr-svg" role="img" aria-label={r.label}>
      <text x={X0} y={14} className="kr-value">
        {r.measure} {r.value}
        {r.percent ? '%' : ''}
      </text>
      <rect x={X0} y={22} width={width} height={14} rx={7} className="kr-track" />
      <rect x={X0} y={22} width={Math.max(width * share, 4)} height={14} rx={7} className="kr-bar kr-bar-a kr-grow" />
      <text x={X0} y={52} className="kr-tick">
        {auc ? '0.5 chance' : '0%'}
      </text>
      <text x={X1} y={52} className="kr-tick" textAnchor="end">
        {auc ? '1.0 perfect' : '100%'}
      </text>
    </svg>
  );
}

export default function KeyResultChart({ result, context }: { result?: KeyResult; context?: string }) {
  if (!result || !canChart(result)) return null;
  return (
    <figure className="kr">
      <figcaption className="kr-head">Key result · {result.label}</figcaption>
      {result.kind === 'effect' && <Effect r={result} />}
      {result.kind === 'compare' && <Bars r={result} />}
      {result.kind === 'accuracy' && <Gauge r={result} />}
      {context && result.kind !== 'effect' && <p className="kr-context">{context}</p>}
    </figure>
  );
}
