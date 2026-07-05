import type { Bot } from "./swarm";

export interface DrawBotsOptions {
  /** Timestamp (ms) driving the blink cycle; pass the rAF `now`. */
  now: number;
  workerColor?: string;
  foremanColor?: string;
  /** Glow radius as a multiple of bot size; 0 disables the bloom pass. */
  glow?: number;
  /** Velocity stretch in seconds of travel; 0 disables trailing streaks. */
  stretch?: number;
  blink?: boolean;
  /** Extra alpha multiplier for whole-swarm fades (assembly reveals). */
  alphaScale?: number;
}

const WORKER_COLOR = "#3dd6ff";
const FOREMAN_COLOR = "#ff3d6e";
const SPRITE_SIZE = 32;

const spriteCache = new Map<string, HTMLCanvasElement>();

/** Radial-gradient bloom sprite, cached per color, drawn under bots with `lighter` compositing. */
function glowSprite(color: string): HTMLCanvasElement {
  const cached = spriteCache.get(color);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const half = SPRITE_SIZE / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.35, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  }
  spriteCache.set(color, canvas);
  return canvas;
}

function blinkAlpha(now: number, phase: number): number {
  return 0.75 + 0.25 * Math.sin(now / 400 + phase);
}

/**
 * Shared bot renderer: additive glow pass, then velocity-stretched cores.
 * Foremen render one size up with a stronger halo so the two castes read apart.
 */
export function drawBots(
  ctx: CanvasRenderingContext2D,
  bots: readonly Bot[],
  options: DrawBotsOptions,
): void {
  const {
    now,
    workerColor = WORKER_COLOR,
    foremanColor = FOREMAN_COLOR,
    glow = 3,
    stretch = 0.045,
    blink = true,
    alphaScale = 1,
  } = options;

  if (alphaScale <= 0) return;

  if (glow > 0) {
    ctx.globalCompositeOperation = "lighter";
    for (const bot of bots) {
      const foreman = bot.kind === "foreman";
      const alpha = (blink ? blinkAlpha(now, bot.phase) : 1) * alphaScale;
      const radius = bot.size * glow * (foreman ? 1.6 : 1);
      ctx.globalAlpha = alpha * (foreman ? 0.5 : 0.35);
      ctx.drawImage(
        glowSprite(foreman ? foremanColor : workerColor),
        bot.x - radius,
        bot.y - radius,
        radius * 2,
        radius * 2,
      );
    }
    ctx.globalCompositeOperation = "source-over";
  }

  for (const bot of bots) {
    const foreman = bot.kind === "foreman";
    const color = foreman ? foremanColor : workerColor;
    const size = foreman ? bot.size + 1 : bot.size;
    ctx.globalAlpha = (blink ? blinkAlpha(now, bot.phase) : 1) * alphaScale;

    const speed = Math.hypot(bot.vx, bot.vy);
    if (stretch > 0 && speed > 60) {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(bot.x - bot.vx * stretch, bot.y - bot.vy * stretch);
      ctx.lineTo(bot.x, bot.y);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(bot.x - size / 2, bot.y - size / 2, size, size);
    }
  }
  ctx.globalAlpha = 1;
}
