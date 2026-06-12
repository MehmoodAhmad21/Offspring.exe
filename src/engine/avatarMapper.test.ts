import { describe, it, expect } from 'vitest';
import { runSimulation } from './simulation';
import { mulberry32 } from './inheritance';
import { mapCompositeAvatar, sampleVariationAvatar } from './avatarMapper';
import { DISCRETE_TRAITS, SKIN_TONE_RAMP } from '../data/traitDefinitions';
import type { ParentProfile } from '../types';

function profile(over: Partial<ParentProfile> = {}): ParentProfile {
  const genotypes = Object.fromEntries(
    DISCRETE_TRAITS.map((t) => [t.id, t.defaultA]),
  ) as ParentProfile['genotypes'];
  return {
    genotypes,
    heightCm: 175,
    melaninIndex: 40,
    frameIndex: 50,
    ...over,
  };
}

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('runSimulation', () => {
  it('is reproducible for a fixed seed', () => {
    const a = profile();
    const b = profile({ heightCm: 165 });
    const r1 = runSimulation(a, b, 42, 5000);
    const r2 = runSimulation(a, b, 42, 5000);
    expect(r1.discrete.eyeColor).toEqual(r2.discrete.eyeColor);
    expect(r1.height.mean).toBe(r2.height.mean);
  });

  it('produces a distribution for every discrete trait', () => {
    const r = runSimulation(profile(), profile(), 7, 5000);
    for (const t of DISCRETE_TRAITS) {
      const outcomes = r.discrete[t.id];
      expect(outcomes.length).toBeGreaterThan(0);
      const total = outcomes.reduce((s, o) => s + o.pct, 0);
      expect(total).toBeCloseTo(100, 6);
    }
  });
});

describe('mapCompositeAvatar', () => {
  it('returns valid, well-formed avatar params', () => {
    const r = runSimulation(profile(), profile({ heightCm: 160 }), 11, 8000);
    const avatar = mapCompositeAvatar(r);
    expect(avatar.skinHex).toMatch(HEX);
    expect(avatar.eyeColorHex).toMatch(HEX);
    expect(avatar.hairColorHex).toMatch(HEX);
    expect(['curly', 'wavy', 'straight']).toContain(avatar.hairTexture);
    expect(['oval', 'round', 'square']).toContain(avatar.faceShape);
    expect(SKIN_TONE_RAMP).toContain(avatar.skinHex);
    // composite height is the mean -> between the two parents
    expect(avatar.heightCm).toBeGreaterThan(160);
    expect(avatar.heightCm).toBeLessThan(180);
  });

  it('reflects a certain genotype deterministically (bb x bb -> Blue eyes)', () => {
    const a = profile();
    const b = profile();
    a.genotypes.eyeColor = 'bb';
    b.genotypes.eyeColor = 'bb';
    const r = runSimulation(a, b, 99, 4000);
    const avatar = mapCompositeAvatar(r);
    // Blue iris hex from EYE_COLOR_HEX
    expect(avatar.eyeColorHex).toBe('#6FA8C9');
  });
});

describe('sampleVariationAvatar', () => {
  it('always yields valid params across many samples', () => {
    const r = runSimulation(profile(), profile({ heightCm: 168 }), 3, 8000);
    const rng = mulberry32(123);
    for (let i = 0; i < 50; i++) {
      const v = sampleVariationAvatar(r, rng);
      expect(v.skinHex).toMatch(HEX);
      expect(v.eyeColorHex).toMatch(HEX);
      expect(v.hairColorHex).toMatch(HEX);
      expect(['curly', 'wavy', 'straight']).toContain(v.hairTexture);
      expect(['oval', 'round', 'square']).toContain(v.faceShape);
      expect(v.frameIndex).toBeGreaterThanOrEqual(1);
      expect(v.frameIndex).toBeLessThanOrEqual(100);
    }
  });
});
