// Eyes — two almond shapes with iris + pupil, plus simple brows. Positioned
// proportionally on the head and nudged vertically per face shape via eyeY.

import type { FaceGeometry } from '../geometry';
import { r2 } from '../geometry';

interface EyesProps {
  geo: FaceGeometry;
  eyeColorHex: string;
}

const PUPIL = '#1B2838';
const BROW = '#3A2A20';

function Eye({
  cx,
  cy,
  irisHex,
}: {
  cx: number;
  cy: number;
  irisHex: string;
}) {
  const ew = 13; // almond half-width
  const eh = 7; // almond half-height
  return (
    <g>
      {/* almond sclera */}
      <path
        d={`M ${r2(cx - ew)} ${r2(cy)} Q ${r2(cx)} ${r2(cy - eh)} ${r2(
          cx + ew,
        )} ${r2(cy)} Q ${r2(cx)} ${r2(cy + eh)} ${r2(cx - ew)} ${r2(cy)} Z`}
        fill="#FFFFFF"
        stroke="#46535F"
        strokeWidth={1}
      />
      <circle cx={r2(cx)} cy={r2(cy)} r={6} fill={irisHex} />
      <circle cx={r2(cx)} cy={r2(cy)} r={2.6} fill={PUPIL} />
      {/* catchlight */}
      <circle cx={r2(cx - 1.8)} cy={r2(cy - 1.8)} r={1.1} fill="#FFFFFF" />
    </g>
  );
}

export function Eyes({ geo, eyeColorHex }: EyesProps) {
  const { cx, eyeY, rx } = geo;
  const dx = rx * 0.42;
  const browY = eyeY - 11;
  const browW = 11;
  return (
    <g>
      {/* brows */}
      <path
        d={`M ${r2(cx - dx - browW)} ${r2(browY + 2)} Q ${r2(cx - dx)} ${r2(
          browY - 2,
        )} ${r2(cx - dx + browW)} ${r2(browY + 1)}`}
        stroke={BROW}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${r2(cx + dx - browW)} ${r2(browY + 1)} Q ${r2(cx + dx)} ${r2(
          browY - 2,
        )} ${r2(cx + dx + browW)} ${r2(browY + 2)}`}
        stroke={BROW}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <Eye cx={cx - dx} cy={eyeY} irisHex={eyeColorHex} />
      <Eye cx={cx + dx} cy={eyeY} irisHex={eyeColorHex} />
    </g>
  );
}
