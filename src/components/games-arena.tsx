"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { prefersReducedMotion } from "@/lib/bot-engine/config";
import { drawGameGlyph, type GameId } from "@/lib/game-glyphs";
import { games } from "@/lib/content";

const WORKER_COLOR = "#3dd6ff";

type TargetId = GameId;

const TARGET_NAMES = Object.fromEntries(
  games.map((game) => [game.id, game.name]),
) as Record<TargetId, string>;

const BURST_SECONDS = 0.45;

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
const PANEL_WIDTH = 260;

interface HitInfo {
  id: TargetId;
  x: number;
  y: number;
  rectW: number;
  rectH: number;
}

function targetPos(size: { width: number; height: number }, def: TargetDef, t: number) {
  return {
    x: (def.baseXFrac + def.ampXFrac * Math.sin(t * def.freqX + def.phase)) * size.width,
    y: (def.baseYFrac + def.ampYFrac * Math.cos(t * def.freqY + def.phase)) * size.height,
  };
}

const FOREMAN_COLOR = "#ff3d6e";

/**
 * Player ship. Drawn nose-up in local space, then rotated by `angle` (the
 * heading, already offset so 0 = pointing up). `speed` drives the thruster
 * flame length; `now` flickers it.
 */
function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  speed: number,
  now: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Thruster flame out the tail, length scaling with speed, flickering.
  const flicker = 0.7 + 0.3 * Math.sin(now / 55);
  const flameLen = (5 + Math.min(speed, 16) * 1.15) * flicker;
  const flame = ctx.createLinearGradient(0, 6, 0, 6 + flameLen);
  flame.addColorStop(0, "rgba(255, 61, 110, 0.95)");
  flame.addColorStop(0.5, "rgba(255, 61, 110, 0.5)");
  flame.addColorStop(1, "rgba(255, 61, 110, 0)");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-3.2, 6);
  ctx.lineTo(3.2, 6);
  ctx.lineTo(0, 6 + flameLen);
  ctx.closePath();
  ctx.fill();

  // Hull with a cyan bloom.
  ctx.shadowColor = WORKER_COLOR;
  ctx.shadowBlur = 12;
  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, -10); // nose
  ctx.lineTo(7.5, 6); // right wing
  ctx.lineTo(0, 2.5); // tail notch
  ctx.lineTo(-7.5, 6); // left wing
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Cockpit accent — foreman magenta, so the ship reads as "piloted".
  ctx.fillStyle = FOREMAN_COLOR;
  ctx.beginPath();
  ctx.arc(0, -3, 1.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function triggerHit(id: TargetId) {
  const el = document.getElementById(`game-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("arena-hit");
  window.setTimeout(() => el.classList.remove("arena-hit"), 1400);
}

export function GamesArena({ hint }: { hint: string }) {
  const t = useTranslations("Games");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Mirrors `activeHit` for the imperative render loop, which can't read React
  // state directly: a hit opens a HUD summary instead of navigating straight
  // to the card, and a second hit shouldn't retarget while one is already up.
  const activeHitRef = useRef<TargetId | null>(null);
  const popupPanelRef = useRef<HTMLDivElement>(null);
  const [activeHit, setActiveHit] = useState<HitInfo | null>(null);
  // Wide screens float the popup at the hit point; narrow screens dock it to
  // the arena's bottom edge, where it's guaranteed fully visible.
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    // angle is the drawn heading (0 = nose up); it eases toward the velocity
    // direction so turns bank smoothly instead of snapping.
    const ship = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, initialized: false };
    const trail: { x: number; y: number }[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    const cooldowns = new Map<TargetId, number>();
    const bursts: { x: number; y: number; start: number }[] = [];

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
      if (activeHitRef.current) return;
      for (const def of TARGETS) {
        const pos = targetPos({ width, height }, def, now / 1000);
        const cooldownUntil = cooldowns.get(def.id) ?? 0;
        if (now < cooldownUntil) continue;
        if (Math.hypot(x - pos.x, y - pos.y) < radius) {
          cooldowns.set(def.id, now + HIT_COOLDOWN_MS);
          bursts.push({ x: pos.x, y: pos.y, start: now });
          activeHitRef.current = def.id;
          setActiveHit({ id: def.id, x: pos.x, y: pos.y, rectW: width, rectH: height });
          return;
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      const p = toLocal(e.clientX, e.clientY);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
    }
    function onPointerLeave(e: PointerEvent) {
      // Only a departing mouse cursor stops the follow. A touch has no hover, so
      // deactivating on its post-tap leave would freeze the ship before it
      // reaches the tapped point.
      if (e.pointerType === "mouse") pointer.active = false;
    }
    function onPointerDown(e: PointerEvent) {
      if (activeHitRef.current) {
        // A pointerdown on the popup itself (View details / dismiss) must reach
        // that element's own click handler — treating it as an outside click
        // here would close the popup before the click ever fires on it.
        if (popupPanelRef.current?.contains(e.target as Node)) return;
        activeHitRef.current = null;
        setActiveHit(null);
        return;
      }
      const p = toLocal(e.clientX, e.clientY);
      // Tapping steers the ship to that point — the only way to move it on touch,
      // and harmless on desktop where hover already tracks the cursor.
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
      tryHit(p.x, p.y, TAP_RADIUS, performance.now());
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && activeHitRef.current) {
        activeHitRef.current = null;
        setActiveHit(null);
      }
    }

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;
      const t = now / 1000;

      ctx!.clearRect(0, 0, width, height);

      if (pointer.active) {
        const nx = ship.x + (pointer.x - ship.x) * 0.18;
        const ny = ship.y + (pointer.y - ship.y) * 0.18;
        ship.vx = nx - ship.x;
        ship.vy = ny - ship.y;
        ship.x = nx;
        ship.y = ny;
      } else {
        ship.vx *= 0.9;
        ship.vy *= 0.9;
      }

      const speed = Math.hypot(ship.vx, ship.vy);
      if (speed > 0.4) {
        // Heading points along velocity; +PI/2 because the hull is drawn nose-up
        // (−Y) while atan2 measures from +X. Ease via shortest angular path.
        const target = Math.atan2(ship.vy, ship.vx) + Math.PI / 2;
        const diff = Math.atan2(
          Math.sin(target - ship.angle),
          Math.cos(target - ship.angle),
        );
        ship.angle += diff * 0.2;

        trail.push({ x: ship.x, y: ship.y });
        if (trail.length > 14) trail.shift();
      } else if (trail.length) {
        trail.shift();
      }

      for (const def of TARGETS) {
        const pos = targetPos({ width, height }, def, t);
        drawGameGlyph(ctx!, def.id, pos.x, pos.y, t);
        ctx!.font = "11px ui-monospace, monospace";
        ctx!.textAlign = "center";
        ctx!.fillStyle = "rgba(124, 132, 150, 0.9)";
        ctx!.fillText(TARGET_NAMES[def.id], pos.x, pos.y + 32);
        if (pointer.active && Math.hypot(ship.x - pos.x, ship.y - pos.y) < HIT_RADIUS) {
          tryHit(ship.x, ship.y, HIT_RADIUS, now);
        }
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const age = (now - bursts[i].start) / 1000;
        if (age > BURST_SECONDS) {
          bursts.splice(i, 1);
          continue;
        }
        ctx!.strokeStyle = `rgba(61, 214, 255, ${(1 - age / BURST_SECONDS) * 0.8})`;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(bursts[i].x, bursts[i].y, 12 + age * 90, 0, Math.PI * 2);
        ctx!.stroke();
      }

      for (let i = 0; i < trail.length; i++) {
        const f = i / trail.length;
        ctx!.fillStyle = `rgba(61, 214, 255, ${f * 0.3})`;
        ctx!.beginPath();
        ctx!.arc(trail[i].x, trail[i].y, 1 + f * 2, 0, Math.PI * 2);
        ctx!.fill();
      }

      drawShip(ctx!, ship.x, ship.y, ship.angle, speed, now);
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
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function handleNavigate() {
    if (!activeHit) return;
    triggerHit(activeHit.id);
    activeHitRef.current = null;
    setActiveHit(null);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    activeHitRef.current = null;
    setActiveHit(null);
  }

  return (
    <div
      ref={containerRef}
      className="relative mt-8 aspect-square w-full touch-none overflow-hidden rounded-2xl border border-hairline bg-panel motion-reduce:hidden sm:aspect-[21/9]"
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-xs text-fg-muted">
        {hint}
      </p>
      {activeHit && (
        <div
          className="absolute z-20"
          style={
            isWide
              ? {
                  left: Math.min(
                    Math.max(activeHit.x, PANEL_WIDTH / 2 + 8),
                    activeHit.rectW - PANEL_WIDTH / 2 - 8,
                  ),
                  top: activeHit.y,
                  width: PANEL_WIDTH,
                  transform:
                    activeHit.y < activeHit.rectH / 2
                      ? "translate(-50%, 24px)"
                      : "translate(-50%, calc(-100% - 24px))",
                }
              : { left: 12, right: 12, bottom: 12 }
          }
        >
          <div
            ref={popupPanelRef}
            className="arena-popup-in relative rounded-lg border border-worker/50 bg-ink/95 p-4 shadow-[0_0_28px_rgba(61,214,255,0.25)]"
          >
            <span aria-hidden="true" className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-worker" />
            <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-worker" />
            <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-worker" />
            <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-worker" />

            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t("dismiss")}
              className="absolute right-2 top-2 font-mono text-xs text-fg-muted hover:text-fg"
            >
              ×
            </button>

            <div
              role="button"
              tabIndex={0}
              onClick={handleNavigate}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigate();
                }
              }}
              className="cursor-pointer pr-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-wide text-worker">
                {t("targetLocked")}
              </p>
              <p className="mt-1 font-display text-base font-semibold text-fg">
                {TARGET_NAMES[activeHit.id]}
              </p>
              <span className="mt-1 inline-block rounded-full border border-worker/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-worker">
                {t(`items.${activeHit.id}.status`)}
              </span>
              <p className="mt-2 text-xs text-fg-muted">
                {t(`items.${activeHit.id}.blurb`)}
              </p>
              <p className="mt-2 font-mono text-xs text-worker">{t("viewCard")} →</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
