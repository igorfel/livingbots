import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalArrow, Section, SectionHeading } from "@/components/section";
import { arcanes, itchGames, itchProfileHref } from "@/lib/content";

export function ItchBand() {
  const t = useTranslations("Itch");

  return (
    <Section id="itch" navSection="itch" className="border-t border-hairline">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <a
          href={arcanes.itchHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border border-hairline"
          aria-label="Arcanes on itch.io"
        >
          <Image
            src={arcanes.itchCover}
            alt=""
            placeholder="blur"
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </a>

        <div>
          <SectionHeading label={t("label")}>{t("heading")}</SectionHeading>
          <p className="mt-4 text-pretty text-fg-muted">{t("copy")}</p>

          <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
            {itchGames.map((game) => (
              <li key={game.id}>
                <a
                  href={game.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="block font-display font-semibold text-fg transition-colors group-hover:text-foreman">
                      {game.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-fg-muted">
                      {t(`items.${game.id}`)}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-foreman"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <a
            href={itchProfileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreman px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
          >
            {t("cta")} <ExternalArrow />
          </a>
        </div>
      </div>
    </Section>
  );
}
