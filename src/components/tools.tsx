import { useLocale, useTranslations } from "next-intl";
import { ExternalArrow, Section, SectionHeading } from "@/components/section";
import { freespace } from "@/lib/content";

export function Tools() {
  const t = useTranslations("Tools");
  const locale = useLocale();
  const href = locale === "pt" ? freespace.href.pt : freespace.href.en;

  return (
    <Section id="tools" navSection="tools" className="border-t border-hairline">
      <SectionHeading label={t("label")}>{t("heading")}</SectionHeading>
      <p className="mt-4 max-w-2xl text-pretty text-fg-muted">{t("intro")}</p>

      <article className="mt-12 grid gap-10 rounded-2xl border border-hairline bg-panel p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-3xl font-semibold tracking-tight text-fg">
              FreeSpace
            </h3>
            <span className="rounded-full border border-worker/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-worker">
              {t("freespace.platform")}
            </span>
          </div>
          <p className="mt-4 text-balance font-display text-xl text-fg">
            {t("freespace.tagline")}
          </p>
          <p className="mt-4 text-pretty text-fg-muted">{t("freespace.blurb")}</p>
          <p className="mt-4 text-sm text-fg-muted">{t("freespace.local")}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-worker px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
          >
            {t("freespace.cta")} <ExternalArrow />
          </a>
        </div>

        <ul
          aria-label={t("freespace.scansLabel")}
          className="divide-y divide-hairline rounded-xl border border-hairline bg-ink font-mono text-xs"
        >
          {freespace.scans.map((env) => (
            <li
              key={env.name}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="w-16 shrink-0 uppercase tracking-[0.2em] text-worker">
                {env.name}
              </span>
              <ul className="flex flex-wrap gap-2 text-fg-muted">
                {env.targets.map((target) => (
                  <li key={target} className="rounded border border-hairline px-2 py-1">
                    {target}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </article>
    </Section>
  );
}
