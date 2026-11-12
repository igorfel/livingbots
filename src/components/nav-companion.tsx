"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * The little bot that perches above the active nav item. Sections declare which
 * item they belong to with `data-nav-section`; the bot follows whichever one
 * crosses the middle of the viewport.
 */
export function NavCompanion() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    navRef.current = document.querySelector("nav[aria-label='Main']");
    const sections = document.querySelectorAll<HTMLElement>("[data-nav-section]");
    setActive(sections[0]?.dataset.navSection ?? null);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.navSection;
          if (entry.isIntersecting && id) setActive(id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    function reposition() {
      const nav = navRef.current;
      const target = active
        ? document.querySelector<HTMLElement>(`[data-nav-item="${active}"]`)
        : null;
      if (!nav || !target) {
        setPos(null);
        return;
      }
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
