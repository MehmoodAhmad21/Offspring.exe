// Neck — the skin-toned bridge between head and torso. Drawn after the body so
// it covers the torso's neck opening, and before the head so the head caps it.

import type { FaceGeometry } from '../geometry';
import { r2 } from '../geometry';

interface NeckProps {
  geo: FaceGeometry;
  skinHex: string;
  shadeHex: string;
}

export function Neck({ geo, skinHex, shadeHex }: NeckProps) {
  const halfW = 17;
  const topY = geo.bottomY - 16; // overlap into the head
  const bottomY = 244; // tuck under the torso top
  const x = geo.cx - halfW;
  return (
    <g>
      <path
        d={`M ${r2(x)} ${r2(topY)} L ${r2(x)} ${r2(bottomY)} L ${r2(
          geo.cx + halfW,
        )} ${r2(bottomY)} L ${r2(geo.cx + halfW)} ${r2(topY)} Z`}
        fill={skinHex}
      />
      {/* subtle jaw shadow across the top of the neck */}
      <path
        d={`M ${r2(x)} ${r2(topY)} Q ${r2(geo.cx)} ${r2(topY + 9)} ${r2(
          geo.cx + halfW,
        )} ${r2(topY)} Z`}
        fill={shadeHex}
        opacity={0.5}
      />
    </g>
  );
}
