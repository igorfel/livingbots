import { arrive, burst, flee, integrate, wander, type Vec2 } from "./steering";

export type BotKind = "worker" | "foreman";

export interface Bot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  size: number;
  kind: BotKind;
  /** Random phase offset so blink/wobble personality isn't synced across bots. */
  phase: number;
}

export type SwarmMode = "seek" | "loose";

export interface Pointer {
  x: number;
  y: number;
  active: boolean;
}

export interface SwarmTuning {
  maxSpeed: number;
  arriveRadius: number;
  fleeRadius: number;
  fleeStrength: number;
  wanderJitter: number;
  looseWanderJitter: number;
  /** Home-pull stiffness while "loose" (1 = full arrive strength), so wander is felt. */
  looseHomeStiffness: number;
  damping: number;
}

export const defaultTuning: SwarmTuning = {
  maxSpeed: 260,
  arriveRadius: 90,
  fleeRadius: 70,
  fleeStrength: 900,
  wanderJitter: 6,
  looseWanderJitter: 150,
  looseHomeStiffness: 0.15,
  damping: 0.9,
};

/** Advances one bot by `dt` seconds under arrive-home + pointer-flee + wander. */
export function stepBot(
  bot: Bot,
  mode: SwarmMode,
  pointer: Pointer,
  dt: number,
  rng: () => number,
  tuning: SwarmTuning = defaultTuning,
): Bot {
  const pos: Vec2 = { x: bot.x, y: bot.y };
  const vel: Vec2 = { x: bot.vx, y: bot.vy };
  const home: Vec2 = { x: bot.homeX, y: bot.homeY };

  // arrive() returns a one-frame velocity delta (desired - current), not a physical
  // acceleration. integrate() multiplies whatever we pass it by dt again, so without
  // correcting for that here the home-pull would be ~60x too weak at 60fps and bots
  // would stall far short of maxSpeed. Dividing by dt cancels that second scaling.
  const toHome = arrive(pos, vel, home, tuning.maxSpeed, tuning.arriveRadius);
  const safeDt = Math.max(dt, 1 / 240);
  const stiffness = mode === "loose" ? tuning.looseHomeStiffness : 1;
  const homeAccel = {
    x: (toHome.x / safeDt) * stiffness,
    y: (toHome.y / safeDt) * stiffness,
  };

  const away = pointer.active
    ? flee(pos, pointer, tuning.fleeRadius, tuning.fleeStrength)
    : { x: 0, y: 0 };
  const jitter = wander(
    mode === "loose" ? tuning.looseWanderJitter : tuning.wanderJitter,
    rng,
  );

  const accel: Vec2 = {
    x: homeAccel.x + away.x + jitter.x,
    y: homeAccel.y + away.y + jitter.y,
  };

  const { pos: nextPos, vel: nextVel } = integrate(
    pos,
    vel,
    accel,
    dt,
    tuning.maxSpeed,
    tuning.damping,
  );

  return {
    ...bot,
    x: nextPos.x,
    y: nextPos.y,
    vx: nextVel.x,
    vy: nextVel.y,
  };
}

/** Applies an outward scatter impulse, e.g. from a tap. Home stays put — the bot arrives back. */
export function burstBot(bot: Bot, origin: Vec2, strength: number): Bot {
  const impulse = burst({ x: bot.x, y: bot.y }, origin, strength);
  return { ...bot, vx: bot.vx + impulse.x, vy: bot.vy + impulse.y };
}

/** Distance from home, used to decide when a swarm has "settled" into formation. */
export function distanceFromHome(bot: Bot): number {
  return Math.hypot(bot.x - bot.homeX, bot.y - bot.homeY);
}

export function averageDistanceFromHome(bots: Bot[]): number {
  if (bots.length === 0) return 0;
  return bots.reduce((sum, bot) => sum + distanceFromHome(bot), 0) / bots.length;
}
