export interface Point {
  x: number;
  y: number;
}

/**
 * Renders `text` to an offscreen canvas and samples opaque pixel positions,
 * spaced `step` px apart, as home points for a bot swarm to assemble into.
 * Browser-only (needs a 2D canvas context) — call from a mounted effect.
 *
 * `maxCount` is a safety ceiling, not a target: the glyph naturally has a fixed
 * number of candidate pixels for a given font size, and returning fewer than
 * that (a flat count picked without knowing the glyph's area) leaves visible
 * gaps between bots — worse on wide screens where the font is capped but the
 * candidate grid stays just as dense. Using every candidate up to the ceiling
 * keeps the letters solid regardless of viewport width.
 */
export function sampleTextPoints(
  text: string,
  width: number,
  height: number,
  fontPx: number,
  fontFamily: string,
  maxCount: number,
  step = 4,
): Point[] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontPx}px ${fontFamily}`;
  ctx.fillText(text, width / 2, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const candidates: Point[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 128) candidates.push({ x, y });
    }
  }

  if (candidates.length === 0) return [];

  // Shuffle (Fisher-Yates) so picking the first `count` gives even glyph coverage
  // instead of always favoring earlier scanlines when candidates > count.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, maxCount);
}
