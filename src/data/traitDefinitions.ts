// All genotype tables, dominance rules, and visual ramps live here.
//
// NOTE ON BIOLOGICAL SIMPLIFICATION:
// Every "trait" below is a deliberately simplified single- or double-gene
// Mendelian model. Real human traits (eye color, hair color, face shape, skin
// tone, height, build) are polygenic and influenced by environment. These
// models exist for education and visualization only — see the "How this works"
// methodology disclosure in the UI.

import type {
  DiscreteTraitDefinition,
  DiscreteTraitId,
  Genotype,
  GenotypeOption,
} from '../types';

/** Helper: build a GenotypeOption from a pair + a phenotype function. */
function opt(pair: Genotype, phenotype: (p: Genotype) => string): GenotypeOption {
  return { pair, code: pair.join(''), phenotype: phenotype(pair) };
}

// --- Phenotype functions (pure dominance rules) ---------------------------

/** Eye color — dominance order B (brown) > g (green) > b (blue). */
export function eyeColorPhenotype(pair: Genotype): string {
  if (pair.includes('B')) return 'Brown';
  if (pair.includes('g')) return 'Green';
  return 'Blue';
}

/**
 * Hair color — alleles D (dark) > l (light) > r (red-carrier).
 * r/r is the recessive red exception; one l with one r gives a
 * light-brown/strawberry blend.
 */
export function hairColorPhenotype(pair: Genotype): string {
  if (pair.includes('D')) return 'Dark brown/black';
  if (pair[0] === 'r' && pair[1] === 'r') return 'Red';
  if (pair.includes('l') && pair.includes('r')) return 'Light brown/strawberry';
  return 'Blonde';
}

/** ABO blood type — A and B co-dominant, O recessive. */
export function bloodTypePhenotype(pair: Genotype): string {
  const hasA = pair.includes('A');
  const hasB = pair.includes('B');
  if (hasA && hasB) return 'AB';
  if (hasA) return 'A';
  if (hasB) return 'B';
  return 'O';
}

/** Rh factor — '+' dominant over '-'. */
export function rhFactorPhenotype(pair: Genotype): string {
  return pair.includes('+') ? 'Rh+' : 'Rh-';
}

/** Hair texture — C (curly) > w (wavy) > s (straight). */
export function hairTexturePhenotype(pair: Genotype): string {
  if (pair.includes('C')) return 'Curly';
  if (pair.includes('w')) return 'Wavy';
  return 'Straight';
}

/**
 * Face shape — alleles O (oval) > r (round) > q (square).
 * Deliberate simplification for avatar visualization only.
 */
export function faceShapePhenotype(pair: Genotype): string {
  if (pair.includes('O')) return 'Oval';
  if (pair.includes('r')) return 'Round';
  return 'Square';
}

// --- Trait definitions -----------------------------------------------------

export const DISCRETE_TRAITS: DiscreteTraitDefinition[] = [
  {
    id: 'eyeColor',
    label: 'Eye color',
    phenotype: eyeColorPhenotype,
    options: (
      [
        ['B', 'B'],
        ['B', 'g'],
        ['B', 'b'],
        ['g', 'g'],
        ['g', 'b'],
        ['b', 'b'],
      ] as Genotype[]
    ).map((p) => opt(p, eyeColorPhenotype)),
    defaultA: 'Bg',
    defaultB: 'gb',
  },
  {
    id: 'hairColor',
    label: 'Hair color',
    phenotype: hairColorPhenotype,
    options: (
      [
        ['D', 'D'],
        ['D', 'l'],
        ['D', 'r'],
        ['l', 'l'],
        ['l', 'r'],
        ['r', 'r'],
      ] as Genotype[]
    ).map((p) => opt(p, hairColorPhenotype)),
    defaultA: 'Dl',
    defaultB: 'lr',
  },
  {
    id: 'hairTexture',
    label: 'Hair texture',
    phenotype: hairTexturePhenotype,
    options: (
      [
        ['C', 'C'],
        ['C', 'w'],
        ['C', 's'],
        ['w', 'w'],
        ['w', 's'],
        ['s', 's'],
      ] as Genotype[]
    ).map((p) => opt(p, hairTexturePhenotype)),
    defaultA: 'Cw',
    defaultB: 'ws',
  },
  {
    id: 'bloodType',
    label: 'Blood type (ABO)',
    phenotype: bloodTypePhenotype,
    options: (
      [
        ['A', 'A'],
        ['A', 'O'],
        ['B', 'B'],
        ['B', 'O'],
        ['A', 'B'],
        ['O', 'O'],
      ] as Genotype[]
    ).map((p) => opt(p, bloodTypePhenotype)),
    defaultA: 'AO',
    defaultB: 'BO',
  },
  {
    id: 'rhFactor',
    label: 'Rh factor',
    phenotype: rhFactorPhenotype,
    options: (
      [
        ['+', '+'],
        ['+', '-'],
        ['-', '-'],
      ] as Genotype[]
    ).map((p) => opt(p, rhFactorPhenotype)),
    defaultA: '+-',
    defaultB: '+-',
  },
  {
    id: 'faceShape',
    label: 'Face shape',
    phenotype: faceShapePhenotype,
    options: (
      [
        ['O', 'O'],
        ['O', 'r'],
        ['O', 'q'],
        ['r', 'r'],
        ['r', 'q'],
        ['q', 'q'],
      ] as Genotype[]
    ).map((p) => opt(p, faceShapePhenotype)),
    defaultA: 'Or',
    defaultB: 'rq',
  },
];

