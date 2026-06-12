// A labelled <select> for one discrete trait, showing phenotype + genotype
// code per option (e.g. "Brown / Green (Bg)").

import type { DiscreteTraitDefinition } from '../types';
import { buildGenotypeLabel } from '../data/traitDefinitions';
import styles from './TraitSelector.module.css';

interface TraitSelectorProps {
  trait: DiscreteTraitDefinition;
  value: string;
  onChange: (code: string) => void;
  idPrefix: string;
}

export function TraitSelector({
  trait,
  value,
  onChange,
  idPrefix,
}: TraitSelectorProps) {
  const id = `${idPrefix}-${trait.id}`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {trait.label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {trait.options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {buildGenotypeLabel(trait, opt)}
          </option>
        ))}
      </select>
    </div>
  );
}
