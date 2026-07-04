"use client";

import { useEffect, useRef } from "react";
import { stepBot, type Bot, type Pointer } from "@/lib/bot-engine/swarm";
import { samplePerimeterPoints } from "@/lib/bot-engine/shapes";
import { prefersReducedMotion } from "@/lib/bot-engine/config";

const BUG_COLOR = "#ff4d4d";
const WORKER_COLOR = "#3dd6ff";
const PANEL_COLOR = "#12161f";
const HAIRLINE_COLOR = "#232838";
const LINE_COLOR = "#232838";

const STAGE_IDS = ["see", "sense", "fix", "strengthen"] as const;
type StageId = (typeof STAGE_IDS)[number];

const SEE_S = 2.2;
const SENSE_S = 1.6;
const FIX_S = 2.4;
const STRENGTHEN_S = 1.8;
const TOTAL_S = SEE_S + SENSE_S + FIX_S + STRENGTHEN_S;

// Normalized (0..1) positions within the code-block area, and which line "row" they sit on.
const BUGS = [
  { x: 0.72, y: 0.22 },
  { x: 0.35, y: 0.38 },
  { x: 0.58, y: 0.52 },
  { x: 0.2, y: 0.68 },
  { x: 0.68, y: 0.82 },
];

const CODE_LINES = [0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.88];
const LINE_WIDTHS = [0.55, 0.4, 0.68, 0.3, 0.5, 0.62, 0.35];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BugState {
  x: number;
  y: number;
  revealed: number; // 0..1
  fixed: number; // 0 (buggy) .. 1 (fixed/faded out)
  bots: Bot[] | null;
}

function setActiveStageCard(stage: StageId) {
  for (const id of STAGE_IDS) {
    const el = document.getElementById(`stage-${id}`);
    el?.classList.toggle("stage-active", id === stage);
  }
}

function clearActiveStageCard() {
  for (const id of STAGE_IDS) {
    document.getElementById(`stage-${id}`)?.classList.remove("stage-active");
  }
}

function blockRect(size: { width: number; height: number }): Rect {
  return { x: size.width * 0.08, y: size.height * 0.1, w: size.width * 0.84, h: size.height * 0.8 };
}

function drawCodeBlock(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.fillStyle = PANEL_COLOR;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = HAIRLINE_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);

  ctx.fillStyle = LINE_COLOR;
  const lineH = Math.max(3, rect.h * 0.035);
  for (let i = 0; i < CODE_LINES.length; i++) {
    const ly = rect.y + CODE_LINES[i] * rect.h;
    const lw = LINE_WIDTHS[i] * rect.w * 0.85;
    ctx.fillRect(rect.x + rect.w * 0.06, ly, lw, lineH);
  }
}

function bugPixel(rect: Rect, bug: { x: number; y: number }) {
  return { x: rect.x + bug.x * rect.w, y: rect.y + bug.y * rect.h };
}

