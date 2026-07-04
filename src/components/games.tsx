import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { AssembleReveal } from "@/components/assemble-reveal";
import { GamesArena } from "@/components/games-arena";
import { games, publishedGames } from "@/lib/content";

export function Games() {
  const t = useTranslations("Games");

  return (
    <Section id="games">
      <h2 className="font-display text-3xl font-semibold text-fg sm:text-4xl">
        {t("heading")}
      </h2>
      <p className="mt-3 max-w-2xl text-fg-muted">{t("intro")}</p>

      <GamesArena />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {games.map((game) => (
          <li
            key={game.id}
            id={`game-${game.id}`}
            className="scroll-mt-24 flex flex-col gap-4 rounded-2xl border border-hairline bg-panel p-6 transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-fg">
                {game.name}
              </h3>
              <span className="shrink-0 rounded-full border border-worker/40 px-2 py-1 font-mono text-xs uppercase tracking-wide text-worker">
                {t(`items.${game.id}.status`)}
              </span>
            </div>
            <p className="text-sm text-fg-muted">
              {t(`items.${game.id}.blurb`)}
            </p>
            <ul className="flex flex-wrap gap-2 font-mono text-xs text-fg-muted">
              {game.stack.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-hairline px-2 py-1"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-4 pt-2 text-sm">
              <a
                href={game.playHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-worker underline-offset-4 hover:underline"
              >
                {t("playLabel")} →
              </a>
              {"itchHref" in game && game.itchHref ? (
                <a
                  href={game.itchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                >
                  {t("itchLabel")} →
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-16 font-display text-xl font-semibold text-fg">
        {t("publishedHeading")}
      </h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {publishedGames.map((entry) => (
          <li key={entry.id} className="h-full">
            <AssembleReveal className="h-full">
              <a
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full rounded-xl border border-hairline bg-panel p-5 transition-colors hover:border-worker"
              >
                <p className="font-display font-semibold text-fg">
                  {entry.name}
                </p>
                <p className="mt-2 text-sm text-fg-muted">
                  {t(`published.${entry.id}.blurb`)}
                </p>
              </a>
            </AssembleReveal>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-fg-muted">{t("closingLine")}</p>
    </Section>
  );
}
