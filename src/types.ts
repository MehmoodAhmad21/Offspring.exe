// Shared types/interfaces for the Offspring.exe simulator.

/** A pseudo-random number generator returning a float in [0, 1). */
export type RNG = () => number;

/** Two allele symbols make a genotype. */
export type Genotype = [string, string];

/** Stable identifiers for each discrete (Mendelian) trait. */
export type DiscreteTraitId =
  | 'eyeColor'
  | 'hairColor'
  | 'hairTexture'
  | 'bloodType'
  | 'rhFactor'
  | 'faceShape';

/** A selectable genotype option presented in the UI. */
export interface GenotypeOption {
  /** Allele pair, e.g. ['B', 'g']. */
  pair: Genotype;
  /** Canonical genotype code, e.g. "Bg". */
  code: string;
  /** Resulting phenotype label, e.g. "Brown". */
  phenotype: string;
}

/** Full definition of one discrete trait. */
export interface DiscreteTraitDefinition {
  id: DiscreteTraitId;
  label: string;
  /** Genotype options the user can pick per parent. */
  options: GenotypeOption[];
  /** Maps an allele pair to a phenotype label. */
  phenotype: (pair: Genotype) => string;
  /** Default genotype code for parent A. */
  defaultA: string;
  /** Default genotype code for parent B. */
  defaultB: string;
}

/** One bucket of a discrete-trait probability distribution. */
export interface PhenotypeOutcome {
  label: string;
  pct: number;
}

/** A single parent's full input profile. */
export interface ParentProfile {
  genotypes: Record<DiscreteTraitId, string>; // code per trait
  heightCm: number;
  melaninIndex: number; // 1-100
  frameIndex: number; // 1-100
}

/** Summary statistics for a polygenic (continuous) trait. */
export interface PolygenicSummary {
  mean: number;
  sd: number;
  p10: number;
  p90: number;
  min: number;
  max: number;
  /** Raw samples (kept for histogram binning). */
  samples: number[];
}

/** A single histogram bin. */
export interface HistogramBin {
  /** Inclusive lower edge of the bin. */
  start: number;
  /** Exclusive upper edge of the bin. */
  end: number;
  count: number;
  pct: number;
}

/** The complete result of one simulation run. */
export interface SimulationResult {
  seed: number;
  trials: number;
  discrete: Record<DiscreteTraitId, PhenotypeOutcome[]>;
  height: PolygenicSummary;
  melanin: PolygenicSummary;
  frame: PolygenicSummary;
}

/** Parameters fully describing an avatar's appearance. */
export interface AvatarParams {
  skinHex: string;
  eyeColorHex: string;
  hairColorHex: string;
  hairTexture: 'curly' | 'wavy' | 'straight';
  faceShape: 'oval' | 'round' | 'square';
  heightCm: number;
  frameIndex: number; // 1-100
}
