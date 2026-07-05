"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/bot-engine/config";
import { drawGameGlyph, type GameId } from "@/lib/game-glyphs";

interface GamePreviewProps {
  gameId: GameId;
  playHref: string;
  name: string;
  loadLabel: string;
}

const GLYPH_SCALE = 3;

/**
 * Card visual for a game: an animated vignette of the game's arena glyph,
 * with a button that swaps in a live iframe of the actual deployed game.
 */
export function GamePreview({ gameId, playHref, name, loadLabel }: GamePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (live) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    function draw(t: number) {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = rect.width / 2;
      const cy = rect.height / 2 + Math.sin(t * 0.8) * 4;

      const halo = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rect.height * 0.55);
      halo.addColorStop(0, "rgba(61, 214, 255, 0.12)");
      halo.addColorStop(1, "rgba(61, 214, 255, 0)");
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.scale(GLYPH_SCALE, GLYPH_SCALE);
      drawGameGlyph(ctx!, gameId, 0, 0, t);
      ctx!.restore();
    }

    if (prefersReducedMotion()) {
      draw(0);
      return;
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
    io.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [live, gameId]);

  return (
    <div
      ref={containerRef}
      className="relative -mx-2 -mt-2 aspect-video overflow-hidden rounded-xl bg-ink/60"
    >
      {live ? (
        <iframe
          src={playHref}
          title={name}
          allow="fullscreen; gamepad; autoplay"
          loading="lazy"
          className="h-full w-full border-0"
        />
      ) : (
        <>
          <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setLive(true)}
            className="group absolute inset-0 flex items-end justify-start p-3"
          >
            <span className="rounded-full border border-worker/40 bg-ink/80 px-3 py-1.5 font-mono text-xs text-worker transition-colors group-hover:border-worker group-hover:bg-ink">
              ▶ {loadLabel}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
