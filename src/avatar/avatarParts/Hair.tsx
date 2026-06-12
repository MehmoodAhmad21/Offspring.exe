// Hair — three texture variants (curly / wavy / straight), each built
// generically from the head geometry so it overlays any of the three face
// shapes via consistent anchor points (top of head + forehead fringe line).

import type { FaceGeometry } from '../geometry';
import { r2 } from '../geometry';
import { shade } from '../colors';

interface HairProps {
  geo: FaceGeometry;
  hairColorHex: string;
  texture: 'curly' | 'wavy' | 'straight';
}

/** Common anchor points derived from head geometry. */
function anchors(geo: FaceGeometry) {
  const { cx, cy, rx, ry } = geo;
  return {
    cx,
    topY: cy - ry - 6,
    leftX: cx - rx - 4,
    rightX: cx + rx + 4,
    sideY: cy - ry * 0.05,
    upperSideY: cy - ry * 0.5,
    fringeY: geo.fringeY,
    rx,
    ry,
    cy,
  };
}

function StraightHair({ geo, hairColorHex }: Omit<HairProps, 'texture'>) {
  const a = anchors(geo);
  const partX = a.cx + a.rx * 0.18;
  const d = [
    `M ${r2(a.leftX)} ${r2(a.sideY)}`,
    `L ${r2(a.leftX)} ${r2(a.upperSideY)}`,
    `Q ${r2(a.leftX)} ${r2(a.topY)} ${r2(a.cx)} ${r2(a.topY)}`,
    `Q ${r2(a.rightX)} ${r2(a.topY)} ${r2(a.rightX)} ${r2(a.upperSideY)}`,
    `L ${r2(a.rightX)} ${r2(a.sideY)}`,
    // inner fringe edge, swept across the forehead with a side part
    `L ${r2(a.cx + a.rx * 0.66)} ${r2(a.fringeY)}`,
    `L ${r2(partX)} ${r2(a.fringeY - 5)}`,
    `L ${r2(a.cx - a.rx * 0.7)} ${r2(a.fringeY + 2)}`,
    `L ${r2(a.cx - a.rx * 0.82)} ${r2(a.fringeY + 14)}`,
    'Z',
  ].join(' ');
  return <path d={d} fill={hairColorHex} />;
}

function WavyHair({ geo, hairColorHex }: Omit<HairProps, 'texture'>) {
  const a = anchors(geo);
  const d = [
    `M ${r2(a.leftX)} ${r2(a.sideY)}`,
    `L ${r2(a.leftX)} ${r2(a.upperSideY)}`,
    `Q ${r2(a.leftX)} ${r2(a.topY)} ${r2(a.cx)} ${r2(a.topY)}`,
    `Q ${r2(a.rightX)} ${r2(a.topY)} ${r2(a.rightX)} ${r2(a.upperSideY)}`,
    `L ${r2(a.rightX)} ${r2(a.sideY)}`,
    // sinuous S-curved fringe back to the left side
    `C ${r2(a.cx + a.rx * 0.55)} ${r2(a.fringeY + 12)} ${r2(
      a.cx + a.rx * 0.45,
    )} ${r2(a.fringeY - 10)} ${r2(a.cx + a.rx * 0.2)} ${r2(a.fringeY)}`,
    `C ${r2(a.cx)} ${r2(a.fringeY + 12)} ${r2(a.cx - a.rx * 0.2)} ${r2(
      a.fringeY - 8,
    )} ${r2(a.cx - a.rx * 0.42)} ${r2(a.fringeY + 2)}`,
    `C ${r2(a.cx - a.rx * 0.6)} ${r2(a.fringeY + 12)} ${r2(
      a.cx - a.rx * 0.72,
    )} ${r2(a.fringeY + 4)} ${r2(a.leftX)} ${r2(a.sideY)}`,
    'Z',
  ].join(' ');
  return <path d={d} fill={hairColorHex} />;
}

function CurlyHair({ geo, hairColorHex }: Omit<HairProps, 'texture'>) {
  const a = anchors(geo);
  // Filled base cap so gaps between curls stay covered.
  const base = [
    `M ${r2(a.leftX)} ${r2(a.sideY)}`,
    `L ${r2(a.leftX)} ${r2(a.upperSideY)}`,
    `Q ${r2(a.leftX)} ${r2(a.topY + 4)} ${r2(a.cx)} ${r2(a.topY + 4)}`,
    `Q ${r2(a.rightX)} ${r2(a.topY + 4)} ${r2(a.rightX)} ${r2(a.upperSideY)}`,
    `L ${r2(a.rightX)} ${r2(a.sideY)}`,
    `Q ${r2(a.cx)} ${r2(a.fringeY + 6)} ${r2(a.leftX)} ${r2(a.sideY)}`,
    'Z',
  ].join(' ');

  // Overlapping curl bumps around the upper perimeter.
  const bumps: { x: number; y: number; r: number }[] = [];
  const count = 18;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // sweep slightly past both sides (angle 0..PI maps right->top->left)
    const angle = -0.12 * Math.PI + t * 1.24 * Math.PI;
    const x = a.cx + a.rx * 1.02 * Math.cos(angle);
    const y = a.cy - a.ry * 0.98 * Math.sin(angle);
    bumps.push({ x, y, r: 11 });
  }
  // a few curls framing the temples/fringe
  const frame = [
    { x: a.cx - a.rx * 0.72, y: a.fringeY + 6, r: 10 },
    { x: a.cx - a.rx * 0.3, y: a.fringeY - 2, r: 10 },
    { x: a.cx + a.rx * 0.2, y: a.fringeY - 2, r: 10 },
    { x: a.cx + a.rx * 0.66, y: a.fringeY + 6, r: 10 },
  ];

  const curlDark = shade(hairColorHex, 0.18);
  return (
    <g>
      <path d={base} fill={hairColorHex} />
      {bumps.map((b, i) => (
        <circle key={`b${i}`} cx={r2(b.x)} cy={r2(b.y)} r={b.r} fill={hairColorHex} />
      ))}
      {frame.map((b, i) => (
        <circle key={`f${i}`} cx={r2(b.x)} cy={r2(b.y)} r={b.r} fill={hairColorHex} />
      ))}
      {/* inner highlight curls for a touch of depth */}
      {bumps
        .filter((_, i) => i % 2 === 0)
        .map((b, i) => (
          <circle
            key={`h${i}`}
            cx={r2(b.x)}
            cy={r2(b.y - 1)}
            r={5}
            fill={curlDark}
            opacity={0.5}
          />
        ))}
    </g>
  );
}

export function Hair({ geo, hairColorHex, texture }: HairProps) {
  if (texture === 'curly')
    return <CurlyHair geo={geo} hairColorHex={hairColorHex} />;
  if (texture === 'wavy')
    return <WavyHair geo={geo} hairColorHex={hairColorHex} />;
  return <StraightHair geo={geo} hairColorHex={hairColorHex} />;
}
