// One parent's full input panel: a genotype selector per discrete trait, plus
// height, skin-tone and build sliders.

import type { DiscreteTraitId, ParentProfile } from '../types';
import { DISCRETE_TRAITS, HEIGHT_MIN, HEIGHT_MAX, melaninIndexToHex } from '../data/traitDefinitions';
import { TraitSelector } from './TraitSelector';
import styles from './ParentPanel.module.css';

interface ParentPanelProps {
  title: string;
  accent: string;
  profile: ParentProfile;
  onChange: (next: ParentProfile) => void;
  idPrefix: string;
}

export function ParentPanel({
  title,
  accent,
  profile,
  onChange,
  idPrefix,
}: ParentPanelProps) {
  const setGenotype = (id: DiscreteTraitId, code: string) =>
    onChange({ ...profile, genotypes: { ...profile.genotypes, [id]: code } });

  const swatch = melaninIndexToHex(profile.melaninIndex);

  return (
    <section className={styles.panel} aria-label={title}>
      <header className={styles.header}>
        <span className={styles.dot} style={{ background: accent }} />
        <h2 className={styles.title}>{title}</h2>
      </header>

      <div className={styles.grid}>
        {DISCRETE_TRAITS.map((trait) => (
          <TraitSelector
            key={trait.id}
            trait={trait}
            value={profile.genotypes[trait.id]}
            onChange={(code) => setGenotype(trait.id, code)}
            idPrefix={idPrefix}
          />
        ))}
      </div>

      <div className={styles.sliders}>
        <div className={styles.sliderField}>
          <div className={styles.sliderHead}>
            <label htmlFor={`${idPrefix}-height`}>Height</label>
            <span className={styles.value}>{profile.heightCm} cm</span>
          </div>
          <input
            id={`${idPrefix}-height`}
            type="range"
            min={HEIGHT_MIN}
            max={HEIGHT_MAX}
            value={profile.heightCm}
            onChange={(e) =>
              onChange({ ...profile, heightCm: Number(e.target.value) })
            }
          />
        </div>

        <div className={styles.sliderField}>
          <div className={styles.sliderHead}>
            <label htmlFor={`${idPrefix}-melanin`}>Skin tone (melanin index)</label>
            <span className={styles.swatchRow}>
              <span
                className={styles.swatch}
                style={{ background: swatch }}
                aria-hidden="true"
              />
              <span className={styles.value}>{profile.melaninIndex}</span>
            </span>
          </div>
          <input
            id={`${idPrefix}-melanin`}
            type="range"
            min={1}
            max={100}
            value={profile.melaninIndex}
            onChange={(e) =>
              onChange({ ...profile, melaninIndex: Number(e.target.value) })
            }
          />
        </div>

        <div className={styles.sliderField}>
          <div className={styles.sliderHead}>
            <label htmlFor={`${idPrefix}-frame`}>Build (frame index)</label>
            <span className={styles.value}>{profile.frameIndex}</span>
          </div>
          <input
            id={`${idPrefix}-frame`}
            type="range"
            min={1}
            max={100}
            value={profile.frameIndex}
            onChange={(e) =>
              onChange({ ...profile, frameIndex: Number(e.target.value) })
            }
          />
        </div>
      </div>
    </section>
  );
}
