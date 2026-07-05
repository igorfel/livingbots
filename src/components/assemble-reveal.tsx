"use client";

import { useEffect, useRef, useState } from "react";
import { stepBot, type Bot, type Pointer } from "@/lib/bot-engine/swarm";
import { samplePerimeterPoints } from "@/lib/bot-engine/shapes";
import { onEnterOnce, prefersReducedMotion } from "@/lib/bot-engine/config";
import { drawBots } from "@/lib/bot-engine/render";

const BOT_COUNT = 56;
const SETTLE_SECONDS = 1.1;
const FADE_SECONDS = 0.5;

function playAssembly(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onSettled: () => void,
) {
  const rect = container.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const points = samplePerimeterPoints(2, 2, rect.width - 4, rect.height - 4, BOT_COUNT);
  const pointer: Pointer = { x: -9999, y: -9999, active: false };

  let bots: Bot[] = points.map((p, i) => {
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
      kind: "worker",
      phase: Math.random() * Math.PI * 2,
    };
  });

  let start = 0;
  let fadeStarted = false;
  let fadeAlpha = 1;

  function tick(now: number) {
    if (!start) start = now;
    const elapsed = (now - start) / 1000;
    const dt = 1 / 60;

    ctx.clearRect(0, 0, rect.width, rect.height);
    bots = bots.map((b) => stepBot(b, "seek", pointer, dt, Math.random));

    if (elapsed > SETTLE_SECONDS && !fadeStarted) {
      fadeStarted = true;
      onSettled();
    }
    if (fadeStarted) {
      fadeAlpha = Math.max(0, fadeAlpha - dt / FADE_SECONDS);
    }

    drawBots(ctx, bots, { now, alphaScale: fadeAlpha, glow: 2 });

    if (fadeAlpha > 0) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

interface AssembleRevealProps {
  children: React.ReactNode;
  className?: string;
}

/** Bots trace the card's border on first scroll-into-view, then fade as the real content settles in. */
export function AssembleReveal({ children, className }: AssembleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }

    return onEnterOnce(container, () => {
      playAssembly(container, canvas, ctx, () => setRevealed(true));
    });
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <div className={`transition-opacity duration-500 ${revealed ? "opacity-100" : "opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}
