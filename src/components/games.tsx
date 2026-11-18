import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/section";
import { GameArcade } from "@/components/game-arcade";

export function Games() {
  const t = useTranslations("Games");

  return (
    <Section id="games" navSection="games" className="border-t border-hairline">
      <SectionHeading label={t("label")}>{t("heading")}</SectionHeading>
      <p className="mt-4 max-w-2xl text-pretty text-fg-muted">{t("intro")}</p>

      <GameArcade />

      <p className="mt-10 text-sm text-fg-muted">{t("closingLine")}</p>
    </Section>
  );
}
