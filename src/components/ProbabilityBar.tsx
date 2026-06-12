// A single horizontal probability bar: label left, percentage right in
// monospace, thin rounded fill below.

import styles from './ProbabilityBar.module.css';

interface ProbabilityBarProps {
  label: string;
  pct: number;
  color?: string;
}

export function ProbabilityBar({ label, pct, color }: ProbabilityBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={styles.row}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.pct}>{pct.toFixed(1)}%</span>
      </div>
      <div
        className={styles.track}
        role="meter"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct.toFixed(1)} percent`}
      >
        <div
          className={styles.fill}
          style={{ width: `${clamped}%`, background: color ?? '#3B6E91' }}
        />
      </div>
    </div>
  );
}
