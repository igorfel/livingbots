import { useTranslations } from "next-intl";
import { ExternalArrow, Section, SectionHeading } from "@/components/section";
import { GamePreview } from "@/components/game-preview";
import { games } from "@/lib/content";

export function Games() {
  const t = useTranslations("Games");

  return (
    <Section id="games" navSection="games" className="border-t border-hairline">
      <SectionHeading label={t("label")}>{t("heading")}</SectionHeading>
      <p className="mt-4 max-w-2xl text-pretty text-fg-muted">{t("intro")}</p>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <li
            key={game.id}
            className="flex flex-col gap-3 rounded-2xl border border-hairline bg-panel p-4 transition-colors hover:border-worker/40"
          >
            <GamePreview
              gameId={game.id}
              playHref={game.playHref}
              name={game.name}
              loadLabel={t("loadPreview")}
            />
            <div className="flex flex-col items-start gap-2">
              <span className="rounded-full border border-worker/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-worker">
                {t(`items.${game.id}.status`)}
              </span>
              <h3 className="font-display text-lg font-semibold text-fg">
                {game.name}
              </h3>
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
        ))}
      </ul>

      <p className="mt-10 text-sm text-fg-muted">{t("closingLine")}</p>
    </Section>
  );
}
