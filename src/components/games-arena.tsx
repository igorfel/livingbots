"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/bot-engine/config";

const WORKER_COLOR = "#3dd6ff";
const FOREMAN_COLOR = "#ff3d6e";

type TargetId = "shooting-stars" | "stack-rivals" | "bomb-arena" | "orbit-runner";

interface TargetDef {
  id: TargetId;
  baseXFrac: number;
  baseYFrac: number;
  ampXFrac: number;
  ampYFrac: number;
  freqX: number;
  freqY: number;
  phase: number;
}

// Gentle idle drift only — plain sine bob, no steering engine needed for 4 fixed points.
const TARGETS: TargetDef[] = [
  { id: "shooting-stars", baseXFrac: 0.2, baseYFrac: 0.3, ampXFrac: 0.05, ampYFrac: 0.09, freqX: 0.5, freqY: 0.4, phase: 0 },
  { id: "stack-rivals", baseXFrac: 0.76, baseYFrac: 0.26, ampXFrac: 0.04, ampYFrac: 0.07, freqX: 0.4, freqY: 0.5, phase: 1.4 },
  { id: "bomb-arena", baseXFrac: 0.26, baseYFrac: 0.72, ampXFrac: 0.05, ampYFrac: 0.06, freqX: 0.35, freqY: 0.45, phase: 2.8 },
  { id: "orbit-runner", baseXFrac: 0.78, baseYFrac: 0.68, ampXFrac: 0.04, ampYFrac: 0.08, freqX: 0.45, freqY: 0.3, phase: 4.2 },
];

const HIT_RADIUS = 26;
const TAP_RADIUS = 30;
const HIT_COOLDOWN_MS = 1200;

function targetPos(size: { width: number; height: number }, def: TargetDef, t: number) {
  return {
    x: (def.baseXFrac + def.ampXFrac * Math.sin(t * def.freqX + def.phase)) * size.width,
    y: (def.baseYFrac + def.ampYFrac * Math.cos(t * def.freqY + def.phase)) * size.height,
  };
}

function drawShootingStar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const r = 8;
  ctx.strokeStyle = "rgba(61,214,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.8, cy - r * 1.8);
  ctx.lineTo(cx - r * 0.4, cy - r * 0.4);
  ctx.stroke();

  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    const px = cx + rad * Math.cos(angle);
    const py = cy + rad * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSynthBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const s = 16;
  ctx.fillStyle = WORKER_COLOR;
  ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
  ctx.fillStyle = FOREMAN_COLOR;
  ctx.fillRect(cx - s / 2, cy - s / 2, s, s * 0.18);
  ctx.strokeStyle = "rgba(11,14,20,0.55)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    const ly = cy - s / 2 + s * 0.18 + (s * 0.82) * (i / 3);
    ctx.beginPath();
    ctx.moveTo(cx - s / 2, ly);
    ctx.lineTo(cx + s / 2, ly);
    ctx.stroke();
  }
}

function drawArtillery(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const r = 6;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = FOREMAN_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - r * 3.2, cy + r * 1.6);
  ctx.quadraticCurveTo(cx - r * 1.6, cy - r * 2.8, cx, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrbitPlanet(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const r = 7;
  ctx.strokeStyle = "rgba(61,214,255,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.9, r * 0.75, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  const moonAngle = t * 2;
  const cos = Math.cos(-0.3);
  const sin = Math.sin(-0.3);
  const ex = Math.cos(moonAngle) * r * 1.9;
  const ey = Math.sin(moonAngle) * r * 0.75;
  const mx = cx + ex * cos - ey * sin;
  const my = cy + ex * sin + ey * cos;
  ctx.fillStyle = FOREMAN_COLOR;
  ctx.beginPath();
  ctx.arc(mx, my, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawTarget(ctx: CanvasRenderingContext2D, id: TargetId, x: number, y: number, t: number) {
  if (id === "shooting-stars") drawShootingStar(ctx, x, y);
  else if (id === "stack-rivals") drawSynthBlock(ctx, x, y);
  else if (id === "bomb-arena") drawArtillery(ctx, x, y);
  else drawOrbitPlanet(ctx, x, y, t);
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x - 6, y + 6);
  ctx.lineTo(x + 6, y + 6);
  ctx.closePath();
  ctx.fill();
}

function triggerHit(id: TargetId) {
  const el = document.getElementById(`game-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("arena-hit");
  window.setTimeout(() => el.classList.remove("arena-hit"), 1400);
}

export function GamesArena() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx || prefersReducedMotion()) return;

    let visible = true;
    let rafId = 0;
    let resizeTimer = 0;
    let width = 0;
    let height = 0;
    const ship = { x: 0, y: 0, initialized: false };
    const pointer = { x: -9999, y: -9999, active: false };
    const cooldowns = new Map<TargetId, number>();

    function layout() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = rect.width;
      height = rect.height;
      if (!ship.initialized) {
        ship.x = width / 2;
        ship.y = height / 2;
        ship.initialized = true;
      }
    }
    layout();

    function toLocal(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function tryHit(x: number, y: number, radius: number, now: number) {
      for (const def of TARGETS) {
        const pos = targetPos({ width, height }, def, now / 1000);
        const cooldownUntil = cooldowns.get(def.id) ?? 0;
        if (now < cooldownUntil) continue;
        if (Math.hypot(x - pos.x, y - pos.y) < radius) {
          cooldowns.set(def.id, now + HIT_COOLDOWN_MS);
          triggerHit(def.id);
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      const p = toLocal(e.clientX, e.clientY);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
    }
    function onPointerLeave() {
      pointer.active = false;
    }
    function onPointerDown(e: PointerEvent) {
      const p = toLocal(e.clientX, e.clientY);
      tryHit(p.x, p.y, TAP_RADIUS, performance.now());
    }

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;
      const t = now / 1000;

      ctx!.clearRect(0, 0, width, height);

      if (pointer.active) {
        ship.x += (pointer.x - ship.x) * 0.18;
        ship.y += (pointer.y - ship.y) * 0.18;
      }

      for (const def of TARGETS) {
        const pos = targetPos({ width, height }, def, t);
        drawTarget(ctx!, def.id, pos.x, pos.y, t);
        if (pointer.active && Math.hypot(ship.x - pos.x, ship.y - pos.y) < HIT_RADIUS) {
          tryHit(ship.x, ship.y, HIT_RADIUS, now);
        }
      }

      drawShip(ctx!, ship.x, ship.y);
    }
    rafId = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(container);

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 200);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mt-8 aspect-[21/9] w-full touch-none overflow-hidden rounded-2xl border border-hairline bg-panel motion-reduce:hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
