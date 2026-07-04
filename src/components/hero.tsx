import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { HeroScene } from "@/components/hero-scene";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <Section id="hero" className="pt-28 pb-24">
      <HeroScene
        eyebrow={t("eyebrow")}
        tagline={t("tagline")}
        sub={t("sub")}
        ctaGames={t("ctaGames")}
        ctaConsulting={t("ctaConsulting")}
      />
    </Section>
  );
}
