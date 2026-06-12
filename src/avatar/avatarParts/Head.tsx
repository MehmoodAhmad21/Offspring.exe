// Head shape — oval (tall ellipse), round (circle) or square (rounded rect).
// Filled with skin tone, with a subtle cheek/jaw shade for form.

import type { FaceGeometry } from '../geometry';
import { r2 } from '../geometry';

interface HeadProps {
  geo: FaceGeometry;
  skinHex: string;
  shadeHex: string;
}

export function Head({ geo, skinHex, shadeHex }: HeadProps) {
  const { cx, cy, rx, ry, shape, cornerR } = geo;

  let headShape;
  if (shape === 'round') {
    headShape = <circle cx={cx} cy={cy} r={rx} fill={skinHex} />;
  } else if (shape === 'square') {
    headShape = (
      <rect
        x={r2(cx - rx)}
        y={r2(cy - ry)}
        width={r2(rx * 2)}
        height={r2(ry * 2)}
        rx={cornerR}
        ry={cornerR}
        fill={skinHex}
      />
    );
  } else {
    headShape = <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={skinHex} />;
  }

  return (
    <g>
      {headShape}
      {/* soft jaw shading near the chin */}
      <path
        d={`M ${r2(cx - rx * 0.62)} ${r2(cy + ry * 0.5)} Q ${r2(cx)} ${r2(
          geo.bottomY + 2,
        )} ${r2(cx + rx * 0.62)} ${r2(cy + ry * 0.5)} Z`}
        fill={shadeHex}
        opacity={0.35}
      />
      {/* cheeks */}
      <circle
        cx={r2(cx - rx * 0.52)}
        cy={r2(geo.eyeY + 26)}
        r={6.5}
        fill={shadeHex}
        opacity={0.25}
      />
      <circle
        cx={r2(cx + rx * 0.52)}
        cy={r2(geo.eyeY + 26)}
        r={6.5}
        fill={shadeHex}
        opacity={0.25}
      />
    </g>
  );
}
