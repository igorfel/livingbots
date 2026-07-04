"use client";

import { useEffect, useRef } from "react";
import { stepBot, type Bot, type Pointer } from "@/lib/bot-engine/swarm";
import { samplePerimeterPoints } from "@/lib/bot-engine/shapes";
import { onEnterOnce, prefersReducedMotion } from "@/lib/bot-engine/config";

const WORKER_COLOR = "#3dd6ff";
const PANEL_COLOR = "#12161f";
const HAIRLINE_COLOR = "#232838";
const ASSEMBLE_SECONDS = 0.9;
const FADE_SECONDS = 0.4;

interface BlockDef {
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  chrome?: boolean;
}

// Normalized (0..1) layout blocks for a one-scroll landing page: chrome bar, hero,
// two feature columns — carried in one at a time, staggered by `delay`.
const BLOCKS: BlockDef[] = [
  { x: 0.04, y: 0.06, w: 0.92, h: 0.14, delay: 0, chrome: true },
  { x: 0.04, y: 0.26, w: 0.92, h: 0.32, delay: 0.5 },
  { x: 0.04, y: 0.64, w: 0.44, h: 0.28, delay: 1.0 },
  { x: 0.52, y: 0.64, w: 0.44, h: 0.28, delay: 1.1 },
];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BlockState {
  def: BlockDef;
  bots: Bot[] | null;
  startedAt: number | null;
  fillAlpha: number;
  botAlpha: number;
}

function pixelRect(rect: { width: number; height: number }, def: BlockDef): Rect {
  return {
    x: def.x * rect.width,
    y: def.y * rect.height,
    w: def.w * rect.width,
    h: def.h * rect.height,
  };
}

function drawBlockFill(ctx: CanvasRenderingContext2D, rect: Rect, def: BlockDef, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PANEL_COLOR;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = HAIRLINE_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);

  if (def.chrome) {
    const dotR = Math.max(2, rect.h * 0.12);
    const cy = rect.y + rect.h / 2;
    for (const [i, color] of ["#ff3d6e", "#7c8496", "#3dd6ff"].entries()) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(rect.x + rect.h * 0.5 + i * dotR * 2.6, cy, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = HAIRLINE_COLOR;
    const barX = rect.x + rect.h * 3;
    ctx.fillRect(barX, cy - rect.h * 0.18, rect.w - rect.h * 3.5, rect.h * 0.36);
  }
  ctx.globalAlpha = 1;
}

function spawnBots(rect: { width: number; height: number }, def: BlockDef): Bot[] {
  const perim = 2 * (def.w * rect.width + def.h * rect.height);
  const count = Math.max(12, Math.round(perim / 10));
  const pr = pixelRect(rect, def);
  const points = samplePerimeterPoints(pr.x, pr.y, pr.w, pr.h, count);

  return points.map((p, i) => {
    const edge = i % 4;
    const startX = edge === 0 ? -20 : edge === 1 ? rect.width + 20 : Math.random() * rect.width;
    const startY = edge === 2 ? -20 : edge === 3 ? rect.height + 20 : Math.random() * rect.height;
    return {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      homeX: p.x,
      homeY: p.y,
      size: 3,
      kind: "worker" as const,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

/** Browser-frame mockup that bots carry in, block by block, on first scroll-into-view. */
export function AcaiMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    function layout() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    }

    if (prefersReducedMotion()) {
      const rect = layout();
      for (const def of BLOCKS) drawBlockFill(ctx, pixelRect(rect, def), def, 1);
      return;
    }

    const pointer: Pointer = { x: -9999, y: -9999, active: false };
    const states: BlockState[] = BLOCKS.map((def) => ({
      def,
      bots: null,
      startedAt: null,
      fillAlpha: 0,
      botAlpha: 1,
    }));

    let start = 0;
    let rafId = 0;

    function tick(now: number) {
      if (!start) start = now;
      const elapsed = (now - start) / 1000;
      const dt = 1 / 60;
      const rect = container!.getBoundingClientRect();

      ctx!.clearRect(0, 0, rect.width, rect.height);

      let allSettled = true;
      for (const state of states) {
        if (elapsed < state.def.delay) {
          allSettled = false;
          continue;
        }
        if (state.startedAt === null) state.startedAt = elapsed;
        const local = elapsed - state.startedAt;

        if (state.bots === null) state.bots = spawnBots(rect, state.def);

        if (local < ASSEMBLE_SECONDS + FADE_SECONDS) {
          allSettled = false;
          state.bots = state.bots.map((b) => stepBot(b, "seek", pointer, dt, Math.random));
        }

        if (local > ASSEMBLE_SECONDS) {
          state.fillAlpha = Math.min(1, (local - ASSEMBLE_SECONDS) / FADE_SECONDS);
          state.botAlpha = Math.max(0, 1 - (local - ASSEMBLE_SECONDS) / FADE_SECONDS);
        }

        if (state.fillAlpha > 0) {
          drawBlockFill(ctx!, pixelRect(rect, state.def), state.def, state.fillAlpha);
        }
        if (state.botAlpha > 0) {
          ctx!.globalAlpha = state.botAlpha;
          ctx!.fillStyle = WORKER_COLOR;
          for (const b of state.bots) ctx!.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
          ctx!.globalAlpha = 1;
        }
      }

      if (!allSettled) rafId = requestAnimationFrame(tick);
    }

    const disconnect = onEnterOnce(container, () => {
      layout();
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mb-2 aspect-[16/10] w-full overflow-hidden rounded-lg border border-hairline bg-ink/40"
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