/** Convenience lookup by trait id. */
export const DISCRETE_TRAIT_MAP: Record<DiscreteTraitId, DiscreteTraitDefinition> =
  Object.fromEntries(DISCRETE_TRAITS.map((t) => [t.id, t])) as Record<
    DiscreteTraitId,
    DiscreteTraitDefinition
  >;

/**
 * Find a genotype option by its code within a trait. Falls back to the first
 * option if an unknown code is supplied (defensive — should not happen via UI).
 */
export function findOption(
  traitId: DiscreteTraitId,
  code: string,
): GenotypeOption {
  const def = DISCRETE_TRAIT_MAP[traitId];
  return def.options.find((o) => o.code === code) ?? def.options[0];
}

/**
 * Build a human-readable option label, e.g. "Brown / Green (Bg)".
 * For heterozygous genotypes where one allele is cleanly dominant, the carried
 * recessive phenotype is shown after a slash for educational clarity. For
 * co-dominant / blended cases only the expressed phenotype is shown.
 */
export function buildGenotypeLabel(
  trait: DiscreteTraitDefinition,
  option: GenotypeOption,
): string {
  const pairPheno = option.phenotype;
  const [a0, a1] = option.pair;
  if (a0 === a1) return `${pairPheno} (${option.code})`;

  const solo0 = trait.phenotype([a0, a0]);
  const solo1 = trait.phenotype([a1, a1]);
  const carried: string[] = [];
  if (solo0 !== pairPheno) carried.push(solo0);
  if (solo1 !== pairPheno) carried.push(solo1);

  // Only annotate the clean "expressed / carried" case (exactly one differs).
  if (carried.length === 1) {
    return `${pairPheno} / ${carried[0]} (${option.code})`;
  }
  return `${pairPheno} (${option.code})`;
}

// --- Visual ramps & color maps --------------------------------------------

/**
 * 10 skin-tone swatches from light to deep, evenly spaced. Used to render the
 * skin-tone ramp and to map a melanin index to a fill color.
 */
export const SKIN_TONE_RAMP: string[] = [
  '#F7E0C8',
  '#F1D2B0',
  '#E8BE97',
  '#DBA77B',
  '#C98F62',
  '#B0764C',
  '#945E39',
  '#76482A',
  '#5A361F',
  '#3F2516',
];

/** Eye phenotype -> iris hex. */
export const EYE_COLOR_HEX: Record<string, string> = {
  Brown: '#6B4423',
  Green: '#5B8C5A',
  Blue: '#6FA8C9',
};

/** Hair phenotype -> hair hex. */
export const HAIR_COLOR_HEX: Record<string, string> = {
  'Dark brown/black': '#2B1B12',
  Blonde: '#D9B97A',
  Red: '#A8512E',
  'Light brown/strawberry': '#B8845A',
};

/** Map a melanin index (1-100) to a swatch index (0-9). */
export function melaninIndexToSwatch(index: number): number {
  const clamped = Math.max(1, Math.min(100, index));
  // 1..100 -> 0..9
  return Math.min(SKIN_TONE_RAMP.length - 1, Math.floor((clamped - 1) / 10));
}

/** Map a melanin index (1-100) directly to a hex swatch. */
export function melaninIndexToHex(index: number): string {
  return SKIN_TONE_RAMP[melaninIndexToSwatch(index)];
}

// --- Simulation constants --------------------------------------------------

/** Default Monte Carlo trial count. */
export const DEFAULT_TRIALS = 20000;

/** Height slider bounds (cm). */
export const HEIGHT_MIN = 140;
export const HEIGHT_MAX = 210;

/** Polygenic noise standard deviations. */
export const HEIGHT_SD = 6.5; // cm
export const MELANIN_SD = 8;
export const FRAME_SD = 12;
