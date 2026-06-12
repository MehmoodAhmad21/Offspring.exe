// Small color helpers for deriving shade/highlight tones from a base hex.

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => clamp255(v).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Multiply each channel toward black by `amount` (0 = unchanged, 1 = black). */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const f = 1 - amount;
  return toHex(r * f, g * f, b * f);
}

/** Mix each channel toward white by `amount` (0 = unchanged, 1 = white). */
export function tint(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}
