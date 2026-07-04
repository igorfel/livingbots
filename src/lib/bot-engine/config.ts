export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Hero caps at ~400 bots on desktop, ~250 on mobile per spec. */
export function particleCap(desktop: number, mobile: number, breakpoint = 640): number {
  if (typeof window === "undefined") return mobile;
  return window.innerWidth < breakpoint ? mobile : desktop;
}

/** Fires `callback` once when `el` first enters the viewport, then stops observing. */
export function onEnterOnce(el: Element, callback: () => void, threshold = 0.2): () => void {
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      callback();
      io.disconnect();
    }
  }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}
