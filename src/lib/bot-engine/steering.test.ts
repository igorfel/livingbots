import { describe, expect, it } from "vitest";
import { arrive, burst, flee, integrate, wander } from "./steering";

describe("arrive", () => {
  it("steers toward the target when far away", () => {
    const steer = arrive({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 }, 10, 20);
    expect(steer.x).toBeGreaterThan(0);
    expect(steer.y).toBeCloseTo(0);
  });

  it("scales desired speed down inside the slow radius", () => {
    // Halfway into the slow radius, desired speed should be ~half maxSpeed.
    const steer = arrive({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 10, 20);
    expect(steer.x).toBeCloseTo(5, 1);
  });

  it("brakes to a stop at the target instead of producing NaN", () => {
    const steer = arrive({ x: 5, y: 5 }, { x: 3, y: -2 }, { x: 5, y: 5 }, 10, 20);
    expect(steer).toEqual({ x: -3, y: 2 });
  });

  it("converges to the target over repeated integration steps", () => {
    let pos = { x: -200, y: 150 };
    let vel = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    for (let i = 0; i < 500; i++) {
      const accel = arrive(pos, vel, target, 300, 60);
      ({ pos, vel } = integrate(pos, vel, accel, 1 / 60, 300));
    }

    expect(Math.hypot(pos.x - target.x, pos.y - target.y)).toBeLessThan(1);
    expect(Math.hypot(vel.x, vel.y)).toBeLessThan(1);
  });
});

describe("flee", () => {
  it("pushes away from the pointer within range", () => {
    const steer = flee({ x: 10, y: 0 }, { x: 0, y: 0 }, 20, 100);
    expect(steer.x).toBeGreaterThan(0);
  });

  it("has no effect outside the radius", () => {
    const steer = flee({ x: 100, y: 0 }, { x: 0, y: 0 }, 20, 100);
    expect(steer).toEqual({ x: 0, y: 0 });
  });

  it("falls off to (near) zero at the radius edge, stronger near the pointer", () => {
    const near = flee({ x: 1, y: 0 }, { x: 0, y: 0 }, 20, 100);
    const far = flee({ x: 19, y: 0 }, { x: 0, y: 0 }, 20, 100);
    expect(near.x).toBeGreaterThan(far.x);
  });
});

describe("wander", () => {
  it("stays within the jitter bound", () => {
    const rng = () => 1; // max positive jitter
    const steer = wander(5, rng);
    expect(steer.x).toBeCloseTo(5);
    expect(steer.y).toBeCloseTo(5);
  });

  it("is a pure function of the rng's output", () => {
    const fixed = () => 0.75;
    expect(wander(10, fixed)).toEqual(wander(10, fixed));
    expect(wander(10, fixed)).toEqual({ x: 5, y: 5 });
  });
});

describe("burst", () => {
  it("points away from the origin with the given strength", () => {
    const steer = burst({ x: 10, y: 0 }, { x: 0, y: 0 }, 50);
    expect(steer.x).toBeCloseTo(50);
    expect(steer.y).toBeCloseTo(0);
  });

  it("does not produce NaN when the bot is at the origin", () => {
    const steer = burst({ x: 0, y: 0 }, { x: 0, y: 0 }, 50);
    expect(Number.isNaN(steer.x)).toBe(false);
    expect(Number.isNaN(steer.y)).toBe(false);
  });
});

describe("integrate", () => {
  it("caps velocity at maxSpeed", () => {
    const { vel } = integrate({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1000, y: 0 }, 1, 10, 1);
    expect(Math.hypot(vel.x, vel.y)).toBeCloseTo(10);
  });

  it("decays speed via damping when there is no acceleration", () => {
    const { vel } = integrate({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 0 }, 1, 100, 0.9);
    expect(vel.x).toBeCloseTo(9);
  });

  it("advances position by velocity * dt", () => {
    const { pos } = integrate({ x: 5, y: 5 }, { x: 2, y: -1 }, { x: 0, y: 0 }, 0.5, 100, 1);
    expect(pos.x).toBeCloseTo(6);
    expect(pos.y).toBeCloseTo(4.5);
  });
});
