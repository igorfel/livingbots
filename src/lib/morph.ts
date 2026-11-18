/** A rectangle in viewport coordinates. */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Flight {
  /** Stops the flight and removes the stand-in without calling `onLand`. */
  cancel(): void;
}

/** easeOutQuint — paired with MORPH_EASING for the CSS side of the morph. */
const easeOut = (p: number) => 1 - Math.pow(1 - p, 5);
export const MORPH_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const lerp = (a: number, b: number, e: number) => a + (b - a) * e;

export function boxOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/** Bottom edge of the sticky nav, plus breathing room. */
export function headerOffset(): number {
  return (document.querySelector("header")?.getBoundingClientRect().bottom ?? 64) + 16;
}

export function clampScroll(y: number): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(y, max));
}

export function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * Flies a fixed-position stand-in panel from one viewport box to another while
 * scrolling the window in lockstep, so it lands exactly where the real element
 * ends up. `to` is where the target will sit once the scroll reaches
 * `scrollTo`. Driving the scroll every frame also overrides any scroll-anchoring
 * jump the layout change may have triggered.
 */
export function fly({
  from,
  to,
  scrollFrom,
  scrollTo,
  duration,
  onLand,
}: {
  from: Box;
  to: Box;
  scrollFrom: number;
  scrollTo: number;
  duration: number;
  onLand?: () => void;
}): Flight {
  const ghost = document.createElement("div");
  ghost.className = "morph-ghost";
  ghost.setAttribute("aria-hidden", "true");

  const place = (e: number) => {
    ghost.style.left = `${lerp(from.left, to.left, e)}px`;
    ghost.style.top = `${lerp(from.top, to.top, e)}px`;
    ghost.style.width = `${lerp(from.width, to.width, e)}px`;
    ghost.style.height = `${lerp(from.height, to.height, e)}px`;
  };
  place(0);
  document.body.appendChild(ghost);

  let rafId = 0;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const e = easeOut(p);
    place(e);
    window.scrollTo({ top: lerp(scrollFrom, scrollTo, e), behavior: "instant" });
    if (p < 1) {
      rafId = requestAnimationFrame(step);
      return;
    }
    onLand?.();
    const fade = ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 220,
      easing: "ease-out",
    });
    fade.finished.then(
      () => ghost.remove(),
      () => ghost.remove(),
    );
  };
  rafId = requestAnimationFrame(step);

  return {
    cancel() {
      cancelAnimationFrame(rafId);
      ghost.remove();
    },
  };
}
