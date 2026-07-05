import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/section";
import { FactoryConveyor } from "@/components/factory-conveyor";
import { factoryGates } from "@/lib/content";

export function Factory() {
  const t = useTranslations("Factory");

  return (
    <Section id="factory">
      <SectionHeading index="04">{t("heading")}</SectionHeading>
      <p className="mt-4 max-w-3xl text-fg-muted">{t("intro")}</p>
      <p className="mt-4 max-w-3xl font-display text-lg text-worker">
        {t("framing")}
      </p>

      <FactoryConveyor />

      <h3 className="mt-12 font-display text-lg font-semibold text-fg">
        {t("gatesHeading")}
      </h3>
      <ol className="mt-4 flex flex-wrap gap-4">
        {factoryGates.map((gate, index) => (
          <li
            key={gate}
            className="flex items-center gap-2 rounded-full border border-hairline bg-panel px-4 py-2 font-mono text-sm text-fg"
          >
            <span className="text-foreman">{index + 1}</span>
            {gate}
          </li>
        ))}
      </ol>
    </Section>
  );
}
