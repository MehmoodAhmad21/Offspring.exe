// Offspring.exe — top-level app. Holds both parent profiles, runs the simulation on
// explicit button press, and renders the avatar + probability report.

import { useMemo, useState } from 'react';
import type { AvatarParams, ParentProfile, SimulationResult } from './types';
import { DISCRETE_TRAITS } from './data/traitDefinitions';
import { runSimulation } from './engine/simulation';
import { mulberry32 } from './engine/inheritance';
import { mapCompositeAvatar, sampleVariationAvatar } from './engine/avatarMapper';
import { ParentPanel } from './components/ParentPanel';
import { DnaDivider } from './components/DnaDivider';
import { AvatarRenderer } from './components/AvatarRenderer';
import { ProbabilityReport } from './components/ProbabilityReport';
import { Methodology } from './components/Methodology';
import styles from './App.module.css';

function defaultProfile(which: 'A' | 'B'): ParentProfile {
  const genotypes = Object.fromEntries(
    DISCRETE_TRAITS.map((t) => [t.id, which === 'A' ? t.defaultA : t.defaultB]),
  ) as ParentProfile['genotypes'];
  return which === 'A'
    ? { genotypes, heightCm: 178, melaninIndex: 35, frameIndex: 58 }
    : { genotypes, heightCm: 165, melaninIndex: 55, frameIndex: 42 };
}

type AvatarView =
  | { kind: 'composite' }
  | { kind: 'variation'; params: AvatarParams; index: number };

export default function App() {
  const [parentA, setParentA] = useState<ParentProfile>(() => defaultProfile('A'));
  const [parentB, setParentB] = useState<ParentProfile>(() => defaultProfile('B'));
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState<AvatarView>({ kind: 'composite' });

  const compositeAvatar = useMemo<AvatarParams | null>(
    () => (result ? mapCompositeAvatar(result) : null),
    [result],
  );

  const runOnce = () => {
    const seed = Date.now() >>> 0;
    setResult(runSimulation(parentA, parentB, seed));
    setDirty(false);
    setView({ kind: 'composite' });
  };

  const regenerateVariation = () => {
    if (!result) return;
    const rng = mulberry32((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
    const params = sampleVariationAvatar(result, rng);
    setView((prev) => ({
      kind: 'variation',
      params,
      index: prev.kind === 'variation' ? prev.index + 1 : 1,
    }));
  };

  const onChangeA = (next: ParentProfile) => {
    setParentA(next);
    if (result) setDirty(true);
  };
  const onChangeB = (next: ParentProfile) => {
    setParentB(next);
    if (result) setDirty(true);
  };

  const shownAvatar =
    view.kind === 'variation' ? view.params : compositeAvatar;

  return (
    <div className={styles.app}>
      <header className={styles.masthead}>
        <div className={styles.brand}>
          <img src="/dna.svg" alt="" className={styles.logo} width={36} height={36} />
          <div>
            <h1 className={styles.h1}>Offspring.exe</h1>
            <p className={styles.tagline}>
              Offspring trait simulator &middot; Mendelian &amp; polygenic
              inheritance
            </p>
          </div>
        </div>
        <span className={styles.badge}>Educational model</span>
      </header>

      <div className={styles.parents}>
        <ParentPanel
          title="Parent A"
          accent="#3B6E91"
          profile={parentA}
          onChange={onChangeA}
          idPrefix="pa"
        />
        <ParentPanel
          title="Parent B"
          accent="#7FA98E"
          profile={parentB}
          onChange={onChangeB}
          idPrefix="pb"
        />
      </div>

      <div className={styles.runRow}>
        <button className={styles.runBtn} onClick={runOnce}>
          {result ? 'Re-run simulation' : 'Run simulation'}
        </button>
        {dirty && (
          <span className={styles.dirty} role="status">
            Inputs changed — re-run to update results
          </span>
        )}
        {result && !dirty && (
          <span className={styles.meta}>
            {result.trials.toLocaleString()} trials · seed{' '}
            <code>{result.seed}</code>
          </span>
        )}
      </div>

      <DnaDivider label={result ? 'Results' : 'Awaiting run'} />

      {!result || !shownAvatar ? (
        <div className={styles.empty}>
          <p>
            Set each parent's genotypes and measurements above, then press{' '}
            <strong>Run simulation</strong> to model 20,000 possible offspring.
          </p>
        </div>
      ) : (
        <div className={styles.results}>
          <section className={styles.avatarCol} aria-label="Predicted offspring avatar">
            <AvatarRenderer
              params={shownAvatar}
              title={
                view.kind === 'variation'
                  ? 'Sampled individual offspring'
                  : 'Most probable composite offspring'
              }
            />
            <p className={styles.caption}>
              {view.kind === 'variation'
                ? `Sampled individual #${view.index} — one random draw per trait`
                : 'Most probable offspring — generated from highest-probability trait outcomes'}
            </p>
            <div className={styles.avatarBtns}>
              <button className={styles.secondaryBtn} onClick={regenerateVariation}>
                Regenerate variation
              </button>
              {view.kind === 'variation' && (
                <button
                  className={styles.linkBtn}
                  onClick={() => setView({ kind: 'composite' })}
                >
                  Back to most-probable
                </button>
              )}
            </div>
          </section>

          <section className={styles.reportCol} aria-label="Probability report">
            <ProbabilityReport result={result} />
          </section>
        </div>
      )}

      <Methodology />

      <footer className={styles.footer}>
        <span>
          Offspring.exe · client-side simulation · no data leaves your browser
        </span>
      </footer>
    </div>
  );
}
