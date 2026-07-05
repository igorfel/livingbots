"use client";

import { useEffect, useRef } from "react";
import { stepBot, type Bot, type Pointer } from "@/lib/bot-engine/swarm";
import { particleCap, prefersReducedMotion } from "@/lib/bot-engine/config";
import { drawBots } from "@/lib/bot-engine/render";

const FOREMAN_RATIO = 0.08;
const REVOLUTION_MS = 26000;

interface Group {
  angle: number;
  radiusFrac: number;
  count: number;
  spin: boolean;
  localSpread: number;
}

// Mirrors the real, static <a> positions in orbit.tsx (angle -90/30/150, radius 48%) —
// this canvas is a decorative backdrop only, the actual tap targets stay fixed real HTML.
// localSpread exceeds each real circle's own radius (core 48px, clusters 32px) so
// bots visibly halo around the solid disc instead of hiding entirely behind it.
const GROUPS: Group[] = [
  { angle: 0, radiusFrac: 0, count: 24, spin: false, localSpread: 78 },
  { angle: -90, radiusFrac: 0.48, count: 16, spin: true, localSpread: 52 },
  { angle: 30, radiusFrac: 0.48, count: 16, spin: true, localSpread: 52 },
  { angle: 150, radiusFrac: 0.48, count: 16, spin: true, localSpread: 52 },
];

interface OrbitBot extends Bot {
  groupIndex: number;
  localOffsetX: number;
  localOffsetY: number;
}

function groupCenter(rect: { width: number; height: number }, group: Group, elapsedMs: number) {
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  if (group.radiusFrac === 0) return { x: cx, y: cy };

  // Mirrors orbit.tsx's `left/top: (50 + radius*cos/sin)%` math: radius there is a
  // percentage of the full container size, not of its half — no extra /2 here.
  const orbitRadius = Math.min(rect.width, rect.height) * group.radiusFrac;
  const spinDeg = group.spin ? (elapsedMs / REVOLUTION_MS) * 360 : 0;
  const angleRad = ((group.angle + spinDeg) * Math.PI) / 180;
  return {
    x: cx + orbitRadius * Math.cos(angleRad),
    y: cy + orbitRadius * Math.sin(angleRad),
  };
}

export function OrbitSwarm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const pointer: Pointer = { x: -9999, y: -9999, active: false };
    let bots: OrbitBot[] = [];
    let visible = true;
    let lastTime = 0;
    let rafId = 0;
    let resizeTimer = 0;
    const startTime = performance.now();

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
      const scale = particleCap(1, 0.6, 640);
      bots = [];
      GROUPS.forEach((group, groupIndex) => {
        const count = Math.max(4, Math.round(group.count * scale));
        const center = groupCenter(rect, group, 0);
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * group.localSpread;
          const localOffsetX = Math.cos(a) * r;
          const localOffsetY = Math.sin(a) * r;
          bots.push({
            x: center.x + localOffsetX,
            y: center.y + localOffsetY,
            vx: 0,
            vy: 0,
            homeX: center.x + localOffsetX,
            homeY: center.y + localOffsetY,
            size: 3,
            kind: Math.random() < FOREMAN_RATIO ? "foreman" : "worker",
            phase: Math.random() * Math.PI * 2,
            groupIndex,
            localOffsetX,
            localOffsetY,
          });
        }
      });
    }

    function draw(rect: { width: number; height: number }, elapsedMs: number) {
      // Translucent ink instead of clearRect: orbiting bots leave faint trails.
      ctx!.fillStyle = "rgba(11, 14, 20, 0.25)";
      ctx!.fillRect(0, 0, rect.width, rect.height);
      drawBots(ctx!, bots, { now: elapsedMs, glow: 2.5 });
    }

    setupBots();

    if (reduced) {
      draw(container.getBoundingClientRect(), 0);
    } else {
      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        if (!visible) {
          lastTime = now;
          return;
        }
        const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
        lastTime = now;
        const elapsedMs = now - startTime;
        const rect = container!.getBoundingClientRect();

        bots = bots.map((bot) => {
          const center = groupCenter(rect, GROUPS[bot.groupIndex], elapsedMs);
          const homeX = center.x + bot.localOffsetX;
          const homeY = center.y + bot.localOffsetY;
          const stepped = stepBot({ ...bot, homeX, homeY }, "seek", pointer, dt, Math.random);
          return { ...bot, x: stepped.x, y: stepped.y, vx: stepped.vx, vy: stepped.vy, homeX, homeY };
        });

        draw(rect, elapsedMs);
      };
      rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(container);

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setupBots();
        if (reduced) draw(container!.getBoundingClientRect(), 0);
      }, 200);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
