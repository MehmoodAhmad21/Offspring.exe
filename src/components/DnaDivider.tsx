// Decorative DNA-strand divider between the input and results sections.

import styles from './DnaDivider.module.css';

interface DnaDividerProps {
  label?: string;
}

export function DnaDivider({ label }: DnaDividerProps) {
  // Build two sine strands and connecting rungs across a wide viewBox.
  const width = 600;
  const height = 40;
  const mid = height / 2;
  const amp = 12;
  const periods = 6;
  const step = width / (periods * 12);

  const strandA: string[] = [];
  const strandB: string[] = [];
  for (let x = 0; x <= width; x += step) {
    const phase = (x / width) * periods * 2 * Math.PI;
    const ya = mid + Math.sin(phase) * amp;
    const yb = mid - Math.sin(phase) * amp;
    strandA.push(`${x === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ya.toFixed(1)}`);
    strandB.push(`${x === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yb.toFixed(1)}`);
  }

  const rungs: { x: number; y1: number; y2: number }[] = [];
  for (let i = 0; i <= periods * 4; i++) {
    const x = (i / (periods * 4)) * width;
    const phase = (x / width) * periods * 2 * Math.PI;
    rungs.push({
      x,
      y1: mid + Math.sin(phase) * amp,
      y2: mid - Math.sin(phase) * amp,
    });
  }

  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="presentation"
      >
        {rungs.map((r, i) => (
          <line
            key={i}
            x1={r.x}
            y1={r.y1}
            x2={r.x}
            y2={r.y2}
            stroke="#7FA98E"
            strokeWidth={1.4}
            opacity={0.55}
          />
        ))}
        <path d={strandA.join(' ')} fill="none" stroke="#3B6E91" strokeWidth={2} />
        <path d={strandB.join(' ')} fill="none" stroke="#1B2838" strokeWidth={2} />
      </svg>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
