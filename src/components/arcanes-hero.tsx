import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalArrow } from "@/components/section";
import { arcanes } from "@/lib/content";

/** Fixed positions so the server render is deterministic (no hydration drift). */
const FIREFLIES = [
  { left: "8%", top: "62%", fx: "26px", fy: "-70px", dur: "11s", delay: "0s" },
  { left: "18%", top: "38%", fx: "-18px", fy: "-50px", dur: "9s", delay: "2.5s" },
  { left: "31%", top: "74%", fx: "34px", fy: "-90px", dur: "13s", delay: "1s" },
  { left: "44%", top: "52%", fx: "-24px", fy: "-60px", dur: "10s", delay: "4s" },
  { left: "57%", top: "80%", fx: "16px", fy: "-80px", dur: "12s", delay: "0.5s" },
  { left: "66%", top: "30%", fx: "-30px", fy: "-40px", dur: "8.5s", delay: "3s" },
  { left: "76%", top: "66%", fx: "22px", fy: "-70px", dur: "11.5s", delay: "5s" },
  { left: "88%", top: "44%", fx: "-16px", fy: "-55px", dur: "9.5s", delay: "1.8s" },
  { left: "94%", top: "78%", fx: "-26px", fy: "-85px", dur: "14s", delay: "6s" },
];

const platforms = ["browser", "windows", "gamepad"] as const;

export function ArcanesHero() {
  const t = useTranslations("Hero");

  return (
    <section
      id="top"
      data-nav-section="arcanes"
      className="relative isolate flex min-h-[calc(100svh-7rem)] items-end overflow-hidden sm:min-h-[calc(100svh-4.5rem)]"
    >
      <Image
        src={arcanes.heroArt}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="hero-art -z-20 object-cover"
      />
      {/* Readability: darken the left on wide screens, the bottom everywhere. */}
      <div
        aria-hidden="true"
        className="hero-scrim absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="firefly"
            style={
              {
                left: f.left,
                top: f.top,
                "--fx": f.fx,
                "--fy": f.fy,
                "--dur": f.dur,
                "--delay": f.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:pb-24">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-pixel text-sm uppercase tracking-[0.2em] text-parchment/80">
              {t("presents")}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-arcane/40 bg-ink/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-arcane backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arcane" />
              {t("eyebrow")}
            </span>
          </div>

          <h1 className="mt-5">
            <Image
              src={arcanes.title}
              alt={t("titleAlt")}
              priority
              sizes="(min-width: 640px) 480px, 80vw"
              className="h-auto w-[78vw] max-w-[480px] drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]"
            />
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-fg/90 sm:text-xl">
            {t("tagline")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={arcanes.playHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-arcane inline-flex items-center gap-2 rounded-md px-6 py-3.5 font-pixel text-lg font-bold uppercase tracking-wide"
            >
              ▶ {t("ctaPlay")}
            </a>
            <a
              href={arcanes.itchHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-fg/25 bg-ink/50 px-5 py-3.5 font-medium text-fg backdrop-blur transition-colors hover:border-arcane hover:text-arcane"
            >
              {t("ctaItch")} <ExternalArrow />
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-fg-muted">
            {platforms.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-arcane">
                  ◆
                </span>
                {t(`platforms.${p}`)}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="text-arcane">
                ◆
              </span>
              {t("free")}
            </li>
          </ul>
        </div>
      </div>

      <a
        href="#arcanes"
        className="absolute bottom-6 right-6 hidden items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-arcane sm:flex"
      >
        {t("ctaMore")} <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
