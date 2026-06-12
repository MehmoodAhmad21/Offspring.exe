// Mendelian segregation + Monte Carlo core.
//
// All functions here are pure: given the same inputs (including the same seeded
// RNG sequence) they produce identical output, which makes the simulation
// reproducible and unit-testable.

import type {
  DiscreteTraitId,
  Genotype,
  ParentProfile,
  PhenotypeOutcome,
  RNG,
} from '../types';
import { DISCRETE_TRAITS, findOption } from '../data/traitDefinitions';

/**
 * mulberry32 — a tiny, fast, seedable PRNG. Returns a function producing
 * floats in [0, 1). Same seed => same sequence.
 */
export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one of the two alleles in a genotype at random. */
export function sampleAllele(genotype: Genotype, rng: RNG): string {
  return genotype[Math.floor(rng() * 2)];
}

/**
 * Run a Monte Carlo simulation of one discrete trait: for each trial, draw one
 * allele from each parent, classify the resulting pair into a phenotype, and
 * tally. Returns phenotype outcomes as percentages, sorted descending.
 */
export function runDiscreteTrait(
  parentA: Genotype,
  parentB: Genotype,
  phenotypeFn: (pair: Genotype) => string,
  trials: number,
  rng: RNG,
): PhenotypeOutcome[] {
  const counts: Record<string, number> = {};
  for (let i = 0; i < trials; i++) {
    const pair: Genotype = [
      sampleAllele(parentA, rng),
      sampleAllele(parentB, rng),
    ];
    const ph = phenotypeFn(pair);
    counts[ph] = (counts[ph] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, pct: (count / trials) * 100 }))
    .sort((a, b) => b.pct - a.pct);
}

/**
 * Run every discrete trait against both parents' chosen genotypes using one
 * shared RNG instance, so a single seed reproduces the whole batch.
 */
export function runAllDiscreteTraits(
  parentA: ParentProfile,
  parentB: ParentProfile,
  trials: number,
  rng: RNG,
): Record<DiscreteTraitId, PhenotypeOutcome[]> {
  const result = {} as Record<DiscreteTraitId, PhenotypeOutcome[]>;
  for (const trait of DISCRETE_TRAITS) {
    const a = findOption(trait.id, parentA.genotypes[trait.id]).pair;
    const b = findOption(trait.id, parentB.genotypes[trait.id]).pair;
    result[trait.id] = runDiscreteTrait(a, b, trait.phenotype, trials, rng);
  }
  return result;
}
