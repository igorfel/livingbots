import { describe, expect, it } from "vitest";
import { samplePerimeterPoints } from "./shapes";

describe("samplePerimeterPoints", () => {
  it("starts at the top-left corner", () => {
    const points = samplePerimeterPoints(10, 20, 100, 50, 8);
    expect(points[0]).toEqual({ x: 10, y: 20 });
  });

  it("stays on the rectangle's boundary for every sample", () => {
    const x = 5;
    const y = 5;
    const w = 40;
    const h = 20;
    const points = samplePerimeterPoints(x, y, w, h, 37);

    for (const p of points) {
      const onVerticalEdge = p.x === x || p.x === x + w;
      const onHorizontalEdge = p.y === y || p.y === y + h;
      expect(onVerticalEdge || onHorizontalEdge).toBe(true);
      expect(p.x).toBeGreaterThanOrEqual(x);
      expect(p.x).toBeLessThanOrEqual(x + w);
      expect(p.y).toBeGreaterThanOrEqual(y);
      expect(p.y).toBeLessThanOrEqual(y + h);
    }
  });

  it("spaces points evenly around the perimeter", () => {
    const points = samplePerimeterPoints(0, 0, 10, 10, 4);
    // A square's perimeter is 40; 4 evenly spaced points land exactly on the corners.
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
  });

  it("returns an empty array for degenerate input", () => {
    expect(samplePerimeterPoints(0, 0, 0, 0, 10)).toEqual([]);
    expect(samplePerimeterPoints(0, 0, 10, 10, 0)).toEqual([]);
  });
});
