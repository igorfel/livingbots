export interface Vec2 {
  x: number;
  y: number;
}

/** Spring-toward-target steering: full speed until `slowRadius`, then eases in. */
export function arrive(
  pos: Vec2,
  vel: Vec2,
  target: Vec2,
  maxSpeed: number,
  slowRadius: number,
): Vec2 {
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 1e-6) {
    return { x: -vel.x, y: -vel.y };
  }

  const speed = dist < slowRadius ? maxSpeed * (dist / slowRadius) : maxSpeed;
  const desiredX = (dx / dist) * speed;
  const desiredY = (dy / dist) * speed;

  return { x: desiredX - vel.x, y: desiredY - vel.y };
}

/** Pointer repulsion: pushes away from `pointer`, falling off to zero at `radius`. */
export function flee(pos: Vec2, pointer: Vec2, radius: number, strength: number): Vec2 {
  const dx = pos.x - pointer.x;
  const dy = pos.y - pointer.y;
  const dist = Math.hypot(dx, dy);

  if (dist >= radius || dist < 1e-6) {
    return { x: 0, y: 0 };
  }

  const falloff = (radius - dist) / radius;
  return {
    x: (dx / dist) * strength * falloff,
    y: (dy / dist) * strength * falloff,
  };
}

/** Small bounded random jitter for idle personality. */
export function wander(jitter: number, rng: () => number): Vec2 {
  return {
    x: (rng() * 2 - 1) * jitter,
    y: (rng() * 2 - 1) * jitter,
  };
}

/** Outward impulse from `origin`, e.g. on tap-to-scatter. */
export function burst(pos: Vec2, origin: Vec2, strength: number): Vec2 {
  const dx = pos.x - origin.x;
  const dy = pos.y - origin.y;
  const dist = Math.hypot(dx, dy) || 1;
  return { x: (dx / dist) * strength, y: (dy / dist) * strength };
}

/** Semi-implicit Euler integration with damping and a hard speed cap. */
export function integrate(
  pos: Vec2,
  vel: Vec2,
  accel: Vec2,
  dt: number,
  maxSpeed: number,
  damping = 0.98,
): { pos: Vec2; vel: Vec2 } {
  let nvx = (vel.x + accel.x * dt) * damping;
  let nvy = (vel.y + accel.y * dt) * damping;

  const speed = Math.hypot(nvx, nvy);
  if (speed > maxSpeed) {
    nvx = (nvx / speed) * maxSpeed;
    nvy = (nvy / speed) * maxSpeed;
  }

  return {
    vel: { x: nvx, y: nvy },
    pos: { x: pos.x + nvx * dt, y: pos.y + nvy * dt },
  };
}
