// Maps a SimulationResult into a concrete AvatarParams object, for both the
// "most probable composite" avatar and a single re-sampled "variation".

import type {
  AvatarParams,
  PhenotypeOutcome,
  RNG,
  SimulationResult,
} from '../types';
import {
  EYE_COLOR_HEX,
  HAIR_COLOR_HEX,
  melaninIndexToHex,
} from '../data/traitDefinitions';

const DEFAULT_EYE_HEX = '#6B4423';
const DEFAULT_HAIR_HEX = '#2B1B12';

function hairTextureToken(label: string): AvatarParams['hairTexture'] {
  switch (label) {
    case 'Curly':
      return 'curly';
    case 'Wavy':
      return 'wavy';
    default:
      return 'straight';
  }
}

function faceShapeToken(label: string): AvatarParams['faceShape'] {
  switch (label) {
    case 'Oval':
      return 'oval';
    case 'Round':
      return 'round';
    default:
      return 'square';
  }
}

/** The single highest-probability outcome label for a trait. */
function topLabel(outcomes: PhenotypeOutcome[]): string {
  // outcomes are pre-sorted descending by pct; guard against empty.
  return outcomes[0]?.label ?? '';
}

/**
 * Draw one weighted-random outcome label from a distribution. Weights are the
 * pct values (which sum to ~100). Falls back to the last/first as needed.
 */
function sampleLabel(outcomes: PhenotypeOutcome[], rng: RNG): string {
  if (outcomes.length === 0) return '';
  const total = outcomes.reduce((s, o) => s + o.pct, 0);
  let roll = rng() * total;
  for (const o of outcomes) {
    roll -= o.pct;
    if (roll <= 0) return o.label;
  }
  return outcomes[outcomes.length - 1].label;
}

/**
 * Build the "most probable composite" avatar: the modal outcome for each
 * discrete trait and the mean for each polygenic trait.
 */
export function mapCompositeAvatar(result: SimulationResult): AvatarParams {
  const eyeLabel = topLabel(result.discrete.eyeColor);
  const hairLabel = topLabel(result.discrete.hairColor);
  const textureLabel = topLabel(result.discrete.hairTexture);
  const faceLabel = topLabel(result.discrete.faceShape);

  return {
    skinHex: melaninIndexToHex(result.melanin.mean),
    eyeColorHex: EYE_COLOR_HEX[eyeLabel] ?? DEFAULT_EYE_HEX,
    hairColorHex: HAIR_COLOR_HEX[hairLabel] ?? DEFAULT_HAIR_HEX,
    hairTexture: hairTextureToken(textureLabel),
    faceShape: faceShapeToken(faceLabel),
    heightCm: result.height.mean,
    frameIndex: result.frame.mean,
  };
}

/**
 * Build one example individual avatar: draw a single weighted-random outcome
 * per discrete trait, and a single random sample for each polygenic trait
 * (re-using the simulation's own sample arrays for consistency).
 */
export function sampleVariationAvatar(
  result: SimulationResult,
  rng: RNG,
): AvatarParams {
  const eyeLabel = sampleLabel(result.discrete.eyeColor, rng);
  const hairLabel = sampleLabel(result.discrete.hairColor, rng);
  const textureLabel = sampleLabel(result.discrete.hairTexture, rng);
  const faceLabel = sampleLabel(result.discrete.faceShape, rng);

  const pick = (arr: number[]): number =>
    arr.length === 0 ? 0 : arr[Math.floor(rng() * arr.length)];

  return {
    skinHex: melaninIndexToHex(pick(result.melanin.samples)),
    eyeColorHex: EYE_COLOR_HEX[eyeLabel] ?? DEFAULT_EYE_HEX,
    hairColorHex: HAIR_COLOR_HEX[hairLabel] ?? DEFAULT_HAIR_HEX,
    hairTexture: hairTextureToken(textureLabel),
    faceShape: faceShapeToken(faceLabel),
    heightCm: pick(result.height.samples),
    frameIndex: pick(result.frame.samples),
  };
}
