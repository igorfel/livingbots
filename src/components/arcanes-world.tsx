import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalArrow, Section, SectionHeading } from "@/components/section";
import { arcanes, arcanesCharacters, arcanesLore } from "@/lib/content";

/** Story beats, each paired with the cinematic plate that illustrates it. */
const chapters = [
  { text: "p1", lore: "lunethiel" },
  { text: "p2", lore: "oak" },
  { text: "p3", lore: "gate" },
] as const;

export function ArcanesWorld() {
  const t = useTranslations("World");
  const tHero = useTranslations("Hero");
  const loreById = Object.fromEntries(arcanesLore.map((l) => [l.id, l.image]));
  const banner = arcanesLore.find((l) => l.id === "luffendor")!;

  return (
    <Section id="world" navSection="arcanes" className="relative isolate overflow-hidden bg-night">
      {/* Faded parchment plate behind the heading */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[34rem]">
        <Image
          src={banner.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.14] sepia"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/70 to-night" />
      </div>

      <SectionHeading label={t("label")} tone="arcane">
        {t("heading")}
      </SectionHeading>

      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {chapters.map((chapter, i) => (
          <li key={chapter.text} className="flex flex-col gap-5">
            <figure>
              <div className="overflow-hidden rounded-lg border border-parchment/15 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                <Image
                  src={loreById[chapter.lore]}
                  alt={t(`lore.${chapter.lore}`)}
                  placeholder="blur"
                  sizes="(min-width: 768px) 360px, 100vw"
                  className="aspect-[16/10] h-auto w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-wider text-parchment/50">
                {t(`lore.${chapter.lore}`)}
              </figcaption>
            </figure>
            <p className="text-pretty leading-relaxed text-parchment/85">
              <span
                aria-hidden="true"
                className="mr-2 font-pixel text-arcane"
              >
                {["I", "II", "III"][i]}.
              </span>
              {t(chapter.text)}
            </p>
          </li>
        ))}
      </ol>

      {/* Characters */}
      <h3 className="mt-24 font-pixel text-sm uppercase tracking-[0.2em] text-arcane">
        {t("charactersHeading")}
      </h3>
      <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {arcanesCharacters.map((c) => (
          <li
            key={c.id}
            className="arcane-frame flex flex-col rounded-xl bg-ink/50 p-5"
          >
            <div className="relative flex h-32 items-end justify-center sm:h-40">
              <div
                aria-hidden="true"
                className="absolute bottom-0 h-6 w-3/4 rounded-[50%] bg-arcane/15 blur-md"
              />
              <Image
                src={c.image}
                alt=""
                sizes="160px"
                className="pixelated relative h-full w-auto object-contain object-bottom"
              />
            </div>
            <p className="mt-4 font-pixel text-lg text-fg">
              {t(`characters.${c.id}.name`)}
            </p>
            <p className="mt-1 text-sm leading-snug text-fg-muted">
              {t(`characters.${c.id}.role`)}
            </p>
          </li>
        ))}
      </ul>

      {/* Closing CTA, framed by the key art */}
      <div className="relative isolate mt-24 overflow-hidden rounded-2xl arcane-frame">
        <Image
          src={arcanes.keyArt}
          alt=""
          fill
          placeholder="blur"
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="-z-10 object-cover object-left"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/20 md:bg-gradient-to-l md:from-ink md:via-ink/85 md:to-transparent"
        />
        <div className="flex min-h-[22rem] flex-col justify-end p-7 sm:p-10 md:ml-auto md:max-w-md md:justify-center">
          <h3 className="text-balance font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {t("ctaHeading")}
          </h3>
          <p className="mt-3 text-fg/80">{t("ctaCopy")}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={arcanes.playHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-arcane inline-flex items-center gap-2 rounded-md px-5 py-3 font-pixel text-base font-bold uppercase tracking-wide"
            >
              ▶ {tHero("ctaPlay")}
            </a>
            <a
              href={arcanes.discordHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-fg underline-offset-4 hover:text-arcane hover:underline"
            >
              {t("community")} <ExternalArrow />
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
