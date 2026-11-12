import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/section";
import { SixthSense } from "@/components/sixth-sense";

const stages = ["see", "sense", "fix", "strengthen"] as const;

export function Consulting() {
  const t = useTranslations("Consulting");

  return (
    <Section id="consulting" navSection="about" className="border-t border-hairline">
      <SectionHeading label={t("label")}>{t("heading")}</SectionHeading>
      <p className="mt-3 max-w-2xl text-fg-muted">{t("intro")}</p>

      <SixthSense />

      <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <li
            key={stage}
            id={`stage-${stage}`}
            className="consulting-stage border-t border-hairline pt-5"
          >
            <span className="stage-num font-mono text-3xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold text-fg">
              {t(`stages.${stage}.label`)}
            </h3>
            <p className="mt-2 text-sm text-fg-muted">
              {t(`stages.${stage}.desc`)}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
