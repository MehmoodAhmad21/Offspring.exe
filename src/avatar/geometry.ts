// Shared head geometry used by every avatar part so hair, eyes and features
// anchor consistently regardless of the chosen face shape.

import type { AvatarParams } from '../types';

export interface FaceGeometry {
  shape: AvatarParams['faceShape'];
  /** Head center. */
  cx: number;
  cy: number;
  /** Head bounding half-width / half-height. */
  rx: number;
  ry: number;
  /** Corner radius (square shape only; 0 otherwise). */
  cornerR: number;
  /** Vertical center of the eyes. */
  eyeY: number;
  /** Forehead fringe baseline for hair. */
  fringeY: number;
  /** Bottom of the head (where the neck attaches). */
  bottomY: number;
}

/** Compute head geometry for a given face shape within the 300x400 viewBox. */
export function faceGeometry(shape: AvatarParams['faceShape']): FaceGeometry {
  const cx = 150;
  switch (shape) {
    case 'round': {
      const cy = 148;
      const r = 66;
      return {
        shape,
        cx,
        cy,
        rx: r,
        ry: r,
        cornerR: r,
        eyeY: cy - 2,
        fringeY: cy - r * 0.34,
        bottomY: cy + r,
      };
    }
    case 'square': {
      const cy = 146;
      const rx = 60;
      const ry = 68;
      return {
        shape,
        cx,
        cy,
        rx,
        ry,
        cornerR: 22,
        eyeY: cy - 2,
        fringeY: cy - ry * 0.32,
        bottomY: cy + ry,
      };
    }
    case 'oval':
    default: {
      const cy = 146;
      const rx = 56;
      const ry = 72;
      return {
        shape: 'oval',
        cx,
        cy,
        rx,
        ry,
        cornerR: 0,
        eyeY: cy - 6,
        fringeY: cy - ry * 0.34,
        bottomY: cy + ry,
      };
    }
  }
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Round to 2 decimals to keep SVG path strings compact. */
export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}
