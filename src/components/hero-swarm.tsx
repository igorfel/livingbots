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

const WORKER_COLOR = "#3dd6ff";
const FOREMAN_COLOR = "#ff3d6e";
const FOREMAN_RATIO = 0.06;
const FORMATION_WORD = "LIVING BOTS";

interface HeroSwarmProps {
  onSettle?: () => void;
}

export function HeroSwarm({ onSettle }: HeroSwarmProps) {
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
      const count = particleCap(400, 250);
      const fontPx = Math.min(rect.width / 8, 90);
      const points = sampleTextPoints(
        FORMATION_WORD,
        rect.width,
        rect.height,
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
      for (const bot of bots) {
        ctx!.fillStyle = bot.kind === "foreman" ? FOREMAN_COLOR : WORKER_COLOR;
        ctx!.fillRect(bot.homeX - bot.size / 2, bot.homeY - bot.size / 2, bot.size, bot.size);
      }
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
      ctx!.clearRect(0, 0, rect.width, rect.height);

      bots = bots.map((bot) => stepBot(bot, mode, pointer, dt, Math.random));

      for (const bot of bots) {
        const blink = 0.75 + 0.25 * Math.sin(now / 400 + bot.phase);
        ctx!.globalAlpha = blink;
        ctx!.fillStyle = bot.kind === "foreman" ? FOREMAN_COLOR : WORKER_COLOR;
        ctx!.fillRect(bot.x - bot.size / 2, bot.y - bot.size / 2, bot.size, bot.size);
      }
      ctx!.globalAlpha = 1;

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
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
    </div>
  );
}
