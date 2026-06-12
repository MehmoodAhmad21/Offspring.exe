// Height distribution as a lightweight CSS bar chart (no chart library).
// Bars are 3cm bins; mean and 10th/90th percentile are called out.

import type { PolygenicSummary } from '../types';
import { histogram } from '../engine/polygenic';
import styles from './HeightHistogram.module.css';

interface HeightHistogramProps {
  summary: PolygenicSummary;
  binWidth?: number;
}

export function HeightHistogram({
  summary,
  binWidth = 3,
}: HeightHistogramProps) {
  const bins = histogram(summary.samples, binWidth);
  const maxPct = Math.max(...bins.map((b) => b.pct), 1);

  return (
    <div>
      <div className={styles.stats}>
        <Stat label="Mean" value={`${summary.mean.toFixed(1)} cm`} />
        <Stat
          label="10–90% range"
          value={`${summary.p10.toFixed(0)}–${summary.p90.toFixed(0)} cm`}
        />
        <Stat label="Std dev" value={`±${summary.sd.toFixed(1)} cm`} />
      </div>
      <div
        className={styles.chart}
        role="img"
        aria-label={`Height distribution, mean ${summary.mean.toFixed(
          1,
        )} centimeters`}
      >
        {bins.map((b) => {
          const inRange = b.start >= summary.p10 - binWidth && b.end <= summary.p90 + binWidth;
          const containsMean = summary.mean >= b.start && summary.mean < b.end;
          return (
            <div key={b.start} className={styles.col} title={`${b.start}–${b.end} cm: ${b.pct.toFixed(1)}%`}>
              <div className={styles.barWrap}>
                <div
                  className={`${styles.bar} ${containsMean ? styles.barMean : inRange ? styles.barIn : ''}`}
                  style={{ height: `${(b.pct / maxPct) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.axis}>
        <span>{bins[0]?.start ?? 0} cm</span>
        <span>{bins[bins.length - 1]?.end ?? 0} cm</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
