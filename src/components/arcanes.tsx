import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/section";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import {
  arcanes,
  arcanesExtras,
  arcanesFacts,
  arcanesGallery,
  arcanesPillars,
} from "@/lib/content";

export function Arcanes() {
  const t = useTranslations("Arcanes");

  return (
    <Section
      id="arcanes"
      navSection="arcanes"
      className="relative overflow-hidden bg-gradient-to-b from-ink via-night to-night"
    >
      {/* Overview: pitch + fact sheet */}
      <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <div>
          <SectionHeading label={t("label")} tone="arcane">
            {t("heading")}
          </SectionHeading>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-fg">
            {t("lead")}
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-fg-muted">
            {t("body")}
          </p>
        </div>

        <aside className="arcane-frame self-start rounded-xl bg-ink/60 p-6 sm:p-7">
          <div className="flex items-center gap-4 border-b border-arcane/15 pb-5">
            <Image
              src={arcanes.icon}
              alt=""
              width={56}
              height={56}
              className="rounded-lg"
            />
            <h3 className="font-pixel text-lg uppercase tracking-[0.15em] text-arcane">
              {t("factsHeading")}
            </h3>
          </div>
          <dl className="mt-5 grid gap-4">
            {arcanesFacts.map((fact) => (
              <div key={fact} className="grid grid-cols-[7rem_1fr] gap-3 text-sm">
                <dt className="font-mono text-xs uppercase tracking-wider text-fg-muted">
                  {t(`facts.${fact}.label`)}
                </dt>
                <dd className="text-fg">{t(`facts.${fact}.value`)}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* Pillars: each claim paired with the screenshot that shows it */}
      <ol className="mt-24 flex flex-col gap-20 sm:gap-28">
        {arcanesPillars.map((pillar, i) => (
          <li
            key={pillar.id}
            className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
          >
            <div
              className={`overflow-hidden rounded-xl arcane-frame lg:col-span-7 ${
                i % 2 === 1 ? "lg:order-last" : ""
              }`}
            >
              <Image
                src={pillar.image}
                alt=""
                placeholder="blur"
                sizes="(min-width: 1024px) 640px, 100vw"
                className="h-auto w-full"
              />
            </div>
            <div className="lg:col-span-5">
              <p className="flex items-center gap-3 font-pixel text-sm uppercase tracking-[0.2em] text-arcane">
                <span className="font-mono text-xs text-arcane/60">
                  0{i + 1}
                </span>
                {t(`pillars.${pillar.id}.kicker`)}
              </p>
              <h3 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-fg">
                {t(`pillars.${pillar.id}.title`)}
              </h3>
              <p className="mt-4 text-pretty leading-relaxed text-fg-muted">
                {t(`pillars.${pillar.id}.desc`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* Everything else in the demo */}
      <div className="mt-28">
        <h3 className="font-pixel text-sm uppercase tracking-[0.2em] text-arcane">
          {t("extrasHeading")}
        </h3>
        <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {arcanesExtras.map((extra) => (
            <li
              key={extra}
              className="flex gap-3 border-t border-arcane/10 pt-4 text-sm leading-relaxed text-fg/85"
            >
              <span aria-hidden="true" className="mt-0.5 text-xs text-arcane">
                ◆
              </span>
              {t(`extras.${extra}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* Gallery */}
      <div className="mt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-display text-3xl font-semibold tracking-tight text-fg">
            {t("galleryHeading")}
          </h3>
          <p className="text-sm text-fg-muted">{t("galleryHint")}</p>
        </div>
        <ScreenshotGallery
          items={arcanesGallery.map((g) => ({
            id: g.id,
            image: g.image,
            caption: t(`gallery.${g.id}`),
          }))}
          labels={{
            open: t.raw("openImage") as string,
            close: t("close"),
            previous: t("previous"),
            next: t("next"),
            count: t.raw("imageCount") as string,
          }}
        />
      </div>
    </Section>
  );
}
