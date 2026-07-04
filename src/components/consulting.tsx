import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { SixthSense } from "@/components/sixth-sense";

const stages = ["see", "sense", "fix", "strengthen"] as const;
const offers = ["audit", "accompaniment", "partnership"] as const;

export function Consulting() {
  const t = useTranslations("Consulting");

  return (
    <Section id="consulting">
      <h2 className="font-display text-3xl font-semibold text-fg sm:text-4xl">
        {t("heading")}
      </h2>
      <p className="mt-3 max-w-2xl text-fg-muted">{t("intro")}</p>

      <SixthSense />

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <li
            key={stage}
            id={`stage-${stage}`}
            className="rounded-2xl border border-hairline bg-panel p-6 transition-colors"
          >
            <span className="font-mono text-xs text-foreman">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-lg font-semibold text-fg">
              {t(`stages.${stage}.label`)}
            </h3>
            <p className="mt-2 text-sm text-fg-muted">
              {t(`stages.${stage}.desc`)}
            </p>
          </li>
        ))}
      </ol>

      <h3 className="mt-16 font-display text-xl font-semibold text-fg">
        {t("offersHeading")}
      </h3>
      <ul className="mt-6 flex flex-wrap gap-3">
        {offers.map((offer) => (
          <li
            key={offer}
            className="rounded-full border border-hairline px-4 py-2 text-sm text-fg"
          >
            {t(`offers.${offer}`)}
          </li>
        ))}
      </ul>
    </Section>
  );
}
