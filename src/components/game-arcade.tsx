"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalArrow } from "@/components/section";
import { GameGlyph } from "@/components/game-glyph";
import { GameStage } from "@/components/game-stage";
import { prefersReducedMotion } from "@/lib/bot-engine/config";
import { games, type Game } from "@/lib/content";
import {
  MORPH_EASING,
  boxOf,
  clampScroll,
  fly,
  headerOffset,
  nextFrame,
  type Box,
  type Flight,
} from "@/lib/morph";

type GameId = Game["id"];

/** The open game, and the card index the stage is inserted before (its row's first card). */
interface Active {
  id: GameId;
  at: number;
}

/** Measurements taken before a state change, consumed by the layout effect after it. */
type Pending =
  | { kind: "open"; from: Box; tops: Map<string, number>; scrollY: number }
  | { kind: "close"; id: GameId; from: Box | null; tops: Map<string, number>; scrollY: number };

const OPEN_MS = 640;
const CLOSE_MS = 520;

const cardsIn = (grid: HTMLElement | null) =>
  Array.from(grid?.querySelectorAll<HTMLElement>("[data-card]") ?? []);

const cardTops = (grid: HTMLElement | null) =>
  new Map(cardsIn(grid).map((el) => [el.dataset.card!, boxOf(el).top]));

/** FLIP every card from where it was drawn before the change to where layout put it. */
function slideCards(grid: HTMLElement | null, tops: Map<string, number>, duration: number) {
  for (const el of cardsIn(grid)) {
    const before = tops.get(el.dataset.card!);
    const dy = before === undefined ? 0 : before - boxOf(el).top;
    if (Math.abs(dy) < 0.5) continue;
    el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
      duration,
      easing: MORPH_EASING,
    });
  }
}

/**
 * Game cards plus the section-wide stage. Playing a card morphs its preview
 * into a full-width player that opens above the card's row (so on mobile it
 * lands right where the card was), the cards below slide down to make room,
 * and the page scrolls in step so the stage ends up in view. Closing reverses
 * it back into the card. Only the featured games show until the reader asks
 * for the rest.
 */
