// Procedural SVG avatar generator. Composes layered groups (back to front:
// body, neck, head, hair, eyes, features) entirely from AvatarParams — no
// images, no external services, fully deterministic.

import type { AvatarParams } from '../types';
import { faceGeometry, r2 } from './geometry';
import { shade } from './colors';
import { Body } from './avatarParts/Body';
import { Neck } from './avatarParts/SkinTone';
import { Head } from './avatarParts/Head';
import { Hair } from './avatarParts/Hair';
import { Eyes } from './avatarParts/Eyes';

interface AvatarSVGProps {
  params: AvatarParams;
  title?: string;
}

function Features({
  cx,
  noseY,
  mouthY,
  noseW,
  skinShade,
}: {
  cx: number;
  noseY: number;
  mouthY: number;
  noseW: number;
  skinShade: string;
}) {
  const lineColor = '#7A5C49';
  return (
    <g fill="none" stroke={lineColor} strokeLinecap="round">
      {/* minimal nose: a soft V */}
      <path
        d={`M ${r2(cx - 2)} ${r2(noseY - 10)} L ${r2(cx - noseW)} ${r2(
          noseY,
        )} Q ${r2(cx)} ${r2(noseY + 5)} ${r2(cx + noseW * 0.7)} ${r2(noseY)}`}
        strokeWidth={2}
        stroke={skinShade}
      />
      {/* simple neutral mouth */}
      <path
        d={`M ${r2(cx - 13)} ${r2(mouthY)} Q ${r2(cx)} ${r2(
          mouthY + 6,
        )} ${r2(cx + 13)} ${r2(mouthY)}`}
        strokeWidth={2.2}
      />
    </g>
  );
}

export function AvatarSVG({ params, title = 'Offspring avatar' }: AvatarSVGProps) {
  const geo = faceGeometry(params.faceShape);
  const skinShade = shade(params.skinHex, 0.16);

  const noseY = geo.eyeY + 24;
  const mouthY = geo.eyeY + 42;
  const noseW = geo.rx * 0.14 + 4;

  return (
    <svg
      viewBox="0 0 300 400"
      width="100%"
      height="100%"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMax meet"
    >
      <title>{title}</title>
      {/* 1. body silhouette (clothing) */}
      <Body frameIndex={params.frameIndex} />
      {/* 2. neck */}
      <Neck geo={geo} skinHex={params.skinHex} shadeHex={skinShade} />
      {/* 3. head */}
      <Head geo={geo} skinHex={params.skinHex} shadeHex={skinShade} />
      {/* 4. hair */}
      <Hair
        geo={geo}
        hairColorHex={params.hairColorHex}
        texture={params.hairTexture}
      />
      {/* 5. eyes */}
      <Eyes geo={geo} eyeColorHex={params.eyeColorHex} />
      {/* 6. minimal nose + mouth */}
      <Features
        cx={geo.cx}
        noseY={noseY}
        mouthY={mouthY}
        noseW={noseW}
        skinShade={skinShade}
      />
    </svg>
  );
}
