import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeading } from "@/components/section";

const offers = ["audit", "accompaniment", "partnership"] as const;
const steps = ["talk", "checkpoint", "ship"] as const;

export function WorkWithMe() {
  const t = useTranslations("Work");
  const tContact = useTranslations("Contact");

  return (
    <Section id="work" navSection="about" className="border-t border-hairline">
      <SectionHeading label={t("label")}>{t("heading")}</SectionHeading>
      <p className="mt-4 max-w-2xl text-pretty text-fg-muted">{t("intro")}</p>

      <ul className="mt-12 grid gap-5 md:grid-cols-3">
        {offers.map((offer, i) => (
          <li
            key={offer}
            className={`flex flex-col rounded-2xl border bg-panel p-6 ${
              i === 2 ? "border-foreman/40" : "border-hairline"
            }`}
          >
            <h3 className="font-display text-xl font-semibold text-fg">
              {t(`offers.${offer}.title`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {t(`offers.${offer}.desc`)}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-20 font-mono text-xs uppercase tracking-[0.2em] text-worker">
        {t("stepsHeading")}
      </h3>
      <ol className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step} className="border-t border-hairline pt-5">
            <span className="font-mono text-3xl text-worker">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="mt-3 font-display text-lg font-semibold text-fg">
              {t(`steps.${step}.title`)}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {t(`steps.${step}.desc`)}
            </p>
          </li>
        ))}
      </ol>

      <Link
        href={{ pathname: "/about", hash: "contact" }}
        className="mt-12 inline-flex rounded-full bg-foreman px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
      >
        {tContact("emailCta")} →
      </Link>
    </Section>
  );
}
