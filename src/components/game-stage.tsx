"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { GameGlyph } from "@/components/game-glyph";
import type { Game } from "@/lib/content";

/** "native" = Fullscreen API; "pseudo" = fixed overlay for browsers without it (iPhone). */
type FullMode = "native" | "pseudo" | null;

interface GameStageProps {
  game: Game;
  status: string;
  stageRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

const buttonClass =
  "inline-flex items-center gap-2 rounded-full border border-hairline bg-ink/60 px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors hover:border-worker/60 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-worker";

/**
 * Section-wide player: toolbar plus a live iframe of the deployed game, with
 * the game's glyph as the loading backdrop. Positioning and the open/close
 * morph are owned by GameArcade.
 */
export function GameStage({ game, status, stageRef, frameRef, onClose }: GameStageProps) {
  const t = useTranslations("Games");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [full, setFull] = useState<FullMode>(null);
  // Browsers swallow the Esc that leaves native fullscreen in different ways;
  // ignore an Esc right after leaving so it doesn't also close the stage.
  const lastExit = useRef(0);
  const titleId = `stage-title-${game.id}`;

  useEffect(() => {
    const onChange = () => {
      if (document.fullscreenElement && document.fullscreenElement === stageRef.current) {
        setFull("native");
      } else {
        lastExit.current = performance.now();
        setFull((f) => (f === "native" ? null : f));
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [stageRef]);

  useEffect(() => {
    if (full !== "pseudo") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [full]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || full === "native") return;
      if (performance.now() - lastExit.current < 400) return;
      if (full === "pseudo") setFull(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [full, onClose]);

  async function toggleFullscreen() {
    const stage = stageRef.current;
    if (!stage) return;
    if (full === "native") {
      await document.exitFullscreen().catch(() => {});
    } else if (full === "pseudo") {
      setFull(null);
    } else if (document.fullscreenEnabled && stage.requestFullscreen) {
      try {
        await stage.requestFullscreen({ navigationUI: "hide" });
      } catch {
        setFull("pseudo");
      }
    } else {
      setFull("pseudo");
    }
    // Hand keyboard focus back to the game.
    iframeRef.current?.focus({ preventScroll: true });
  }

  return (
    <div
      ref={stageRef}
      role="region"
      aria-labelledby={titleId}
      data-full={full ?? undefined}
      className="game-stage scroll-mt-28"
    >
      <div data-stage-bar className="flex items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="relative flex size-2 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-worker/60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-worker" />
          </span>
          <h3
            id={titleId}
            className="truncate font-display text-lg font-semibold text-fg sm:text-xl"
          >
            {game.name}
          </h3>
          <span className="hidden shrink-0 rounded-full border border-worker/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-worker md:inline">
            {status}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={toggleFullscreen} className={buttonClass}>
            {full ? <ShrinkIcon /> : <ExpandIcon />}
            <span className="sr-only sm:not-sr-only">
              {full ? t("exitFullscreen") : t("fullscreen")}
            </span>
          </button>
          {full ? null : (
            <a
              href={game.playHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              <ExternalIcon />
              <span className="sr-only lg:not-sr-only">{t("openNewTab")}</span>
            </a>
          )}
          <button type="button" onClick={onClose} className={buttonClass}>
            <CloseIcon />
            <span className="sr-only sm:not-sr-only">{t("close")}</span>
          </button>
        </div>
      </div>

      <div
        ref={frameRef}
        className="game-stage-frame relative aspect-3/4 max-h-[calc(100svh-10rem)] w-full overflow-hidden rounded-2xl border border-worker/30 bg-ink shadow-[0_30px_80px_-30px_rgb(61_214_255/0.35)] sm:aspect-video"
      >
        <div aria-hidden="true" className="absolute inset-0">
          <GameGlyph gameId={game.id} scale={4} active={!loaded} />
        </div>
        {loaded ? null : (
          <p
            role="status"
            className="absolute inset-x-0 bottom-6 text-center font-mono text-xs text-fg-muted"
          >
            {t("loading", { name: game.name })}
          </p>
        )}
        <iframe
          ref={iframeRef}
          src={game.playHref}
          title={game.name}
          allow="fullscreen; gamepad; autoplay"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ExpandIcon() {
  return (
    <Icon>
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
    </Icon>
  );
}

function ShrinkIcon() {
  return (
    <Icon>
      <path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4" />
    </Icon>
  );
}

function ExternalIcon() {
  return (
    <Icon>
      <path d="M9 2h5v5M14 2 7.5 8.5M12 9.5V14H2V4h4.5" />
    </Icon>
  );
}

function CloseIcon() {
  return (
    <Icon>
      <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
    </Icon>
  );
}
