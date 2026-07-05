"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/bot-engine/config";
import { factoryGates } from "@/lib/content";

const WORKER_COLOR = "#3dd6ff";
const FOREMAN_COLOR = "#ff3d6e";
const TICKET_COLOR = "#e8ecf1";
const LINE_COLOR = "#232838";
const FAIL_COLOR = "#ff4d4d";

const SPAWN_X_FRAC = 0.06;
const GATE_X_FRACS = [0.32, 0.58, 0.82];
const TRUNK_X_FRAC = 0.94;
const BASELINE_Y_FRAC = 0.55;

const SPEED = 90; // px/s
const BOUNCE_SPEED = 140; // px/s
const BOUNCE_DIST = 55; // px
const CHECK_SECONDS = 0.35;
const FAIL_CHANCE = 0.3;
const SPAWN_INTERVAL_S = 2.4;
const MAX_TICKETS = 6;

type Status = "traveling" | "checking" | "bounce" | "entering" | "done";

interface Ticket {
  x: number;
  gateIndex: number; // 0..2 = tsc/eslint/vitest gate ahead, 3 = trunk
  status: Status;
  bounceTargetX: number;
  checkTimer: number;
  failTagTimer: number;
  phase: number;
}

function targetXFor(gateIndex: number, size: { width: number }) {
  if (gateIndex < GATE_X_FRACS.length) return GATE_X_FRACS[gateIndex] * size.width;
  return TRUNK_X_FRAC * size.width;
}

function drawTicket(
  ctx: CanvasRenderingContext2D,
  ticket: Ticket,
  y: number,
  now: number,
  alpha: number,
) {
  const bob = Math.sin(now / 300 + ticket.phase) * 2;
  const ty = y + bob;

  // Flanking carrier bots.
  ctx.globalAlpha = alpha;
  ctx.fillStyle = WORKER_COLOR;
  ctx.fillRect(ticket.x - 14, ty - 1.5, 3, 3);
  ctx.fillRect(ticket.x + 11, ty - 1.5, 3, 3);

  ctx.fillStyle = "#12161f";
  ctx.fillRect(ticket.x - 7, ty - 7, 14, 14);
  ctx.strokeStyle = TICKET_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(ticket.x - 7, ty - 7, 14, 14);
  ctx.globalAlpha = 1;

  if (ticket.failTagTimer > 0) {
    ctx.globalAlpha = Math.min(1, ticket.failTagTimer);
    ctx.fillStyle = FAIL_COLOR;
    ctx.font = "10px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("agent:feedback", ticket.x, ty - 14);
    ctx.globalAlpha = 1;
  }
}

