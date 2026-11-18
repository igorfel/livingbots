"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/bot-engine/config";
import { drawGameGlyph, type GameId } from "@/lib/game-glyphs";

interface GameGlyphProps {
  gameId: GameId;
  /** Glyph size multiplier; the glyphs are drawn at roughly 16px. */
  scale?: number;
  /** When false the vignette holds its current frame and stops animating. */
  active?: boolean;
}

/**
 * Animated vignette of a game's arena glyph on a soft cyan halo. Fills its
 * parent; used on the game cards and as the loading backdrop of the stage.
 */
export function GameGlyph({ gameId, scale = 2.4, active = true }: GameGlyphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    function draw(t: number) {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (rect.width !== width || rect.height !== height) {
        width = rect.width;
        height = rect.height;
        canvas!.width = Math.round(width * dpr);
        canvas!.height = Math.round(height * dpr);
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + Math.sin(t * 0.8) * 4;

      const halo = ctx!.createRadialGradient(cx, cy, 0, cx, cy, height * 0.55);
      halo.addColorStop(0, "rgba(61, 214, 255, 0.12)");
      halo.addColorStop(1, "rgba(61, 214, 255, 0)");
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, width, height);

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.scale(scale, scale);
      drawGameGlyph(ctx!, gameId, 0, 0, t);
      ctx!.restore();
    }

    if (!active || prefersReducedMotion()) {
      draw(0);
      const ro = new ResizeObserver(() => draw(0));
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let visible = true;
    let rafId = 0;
    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (visible) draw(now / 1000);
    };
    rafId = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [gameId, scale, active]);

  return <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />;
}
