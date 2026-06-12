// Wraps the procedural AvatarSVG and applies a height-driven visual scale.
// Taller predicted offspring render visibly taller within a fixed-width frame.
// This is a visualization device, not anatomically precise scaling.

import type { AvatarParams } from '../types';
import { AvatarSVG } from '../avatar/AvatarSVG';
import styles from './AvatarRenderer.module.css';

interface AvatarRendererProps {
  params: AvatarParams;
  title?: string;
}

/** Map heightCm to a pixel height, interpolating 150cm->240px, 200cm->340px. */
function heightToPx(cm: number): number {
  const min = 150;
  const max = 200;
  const t = (cm - min) / (max - min);
  const px = 240 + t * (340 - 240);
  return Math.max(210, Math.min(360, px));
}

export function AvatarRenderer({ params, title }: AvatarRendererProps) {
  const px = heightToPx(params.heightCm);
  return (
    <div className={styles.frame}>
      <div className={styles.stage} style={{ height: `${px}px` }}>
        <AvatarSVG params={params} title={title} />
      </div>
    </div>
  );
}
