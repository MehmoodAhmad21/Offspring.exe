import { describe, it, expect } from 'vitest';
import { mulberry32, runDiscreteTrait, sampleAllele } from './inheritance';
import {
  eyeColorPhenotype,
  hairColorPhenotype,
  bloodTypePhenotype,
  rhFactorPhenotype,
  hairTexturePhenotype,
  faceShapePhenotype,
} from '../data/traitDefinitions';
import {
  gaussian,
  percentile,
  simulateHeight,
  simulateIndex,
  summarize,
  histogram,
} from './polygenic';
import type { Genotype, PhenotypeOutcome } from '../types';

const pct = (outcomes: PhenotypeOutcome[], label: string): number =>
  outcomes.find((o) => o.label === label)?.pct ?? 0;

const sumPct = (outcomes: PhenotypeOutcome[]): number =>
  outcomes.reduce((s, o) => s + o.pct, 0);

describe('mulberry32 PRNG', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces floats in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('sampleAllele', () => {
  it('only ever returns one of the two alleles', () => {
    const rng = mulberry32(99);
    const g: Genotype = ['A', 'O'];
    for (let i = 0; i < 200; i++) {
      expect(g).toContain(sampleAllele(g, rng));
    }
  });
});

describe('runDiscreteTrait — distributions sum to ~100', () => {
  it('percentages always sum to ~100', () => {
    const rng = mulberry32(2024);
    const out = runDiscreteTrait(['B', 'g'], ['g', 'b'], eyeColorPhenotype, 20000, rng);
    expect(sumPct(out)).toBeCloseTo(100, 6);
  });
});

describe('runDiscreteTrait — known certain outcomes', () => {
  it('bb x bb -> 100% Blue eyes', () => {
    const rng = mulberry32(1);
    const out = runDiscreteTrait(['b', 'b'], ['b', 'b'], eyeColorPhenotype, 5000, rng);
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('Blue');
    expect(out[0].pct).toBe(100);
  });

  it('rr x rr -> 100% Red hair', () => {
    const rng = mulberry32(2);
    const out = runDiscreteTrait(['r', 'r'], ['r', 'r'], hairColorPhenotype, 5000, rng);
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('Red');
    expect(out[0].pct).toBe(100);
  });

  it('OO x OO -> 100% blood type O', () => {
    const rng = mulberry32(3);
    const out = runDiscreteTrait(['O', 'O'], ['O', 'O'], bloodTypePhenotype, 5000, rng);
    expect(out[0].label).toBe('O');
    expect(out[0].pct).toBe(100);
  });

  it('-- x -- -> 100% Rh-', () => {
    const rng = mulberry32(4);
    const out = runDiscreteTrait(['-', '-'], ['-', '-'], rhFactorPhenotype, 5000, rng);
    expect(out[0].label).toBe('Rh-');
    expect(out[0].pct).toBe(100);
  });

  it('ss x ss -> 100% Straight hair', () => {
    const rng = mulberry32(5);
    const out = runDiscreteTrait(['s', 's'], ['s', 's'], hairTexturePhenotype, 5000, rng);
    expect(out[0].label).toBe('Straight');
    expect(out[0].pct).toBe(100);
  });

  it('qq x qq -> 100% Square face', () => {
    const rng = mulberry32(6);
    const out = runDiscreteTrait(['q', 'q'], ['q', 'q'], faceShapePhenotype, 5000, rng);
    expect(out[0].label).toBe('Square');
    expect(out[0].pct).toBe(100);
  });
});

describe('runDiscreteTrait — expected Mendelian ratios (approx.)', () => {
  it('Bb x Bb -> ~75% Brown, ~25% Blue', () => {
    const rng = mulberry32(424242);
    const out = runDiscreteTrait(['B', 'b'], ['B', 'b'], eyeColorPhenotype, 40000, rng);
    expect(pct(out, 'Brown')).toBeGreaterThan(72);
    expect(pct(out, 'Brown')).toBeLessThan(78);
    expect(pct(out, 'Blue')).toBeGreaterThan(22);
    expect(pct(out, 'Blue')).toBeLessThan(28);
  });

  it('AO x BO -> ~25% each of A, B, AB, O', () => {
    const rng = mulberry32(777);
    const out = runDiscreteTrait(['A', 'O'], ['B', 'O'], bloodTypePhenotype, 40000, rng);
    for (const label of ['A', 'B', 'AB', 'O']) {
      expect(pct(out, label)).toBeGreaterThan(21);
      expect(pct(out, label)).toBeLessThan(29);
    }
  });
});

describe('dominance phenotype rules', () => {
  it('eye color follows B > g > b', () => {
    expect(eyeColorPhenotype(['B', 'b'])).toBe('Brown');
    expect(eyeColorPhenotype(['g', 'b'])).toBe('Green');
    expect(eyeColorPhenotype(['b', 'b'])).toBe('Blue');
  });

  it('hair color handles the red exception and strawberry blend', () => {
    expect(hairColorPhenotype(['D', 'r'])).toBe('Dark brown/black');
    expect(hairColorPhenotype(['r', 'r'])).toBe('Red');
    expect(hairColorPhenotype(['l', 'r'])).toBe('Light brown/strawberry');
    expect(hairColorPhenotype(['l', 'l'])).toBe('Blonde');
  });

  it('blood type treats A and B as co-dominant', () => {
    expect(bloodTypePhenotype(['A', 'B'])).toBe('AB');
    expect(bloodTypePhenotype(['A', 'O'])).toBe('A');
    expect(bloodTypePhenotype(['B', 'O'])).toBe('B');
    expect(bloodTypePhenotype(['O', 'O'])).toBe('O');
  });
});

describe('polygenic helpers', () => {
  it('gaussian samples have ~0 mean and ~1 sd over many draws', () => {
    const rng = mulberry32(31337);
    const n = 50000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const z = gaussian(rng);
      sum += z;
      sumSq += z * z;
    }
    const mean = sum / n;
    const sd = Math.sqrt(sumSq / n - mean * mean);
    expect(Math.abs(mean)).toBeLessThan(0.05);
    expect(sd).toBeGreaterThan(0.95);
    expect(sd).toBeLessThan(1.05);
  });

  it('percentile interpolates a sorted array', () => {
    const arr = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(arr, 0)).toBe(0);
    expect(percentile(arr, 100)).toBe(100);
    expect(percentile(arr, 50)).toBeCloseTo(50, 5);
  });

  it('simulateHeight centers on the mid-parent value', () => {
    const rng = mulberry32(555);
    const samples = simulateHeight(180, 160, 30000, rng, 6.5);
    const s = summarize(samples);
    expect(s.mean).toBeGreaterThan(168);
    expect(s.mean).toBeLessThan(172);
    expect(s.p10).toBeLessThan(s.mean);
    expect(s.p90).toBeGreaterThan(s.mean);
  });

  it('simulateIndex clamps to [1, 100]', () => {
    const rng = mulberry32(8);
    const low = simulateIndex(1, 1, 5000, rng, 12);
    const high = simulateIndex(100, 100, 5000, rng, 12);
    expect(Math.min(...low)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...high)).toBeLessThanOrEqual(100);
  });

  it('histogram bins cover all samples', () => {
    const rng = mulberry32(9);
    const samples = simulateHeight(175, 175, 10000, rng, 6.5);
    const bins = histogram(samples, 3);
    const total = bins.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(samples.length);
    expect(bins.reduce((s, b) => s + b.pct, 0)).toBeCloseTo(100, 6);
  });
});
