// Collapsible "How this works" methodology disclosure (native <details>).

import styles from './Methodology.module.css';

export function Methodology() {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>How this works &amp; important caveats</summary>
      <div className={styles.body}>
        <h4>Mendelian inheritance — probabilities, not certainties</h4>
        <p>
          Each parent carries two copies (alleles) of every gene and passes one
          at random to a child. Because that hand-off is random, the offspring's
          traits follow a <em>probability distribution</em>, not a fixed
          outcome. This tool runs a Monte&nbsp;Carlo simulation
          ({' '}
          <span className={styles.mono}>20,000</span> simulated children by
          default) to estimate how likely each phenotype is. Re-running with the
          same inputs produces a fresh random draw, so percentages will wobble
          slightly each time.
        </p>

        <h4>These are deliberately simplified gene models</h4>
        <p>
          Eye color, hair color, hair texture, blood type, Rh factor and face
          shape are modeled here as single- or double-gene Mendelian traits with
          tidy dominance rules. <strong>Real human traits are far more
          complex</strong> — most involve many genes interacting, plus
          environmental influences. Face shape in particular is a pure
          visualization convenience, not a real single-gene trait. Treat all of
          this as an educational illustration of inheritance <em>concepts</em>,
          not a biological prediction.
        </p>

        <h4>Height, skin tone and build use statistical distributions</h4>
        <p>
          These polygenic traits are modeled with a mid-parent value plus
          Gaussian variance (reflecting how many small genetic contributions
          average out around the parents' midpoint). We report a mean and a
          range rather than a single value, because that is how polygenic
          inheritance actually behaves.
        </p>

        <h4>The avatar is a stylized illustration</h4>
        <p>
          The figure is generated from a fixed set of shape and color parameters
          driven by the simulation — it is <strong>not</strong> a photorealistic
          prediction and is <strong>not</strong> intended to resemble any real
          person. No AI image generation, photos, or genomic data are used.
        </p>

        <p className={styles.disclaimer}>
          For education and curiosity only. This tool makes no medical,
          diagnostic, or reproductive predictions.
        </p>
      </div>
    </details>
  );
}
