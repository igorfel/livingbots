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
    <div className="relative flex min-h-[85svh] flex-col">
      <HeroSwarm onSettle={() => setRevealed(true)} />
      <h1 className="sr-only">{eyebrow}</h1>
      <div
        className={`pointer-events-none relative z-10 mt-auto flex flex-col items-center gap-6 px-6 pb-16 pt-8 text-center transition-opacity duration-700 sm:pb-24 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="max-w-4xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
          {tagline}
        </p>
        <p className="max-w-2xl text-balance text-fg-muted">{sub}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#games"
            className="pointer-events-auto rounded-full bg-worker px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
          >
            {ctaGames}
          </a>
          <a
            href="#consulting"
            className="pointer-events-auto rounded-full border border-hairline px-6 py-3 font-medium text-fg transition-colors hover:border-foreman hover:text-foreman"
          >
            {ctaConsulting}
          </a>
        </div>
      </div>
    </div>
  );
}
