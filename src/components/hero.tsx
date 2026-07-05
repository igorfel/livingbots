import { useTranslations } from "next-intl";
import { HeroScene } from "@/components/hero-scene";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section id="hero" className="relative scroll-mt-20 border-b border-hairline">
      <HeroScene
        eyebrow={t("eyebrow")}
        tagline={t("tagline")}
        sub={t("sub")}
        ctaGames={t("ctaGames")}
        ctaConsulting={t("ctaConsulting")}
      />
    </section>
  );
}