export function SixthSense() {
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
      const block = blockRect(rect);
      drawCodeBlock(ctx, block);
      // Healed end-state: full lattice border, no bugs.
      const points = samplePerimeterPoints(block.x, block.y, block.w, block.h, 48);
      ctx.strokeStyle = WORKER_COLOR;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();
      setActiveStageCard("strengthen");
      return () => clearActiveStageCard();
    }

    const pointer: Pointer = { x: -9999, y: -9999, active: false };
    let visible = true;
    let rafId = 0;
    let resizeTimer = 0;
    let start = 0;
    let lastCycleIndex = -1;
    let bugs: BugState[] = BUGS.map((b) => ({ ...b, revealed: 0, fixed: 0, bots: null }));

    function resetCycle() {
      bugs = BUGS.map((b) => ({ ...b, revealed: 0, fixed: 0, bots: null }));
    }

    function spawnBugBots(rect: { width: number; height: number }, home: { x: number; y: number }): Bot[] {
      return Array.from({ length: 7 }, (_, i) => {
        const edge = i % 4;
        const startX = edge === 0 ? -20 : edge === 1 ? rect.width + 20 : Math.random() * rect.width;
        const startY = edge === 2 ? -20 : edge === 3 ? rect.height + 20 : Math.random() * rect.height;
        return {
          x: startX,
          y: startY,
          vx: 0,
          vy: 0,
          homeX: home.x,
          homeY: home.y,
          size: 3,
          kind: "worker" as const,
          phase: Math.random() * Math.PI * 2,
        };
      });
    }

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!visible) {
        start = 0;
        return;
      }
      if (!start) start = now;
      const dt = 1 / 60;
      const elapsed = (now - start) / 1000;
      const cycleIndex = Math.floor(elapsed / TOTAL_S);
      let cycleT = elapsed % TOTAL_S;

      if (cycleIndex !== lastCycleIndex) {
        lastCycleIndex = cycleIndex;
        resetCycle();
      }

      const rect = container!.getBoundingClientRect();
      const block = blockRect(rect);

      ctx!.clearRect(0, 0, rect.width, rect.height);
      drawCodeBlock(ctx!, block);

      let stage: StageId;
      let localT: number;
      if (cycleT < SEE_S) {
        stage = "see";
        localT = cycleT;
      } else if ((cycleT -= SEE_S) < SENSE_S) {
        stage = "sense";
        localT = cycleT;
      } else if ((cycleT -= SENSE_S) < FIX_S) {
        stage = "fix";
        localT = cycleT;
      } else {
        stage = "strengthen";
        localT = cycleT - FIX_S;
      }
      setActiveStageCard(stage);

      if (stage === "see") {
        const scannerY = block.y + (localT / SEE_S) * block.h;
        for (const bug of bugs) {
          const p = bugPixel(block, bug);
          if (p.y <= scannerY) bug.revealed = Math.min(1, bug.revealed + dt / 0.25);
        }
        ctx!.strokeStyle = "rgba(232,236,241,0.7)";
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(block.x, scannerY);
        ctx!.lineTo(block.x + block.w, scannerY);
        ctx!.stroke();
      } else {
        for (const bug of bugs) bug.revealed = 1;
      }

      if (stage === "fix") {
        for (const bug of bugs) {
          if (!bug.bots) bug.bots = spawnBugBots(rect, bugPixel(block, bug));
          if (localT < FIX_S - 0.6) {
            bug.bots = bug.bots.map((b) => stepBot(b, "seek", pointer, dt, Math.random));
          } else {
            bug.fixed = Math.min(1, bug.fixed + dt / 0.6);
          }
        }
      }

      for (const bug of bugs) {
        const p = bugPixel(block, bug);
        const alpha = bug.revealed * (1 - bug.fixed);

        if (stage === "sense" && alpha > 0) {
          const pulse = (localT % 0.6) / 0.6;
          ctx!.strokeStyle = `rgba(255,77,77,${(1 - pulse) * 0.6})`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 6 + pulse * 14, 0, Math.PI * 2);
          ctx!.stroke();
        }

        if (alpha > 0) {
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = BUG_COLOR;
          ctx!.fillRect(p.x - 3, p.y - 3, 6, 6);
          ctx!.globalAlpha = 1;
        }

        if (bug.bots && bug.fixed < 1) {
          ctx!.globalAlpha = 1 - bug.fixed;
          ctx!.fillStyle = WORKER_COLOR;
          for (const b of bug.bots) ctx!.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
          ctx!.globalAlpha = 1;
        }
      }

      if (stage === "strengthen") {
        const progress = localT / STRENGTHEN_S;
        const points = samplePerimeterPoints(block.x, block.y, block.w, block.h, 48);
        const upTo = Math.max(1, Math.floor(progress * points.length));
        ctx!.strokeStyle = WORKER_COLOR;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        for (let i = 0; i < upTo; i++) {
          const p = points[i];
          if (i === 0) ctx!.moveTo(p.x, p.y);
          else ctx!.lineTo(p.x, p.y);
        }
        ctx!.stroke();
      }
    }

    layout();
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
      window.removeEventListener("resize", onResize);
      clearActiveStageCard();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-hairline bg-ink"
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
