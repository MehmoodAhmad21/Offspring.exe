// Body silhouette (clothing). A single rounded-shoulder torso path whose width
// is interpolated between a precomputed "slim" and "broad" variant based on
// frameIndex.

import { lerp, r2 } from '../geometry';

/** Numeric control points fully describing the torso outline. */
interface BodyShape {
  neckLeftX: number;
  neckRightX: number;
  neckY: number;
  shoulderTopY: number;
  shoulderMidY: number;
  shoulderLowY: number;
  shoulderLX: number;
  shoulderRX: number;
  cpLX: number;
  cpRX: number;
  leftX: number;
  rightX: number;
  bottomY: number;
}

// Slim frame (~0.85x) and broad frame (~1.25x). Same structure so every
// coordinate can be linearly interpolated field by field.
const SLIM: BodyShape = {
  neckLeftX: 138,
  neckRightX: 162,
  neckY: 232,
  shoulderTopY: 240,
  shoulderMidY: 262,
  shoulderLowY: 300,
  shoulderLX: 98,
  shoulderRX: 202,
  cpLX: 112,
  cpRX: 188,
  leftX: 106,
  rightX: 194,
  bottomY: 400,
};

const BROAD: BodyShape = {
  neckLeftX: 134,
  neckRightX: 166,
  neckY: 230,
  shoulderTopY: 238,
  shoulderMidY: 260,
  shoulderLowY: 300,
  shoulderLX: 60,
  shoulderRX: 240,
  cpLX: 84,
  cpRX: 216,
  leftX: 74,
  rightX: 226,
  bottomY: 400,
};

function lerpShape(t: number): BodyShape {
  const out = {} as BodyShape;
  (Object.keys(SLIM) as (keyof BodyShape)[]).forEach((k) => {
    out[k] = lerp(SLIM[k], BROAD[k], t);
  });
  return out;
}

function buildPath(s: BodyShape): string {
  return [
    `M ${r2(s.neckLeftX)} ${r2(s.neckY)}`,
    // left shoulder curving out and down
    `C ${r2(s.cpLX)} ${r2(s.shoulderTopY)} ${r2(s.shoulderLX)} ${r2(
      s.shoulderMidY,
    )} ${r2(s.shoulderLX)} ${r2(s.shoulderLowY)}`,
    `L ${r2(s.leftX)} ${r2(s.bottomY)}`,
    `L ${r2(s.rightX)} ${r2(s.bottomY)}`,
    `L ${r2(s.shoulderRX)} ${r2(s.shoulderLowY)}`,
    // right shoulder curving in and up to the neck
    `C ${r2(s.shoulderRX)} ${r2(s.shoulderMidY)} ${r2(s.cpRX)} ${r2(
      s.shoulderTopY,
    )} ${r2(s.neckRightX)} ${r2(s.neckY)}`,
    'Z',
  ].join(' ');
}

interface BodyProps {
  frameIndex: number; // 1-100
}

const CLOTHING_FILL = '#7FA98E';
const CLOTHING_STROKE = '#5E8A6F';

export function Body({ frameIndex }: BodyProps) {
  const t = Math.max(0, Math.min(1, (frameIndex - 1) / 99));
  const path = buildPath(lerpShape(t));
  return (
    <path
      d={path}
      fill={CLOTHING_FILL}
      stroke={CLOTHING_STROKE}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  );
}