export function FactoryConveyor() {
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

    function drawTrack(rect: { width: number; height: number }) {
      const y = rect.height * BASELINE_Y_FRAC;
      ctx!.strokeStyle = LINE_COLOR;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(rect.width * SPAWN_X_FRAC, y);
      ctx!.lineTo(rect.width * TRUNK_X_FRAC, y);
      ctx!.stroke();

      ctx!.font = "11px ui-monospace, monospace";
      ctx!.textAlign = "center";
      GATE_X_FRACS.forEach((frac, i) => {
        const x = rect.width * frac;
        ctx!.strokeStyle = LINE_COLOR;
        ctx!.setLineDash([3, 4]);
        ctx!.beginPath();
        ctx!.moveTo(x, y - rect.height * 0.28);
        ctx!.lineTo(x, y + rect.height * 0.28);
        ctx!.stroke();
        ctx!.setLineDash([]);
        ctx!.fillStyle = "#7c8496";
        ctx!.fillText(factoryGates[i], x, y - rect.height * 0.28 - 8);
      });

      const trunkX = rect.width * TRUNK_X_FRAC;
      ctx!.strokeStyle = WORKER_COLOR;
      ctx!.lineWidth = 1.5;
      ctx!.strokeRect(trunkX - 20, y - 26, 40, 52);
      ctx!.fillStyle = WORKER_COLOR;
      ctx!.fillText("main", trunkX, y + 40);
    }

    if (prefersReducedMotion()) {
      const rect = layout();
      drawTrack(rect);
      const y = rect.height * BASELINE_Y_FRAC;
      ctx.fillStyle = FOREMAN_COLOR;
      ctx.fillRect(rect.width * SPAWN_X_FRAC - 6, y - 6, 12, 12);
      const midTicket: Ticket = {
        x: rect.width * GATE_X_FRACS[1],
        gateIndex: 2,
        status: "traveling",
        bounceTargetX: 0,
        checkTimer: 0,
        failTagTimer: 0,
        phase: 0,
      };
      drawTicket(ctx, midTicket, y, 0, 1);
      return;
    }

    let visible = true;
    let rafId = 0;
    let resizeTimer = 0;
    let lastTime = 0;
    let sinceSpawn = SPAWN_INTERVAL_S; // spawn one immediately
    let foremanFlash = 0;
    let tickets: Ticket[] = [];

    function spawn(rect: { width: number }) {
      if (tickets.length >= MAX_TICKETS) return;
      tickets.push({
        x: rect.width * SPAWN_X_FRAC,
        gateIndex: 0,
        status: "traveling",
        bounceTargetX: 0,
        checkTimer: 0,
        failTagTimer: 0,
        phase: Math.random() * Math.PI * 2,
      });
      foremanFlash = 0.3;
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
      const y = rect.height * BASELINE_Y_FRAC;

      ctx!.clearRect(0, 0, rect.width, rect.height);
      drawTrack(rect);

      sinceSpawn += dt;
      if (sinceSpawn >= SPAWN_INTERVAL_S) {
        sinceSpawn = 0;
        spawn(rect);
      }

      foremanFlash = Math.max(0, foremanFlash - dt);
      const foremanScale = 1 + foremanFlash * 0.6;
      const foremanSize = 12 * foremanScale;
      ctx!.fillStyle = FOREMAN_COLOR;
      ctx!.fillRect(
        rect.width * SPAWN_X_FRAC - foremanSize / 2,
        y - foremanSize / 2,
        foremanSize,
        foremanSize,
      );

      tickets = tickets.filter((ticket) => {
        if (ticket.failTagTimer > 0) ticket.failTagTimer -= dt;

        if (ticket.status === "traveling") {
          const targetX = targetXFor(ticket.gateIndex, rect);
          const dir = Math.sign(targetX - ticket.x) || 1;
          ticket.x += dir * SPEED * dt;
          const reached = dir > 0 ? ticket.x >= targetX : ticket.x <= targetX;
          if (reached) {
            ticket.x = targetX;
            if (ticket.gateIndex >= GATE_X_FRACS.length) {
              ticket.status = "entering";
              ticket.checkTimer = 0.35;
            } else {
              ticket.status = "checking";
              ticket.checkTimer = CHECK_SECONDS;
            }
          }
        } else if (ticket.status === "checking") {
          ticket.checkTimer -= dt;
          if (ticket.checkTimer <= 0) {
            const failed = Math.random() < FAIL_CHANCE;
            if (failed) {
              ticket.status = "bounce";
              ticket.bounceTargetX = Math.max(
                rect.width * SPAWN_X_FRAC,
                ticket.x - BOUNCE_DIST,
              );
              ticket.failTagTimer = 1.1;
            } else {
              ticket.gateIndex += 1;
              ticket.status = "traveling";
            }
          }
        } else if (ticket.status === "bounce") {
          ticket.x -= BOUNCE_SPEED * dt;
          if (ticket.x <= ticket.bounceTargetX) {
            ticket.status = "traveling";
          }
        } else if (ticket.status === "entering") {
          ticket.checkTimer -= dt;
          if (ticket.checkTimer <= 0) {
            ticket.status = "done";
          }
        }

        if (ticket.status === "done") return false;

        const alpha = ticket.status === "entering" ? Math.max(0, ticket.checkTimer / 0.35) : 1;
        drawTicket(ctx!, ticket, y, now, alpha);
        return true;
      });
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
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="scene-bleed relative mt-8 aspect-[21/9] w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
