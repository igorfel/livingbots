"use client";

import { useEffect, useState } from "react";
import { HeroSwarm } from "@/components/hero-swarm";
import { prefersReducedMotion } from "@/lib/bot-engine/config";

interface HeroSceneProps {
  eyebrow: string;
  tagline: string;
  sub: string;
  ctaGames: string;
  ctaConsulting: string;
}

export function HeroScene({
  eyebrow,
  tagline,
  sub,
  ctaGames,
  ctaConsulting,
}: HeroSceneProps) {
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setRevealed(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative aspect-[21/9] w-full max-w-3xl">
        <h1 className="sr-only">{eyebrow}</h1>
        <HeroSwarm onSettle={() => setRevealed(true)} />
      </div>
      <div
        className={`flex flex-col items-center gap-6 transition-opacity duration-700 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-display text-xl text-worker sm:text-2xl">{tagline}</p>
        <p className="max-w-2xl text-balance text-fg-muted">{sub}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#games"
            className="rounded-full bg-worker px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
          >
            {ctaGames}
          </a>
          <a
            href="#consulting"
            className="rounded-full border border-hairline px-6 py-3 font-medium text-fg transition-colors hover:border-foreman hover:text-foreman"
          >
            {ctaConsulting}
          </a>
        </div>
      </div>
    </div>
  );
}
