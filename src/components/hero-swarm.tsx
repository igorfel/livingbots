"use client";

import { useEffect, useRef } from "react";
import {
  averageDistanceFromHome,
  burstBot,
  stepBot,
  type Bot,
  type Pointer,
  type SwarmMode,
} from "@/lib/bot-engine/swarm";
import { sampleTextPoints } from "@/lib/bot-engine/text-points";
import { particleCap, prefersReducedMotion } from "@/lib/bot-engine/config";
import { drawBots } from "@/lib/bot-engine/render";

const FOREMAN_RATIO = 0.06;
// Ink at partial alpha instead of clearRect: each frame dims the last, leaving motion trails.
const TRAIL_FADE = "rgba(11, 14, 20, 0.35)";

interface HeroSwarmProps {
  onSettle?: () => void;
  /** Word the swarm assembles. The contact section reuses this scene with its own word. */
  word?: string;
  capDesktop?: number;
  capMobile?: number;
}

export function HeroSwarm({
  onSettle,
  word = "LIVING BOTS",
  capDesktop = 400,
  capMobile = 250,
}: HeroSwarmProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onSettleRef = useRef(onSettle);
  onSettleRef.current = onSettle;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    let bots: Bot[] = [];
    let mode: SwarmMode = "seek";
    let settled = false;
    let settleTimer = 0;
    let visible = true;
    let lastTime = 0;
    let rafId = 0;
    let resizeTimer = 0;
    const pointer: Pointer = { x: -9999, y: -9999, active: false };

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

    function setupBots() {
      const rect = layout();
      const count = particleCap(capDesktop, capMobile);
      const fontPx = Math.min((rect.width / word.length) * 1.55, 150);
      // Sample against 80% of the height so the word centers at 40% — clear of the
      // tagline block that overlays the bottom of the full-bleed scene.
      const points = sampleTextPoints(
        word,
        rect.width,
        rect.height * 0.8,
        fontPx,
        "system-ui, sans-serif",
        count,
      );

      bots = points.map((point, i) => {
        const edge = i % 4;
        const startX =
          edge === 0 ? -20 : edge === 1 ? rect.width + 20 : Math.random() * rect.width;
        const startY =
          edge === 2 ? -20 : edge === 3 ? rect.height + 20 : Math.random() * rect.height;

        return {
          x: startX,
          y: startY,
          vx: 0,
          vy: 0,
          homeX: point.x,
          homeY: point.y,
          size: 3,
          kind: Math.random() < FOREMAN_RATIO ? "foreman" : "worker",
          phase: Math.random() * Math.PI * 2,
        };
      });

      settled = false;
      settleTimer = 0;
      mode = "seek";
    }

    function drawStatic() {
      const rect = layout();
      ctx!.clearRect(0, 0, rect.width, rect.height);
      const settledBots = bots.map((bot) => ({
        ...bot,
        x: bot.homeX,
        y: bot.homeY,
        vx: 0,
        vy: 0,
      }));
      drawBots(ctx!, settledBots, { now: 0, blink: false, stretch: 0 });
    }

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!visible) {
        lastTime = now;
        return;
      }

      const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = now;

      const rect = container!.getBoundingClientRect();
      ctx!.fillStyle = TRAIL_FADE;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      bots = bots.map((bot) => stepBot(bot, mode, pointer, dt, Math.random));
      drawBots(ctx!, bots, { now });

      if (!settled) {
        settleTimer += dt;
        if (settleTimer > 2 || averageDistanceFromHome(bots) < 4) {
          settled = true;
          mode = "loose";
          onSettleRef.current?.();
        }
      }
    }

    setupBots();

    if (reduced) {
      drawStatic();
      onSettleRef.current?.();
    } else {
      rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(container);

    let pointerDownAt: { x: number; y: number; time: number } | null = null;

    function toLocal(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
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
      onPointerMove(e);
      pointerDownAt = { x: e.clientX, y: e.clientY, time: performance.now() };
    }
    function onPointerUp(e: PointerEvent) {
      if (!pointerDownAt) return;
      const moved = Math.hypot(e.clientX - pointerDownAt.x, e.clientY - pointerDownAt.y);
      const elapsed = performance.now() - pointerDownAt.time;
      pointerDownAt = null;
      if (reduced || moved >= 12 || elapsed >= 400) return;

      const origin = toLocal(e.clientX, e.clientY);
      bots = bots.map((bot) => burstBot(bot, origin, 240));
    }

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointerup", onPointerUp);

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (reduced) {
          drawStatic();
        } else {
          setupBots();
        }
      }, 200);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [word, capDesktop, capMobile]);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
