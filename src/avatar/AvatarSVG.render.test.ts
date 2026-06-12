import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AvatarSVG } from './AvatarSVG';
import type { AvatarParams } from '../types';

const FACES: AvatarParams['faceShape'][] = ['oval', 'round', 'square'];
const TEXTURES: AvatarParams['hairTexture'][] = ['curly', 'wavy', 'straight'];

function params(over: Partial<AvatarParams> = {}): AvatarParams {
  return {
    skinHex: '#E8BE97',
    eyeColorHex: '#6B4423',
    hairColorHex: '#2B1B12',
    hairTexture: 'wavy',
    faceShape: 'oval',
    heightCm: 175,
    frameIndex: 50,
    ...over,
  };
}

describe('AvatarSVG renders for every shape/texture combination', () => {
  for (const faceShape of FACES) {
    for (const hairTexture of TEXTURES) {
      it(`renders ${faceShape} face with ${hairTexture} hair`, () => {
        const html = renderToStaticMarkup(
          createElement(AvatarSVG, { params: params({ faceShape, hairTexture }) }),
        );
        expect(html).toContain('<svg');
        expect(html).toContain('viewBox="0 0 300 400"');
        // no NaN should leak into any coordinate
        expect(html).not.toContain('NaN');
        expect(html.length).toBeGreaterThan(200);
      });
    }
  }

  it('handles extreme frame indices without producing NaN paths', () => {
    for (const frameIndex of [1, 100]) {
      const html = renderToStaticMarkup(
        createElement(AvatarSVG, { params: params({ frameIndex }) }),
      );
      expect(html).not.toContain('NaN');
    }
  });
});
