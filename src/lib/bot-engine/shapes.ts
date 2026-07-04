import type { Point } from "./text-points";

/** Evenly spaced points around a rectangle's perimeter, starting top-left, clockwise. */
export function samplePerimeterPoints(
  x: number,
  y: number,
  w: number,
  h: number,
  count: number,
): Point[] {
  const perimeter = 2 * (w + h);
  if (perimeter <= 0 || count <= 0) return [];

  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const d = (i / count) * perimeter;
    let px: number;
    let py: number;
    if (d < w) {
      px = x + d;
      py = y;
    } else if (d < w + h) {
      px = x + w;
      py = y + (d - w);
    } else if (d < 2 * w + h) {
      px = x + w - (d - w - h);
      py = y + h;
    } else {
      px = x;
      py = y + h - (d - 2 * w - h);
    }
    points.push({ x: px, y: py });
  }
  return points;
}
