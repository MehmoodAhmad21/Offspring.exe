// Polygenic (continuous) trait models: height, skin tone (melanin index),
// and build (frame index). Each uses a mid-parent value plus Gaussian noise,
// approximating the additive variance left after heritability.

import type { HistogramBin, PolygenicSummary, RNG } from '../types';

/**
 * Draw one standard-normal sample via the Box-Muller transform.
 * u1 is guarded away from 0 to avoid log(0) = -Infinity.
 */
export function gaussian(rng: RNG): number {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Height — mid-parental model with residual sd (~heritability 0.8). */
export function simulateHeight(
  fatherCm: number,
  motherCm: number,
  trials: number,
  rng: RNG,
  sd = 6.5,
): number[] {
  const mid = (fatherCm + motherCm) / 2;
  const samples: number[] = new Array(trials);
  for (let i = 0; i < trials; i++) {
    samples[i] = mid + gaussian(rng) * sd;
  }
  return samples;
}

/**
 * Generic mid-parent + Gaussian-noise index model, clamped to [1, 100].
 * Used for both skin-tone (melanin) and build (frame) indices.
 */
export function simulateIndex(
  parentA: number,
  parentB: number,
  trials: number,
  rng: RNG,
  sd: number,
): number[] {
  const mid = (parentA + parentB) / 2;
  const samples: number[] = new Array(trials);
  for (let i = 0; i < trials; i++) {
    const v = mid + gaussian(rng) * sd;
    samples[i] = Math.max(1, Math.min(100, v));
  }
  return samples;
}

/** Sorted-array percentile (linear interpolation between ranks). */
export function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return NaN;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const rank = (p / 100) * (sortedAsc.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sortedAsc[lo];
  const frac = rank - lo;
  return sortedAsc[lo] * (1 - frac) + sortedAsc[hi] * frac;
}

/** Compute mean/sd/percentiles for a set of samples. */
export function summarize(samples: number[]): PolygenicSummary {
  const n = samples.length;
  const mean = samples.reduce((s, v) => s + v, 0) / n;
  const variance =
    samples.reduce((s, v) => s + (v - mean) * (v - mean), 0) / n;
  const sd = Math.sqrt(variance);
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    mean,
    sd,
    p10: percentile(sorted, 10),
    p90: percentile(sorted, 90),
    min: sorted[0],
    max: sorted[n - 1],
    samples,
  };
}

/**
 * Bin samples into fixed-width buckets. Bins span from the floored min to the
 * ceiled max, aligned to multiples of binWidth.
 */
export function histogram(samples: number[], binWidth: number): HistogramBin[] {
  if (samples.length === 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const v of samples) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const start = Math.floor(min / binWidth) * binWidth;
  const end = Math.ceil(max / binWidth) * binWidth;
  const binCount = Math.max(1, Math.round((end - start) / binWidth));
  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    bins.push({
      start: start + i * binWidth,
      end: start + (i + 1) * binWidth,
      count: 0,
      pct: 0,
    });
  }
  for (const v of samples) {
    let idx = Math.floor((v - start) / binWidth);
    if (idx < 0) idx = 0;
    if (idx >= binCount) idx = binCount - 1;
    bins[idx].count++;
  }
  for (const bin of bins) {
    bin.pct = (bin.count / samples.length) * 100;
  }
  return bins;
}