export function GameArcade() {
  const t = useTranslations("Games");
  const [active, setActive] = useState<Active | null>(null);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? games : games.filter((g) => g.featured);

  const gridRef = useRef<HTMLUListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const previews = useRef(new Map<GameId, HTMLDivElement>());
  const playButtons = useRef(new Map<GameId, HTMLButtonElement>());
  const pending = useRef<Pending | null>(null);
  const flight = useRef<Flight | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  /** Viewport top of the toggle when it was pressed; null when no toggle is pending. */
  const toggleAnchor = useRef<number | null>(null);

  function toggleExpanded() {
    toggleAnchor.current = toggleRef.current?.getBoundingClientRect().top ?? null;
    const activeHides = active && !games.find((g) => g.id === active.id)?.featured;
    if (expanded && activeHides) {
      flight.current?.cancel();
      setActive(null);
    }
    setExpanded(!expanded);
  }

  useLayoutEffect(() => {
    const anchor = toggleAnchor.current;
    if (anchor === null) return;
    toggleAnchor.current = null;

    if (!expanded) {
      // Keep the toggle where it was pressed rather than dropping the reader
      // further down the page once the extra rows are gone.
      const drift = (toggleRef.current?.getBoundingClientRect().top ?? anchor) - anchor;
      if (drift) window.scrollTo({ top: window.scrollY + drift, behavior: "instant" });
      return;
    }
    if (prefersReducedMotion()) return;
    gridRef.current?.querySelectorAll<HTMLElement>("[data-extra]").forEach((el, i) => {
      el.animate(
        [
          { opacity: 0, transform: "translateY(24px) scale(0.98)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 480, delay: i * 70, easing: MORPH_EASING, fill: "backwards" },
      );
    });
  }, [expanded]);

  function open(id: GameId) {
    const preview = previews.current.get(id);
    if (!preview) return;
    if (active?.id === id) {
      stageRef.current?.scrollIntoView({
        behavior: prefersReducedMotion() ? "instant" : "smooth",
        block: "start",
      });
      return;
    }
    // The stage goes before the first card of the clicked card's row.
    const list = cardsIn(gridRef.current);
    const index = list.findIndex((el) => el.dataset.card === id);
    const rowTop = list[index].offsetTop;
    let at = index;
    while (at > 0 && list[at - 1].offsetTop === rowTop) at--;

    flight.current?.cancel();
    pending.current = {
      kind: "open",
      from: boxOf(preview),
      tops: cardTops(gridRef.current),
      scrollY: window.scrollY,
    };
    setActive({ id, at });
  }

  const close = useCallback(async () => {
    if (!active) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      await nextFrame();
    }
    flight.current?.cancel();
    pending.current = {
      kind: "close",
      id: active.id,
      from: frameRef.current ? boxOf(frameRef.current) : null,
      tops: cardTops(gridRef.current),
      scrollY: window.scrollY,
    };
    setActive(null);
  }, [active]);

  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;

    // Undo any scroll-anchoring jump so "before" and "after" share a viewport.
    window.scrollTo({ top: p.scrollY, behavior: "instant" });
    for (const el of cardsIn(gridRef.current)) el.getAnimations().forEach((a) => a.cancel());
    const reduced = prefersReducedMotion();

    if (p.kind === "open") {
      const stage = stageRef.current;
      const frame = frameRef.current;
      if (!stage || !frame) return;
      const iframe = () => frame.querySelector("iframe")?.focus({ preventScroll: true });

      const stageBox = boxOf(stage);
      const fits = stageBox.top >= headerOffset() && stageBox.top + stageBox.height <= window.innerHeight;
      const scrollTo = fits ? p.scrollY : clampScroll(p.scrollY + stageBox.top - headerOffset());

      if (reduced) {
        window.scrollTo({ top: scrollTo, behavior: "instant" });
        iframe();
        return;
      }

      const frameBox = boxOf(frame);
      stage.style.opacity = "0";
      slideCards(gridRef.current, p.tops, OPEN_MS);
      flight.current = fly({
        from: p.from,
        to: { ...frameBox, top: frameBox.top - (scrollTo - p.scrollY) },
        scrollFrom: p.scrollY,
        scrollTo,
        duration: OPEN_MS,
        onLand: () => {
          flight.current = null;
          stage.style.opacity = "";
          stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: "ease-out" });
          stage.querySelector("[data-stage-bar]")?.animate(
            [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 360, delay: 80, easing: MORPH_EASING, fill: "backwards" },
          );
          iframe();
        },
      });
      return;
    }

    const preview = previews.current.get(p.id);
    const button = () => playButtons.current.get(p.id)?.focus({ preventScroll: true });
    if (!preview) return;

    const target = boxOf(preview);
    const visible = target.top >= headerOffset() && target.top + target.height <= window.innerHeight;
    const scrollTo = visible
      ? p.scrollY
      : clampScroll(p.scrollY + target.top - (window.innerHeight - target.height) / 2);

    if (reduced || !p.from) {
      window.scrollTo({ top: scrollTo, behavior: "instant" });
      button();
      return;
    }

    slideCards(gridRef.current, p.tops, CLOSE_MS);
    flight.current = fly({
      from: p.from,
      to: { ...target, top: target.top - (scrollTo - p.scrollY) },
      scrollFrom: p.scrollY,
      scrollTo,
      duration: CLOSE_MS,
      onLand: () => {
        flight.current = null;
        button();
      },
    });
  }, [active]);

  useEffect(() => () => flight.current?.cancel(), []);

  const activeGame = active ? games.find((g) => g.id === active.id) : undefined;

  return (
    <>
      <ul
        ref={gridRef}
        id="games-grid"
        className="mt-12 grid gap-4 [overflow-anchor:none] sm:grid-cols-2 lg:grid-cols-4"
      >
        {visible.map((game, index) => {
          const isActive = active?.id === game.id;
          return (
            <Fragment key={game.id}>
              {activeGame && active?.at === index ? (
                <li className="col-span-full py-2 sm:py-4">
                  <GameStage
                    key={activeGame.id}
                    game={activeGame}
                    status={t(`items.${activeGame.id}.status`)}
                    stageRef={stageRef}
                    frameRef={frameRef}
                    onClose={close}
                  />
                </li>
              ) : null}
              <li
                data-card={game.id}
                data-extra={game.featured ? undefined : ""}
                className={`flex flex-col gap-3 rounded-2xl border bg-panel p-4 transition-colors ${
                  isActive ? "border-worker/60" : "border-hairline hover:border-worker/40"
                }`}
              >
                <div
                  ref={(el) => {
                    if (el) previews.current.set(game.id, el);
                    else previews.current.delete(game.id);
                  }}
                  className="relative aspect-4/3 overflow-hidden rounded-xl bg-ink/60"
                >
                  <GameGlyph gameId={game.id} />
                  <button
                    ref={(el) => {
                      if (el) playButtons.current.set(game.id, el);
                      else playButtons.current.delete(game.id);
                    }}
                    type="button"
                    onClick={() => open(game.id)}
                    aria-label={`${isActive ? t("nowPlaying") : t("playHere")}: ${game.name}`}
                    className="group absolute inset-0 flex items-end justify-start p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-worker"
                  >
                    <span
                      className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                        isActive
                          ? "border-worker bg-worker/15 text-worker"
                          : "border-worker/40 bg-ink/80 text-worker group-hover:border-worker group-hover:bg-ink"
                      }`}
                    >
                      {isActive ? `● ${t("nowPlaying")}` : `▶ ${t("playHere")}`}
                    </span>
                  </button>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="rounded-full border border-worker/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-worker">
                    {t(`items.${game.id}.status`)}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-fg">{game.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-fg-muted">
                  {t(`items.${game.id}.blurb`)}
                </p>
                <ul className="flex flex-wrap gap-2 font-mono text-xs text-fg-muted">
                  {game.stack.map((tag) => (
                    <li key={tag} className="rounded border border-hairline px-2 py-1">
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-5 pt-1 text-sm">
                  <a
                    href={game.playHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-worker underline-offset-4 hover:underline"
                  >
                    {t("playLabel")} <ExternalArrow />
                  </a>
                  {"itchHref" in game && game.itchHref ? (
                    <a
                      href={game.itchHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                    >
                      {t("itchLabel")} <ExternalArrow />
                    </a>
                  ) : null}
                </div>
              </li>
            </Fragment>
          );
        })}
      </ul>
      {games.length > visible.length || expanded ? (
        <div className="mt-8 flex justify-center">
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={expanded}
            aria-controls="games-grid"
            onClick={toggleExpanded}
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 font-mono text-xs text-fg-muted transition-colors hover:border-worker/60 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-worker"
          >
            {expanded ? t("showFewer") : t("showAll", { count: games.length })}
            <svg
              viewBox="0 0 16 16"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
