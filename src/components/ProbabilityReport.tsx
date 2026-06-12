// The full probability report: one card per discrete trait (probability bars),
// a height histogram card, and skin-tone / build distribution cards.

import type { DiscreteTraitId, SimulationResult } from '../types';
import { DISCRETE_TRAITS, SKIN_TONE_RAMP } from '../data/traitDefinitions';
import { ProbabilityBar } from './ProbabilityBar';
import { HeightHistogram } from './HeightHistogram';
import styles from './ProbabilityReport.module.css';

interface ProbabilityReportProps {
  result: SimulationResult;
}

// Distinct colors so multiple outcomes in one card are visually separable.
const BAR_PALETTE = ['#3B6E91', '#7FA98E', '#D4A24E', '#9A6FB0', '#C56B5C'];

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {subtitle && <span className={styles.cardSub}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

/** A 1–100 index distribution bar with gradient, ±1σ band and a mean marker. */
function IndexBar({
  gradient,
  mean,
  sd,
  leftLabel,
  rightLabel,
  valueText,
}: {
  gradient: string;
  mean: number;
  sd: number;
  leftLabel: string;
  rightLabel: string;
  valueText: string;
}) {
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - 1) / 99) * 100));
  const meanPos = pos(mean);
  const lo = pos(mean - sd);
  const hi = pos(mean + sd);

  return (
    <div>
      <div className={styles.rampBar} style={{ background: gradient }}>
        <div
          className={styles.rampBand}
          style={{ left: `${lo}%`, width: `${hi - lo}%` }}
        />
        <div className={styles.rampMarker} style={{ left: `${meanPos}%` }} />
      </div>
      <div className={styles.rampAxis}>
        <span>{leftLabel}</span>
        <span className={styles.rampValue}>{valueText}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export function ProbabilityReport({ result }: ProbabilityReportProps) {
  const skinGradient = `linear-gradient(90deg, ${SKIN_TONE_RAMP.join(', ')})`;
  const frameGradient =
    'linear-gradient(90deg, #cfd6da 0%, #9fb0bb 50%, #5d7682 100%)';

  return (
    <div className={styles.report}>
      {DISCRETE_TRAITS.map((trait) => {
        const outcomes = result.discrete[trait.id as DiscreteTraitId];
        return (
          <Card key={trait.id} title={trait.label}>
            {outcomes.map((o, i) => (
              <ProbabilityBar
                key={o.label}
                label={o.label}
                pct={o.pct}
                color={BAR_PALETTE[i % BAR_PALETTE.length]}
              />
            ))}
          </Card>
        );
      })}

      <Card title="Height" subtitle="3 cm bins">
        <HeightHistogram summary={result.height} />
      </Card>

      <Card title="Skin tone" subtitle="melanin index 1–100">
        <IndexBar
          gradient={skinGradient}
          mean={result.melanin.mean}
          sd={result.melanin.sd}
          leftLabel="Light"
          rightLabel="Deep"
          valueText={`mean ${result.melanin.mean.toFixed(0)} ± ${result.melanin.sd.toFixed(
            0,
          )}`}
        />
      </Card>

      <Card title="Build" subtitle="frame index 1–100">
        <IndexBar
          gradient={frameGradient}
          mean={result.frame.mean}
          sd={result.frame.sd}
          leftLabel="Slim"
          rightLabel="Broad"
          valueText={`mean ${result.frame.mean.toFixed(0)} ± ${result.frame.sd.toFixed(
            0,
          )}`}
        />
      </Card>
    </div>
  );
}
