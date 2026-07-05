"use client";

import { useEffect, useRef, useState } from "react";

const SECTION_IDS = ["hero", "games", "web", "consulting", "factory", "contact"] as const;

export function NavCompanion() {
  const navRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<string>("hero");
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    navRef.current = document.querySelector("nav[aria-label='Main']");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const id of SECTION_IDS) {
      if (id === "hero") continue;
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }

    return () => io.disconnect();
  }, []);

  useEffect(() => {
    function reposition() {
      const nav = navRef.current;
      const target = document.querySelector<HTMLElement>(`[data-nav-item="${active}"]`);
      if (!nav || !target) return;
      const navRect = nav.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setPos({
        x: targetRect.left - navRect.left + targetRect.width / 2,
        y: targetRect.top - navRect.top,
      });
    }

    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [active]);

  if (!pos) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-10 h-2 w-2 rounded-sm bg-worker transition-transform duration-500 ease-out"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -170%)`,
        animation: "nav-companion-blink 2.4s ease-in-out infinite",
        boxShadow: "0 0 10px 2px rgba(61, 214, 255, 0.65)",
      }}
    />
  );
}
