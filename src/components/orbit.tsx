import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { OrbitSwarm } from "@/components/orbit-swarm";

const clusters = [
  { key: "games", href: "#games", angle: -90 },
  { key: "web", href: "#web", angle: 30 },
  { key: "consulting", href: "#consulting", angle: 150 },
] as const;

export function Orbit() {
  const t = useTranslations("Orbit");

  return (
    <Section id="orbit" className="py-16">
      <h2 className="sr-only">{t("heading")}</h2>
      <div className="relative mx-auto aspect-square w-full max-w-lg">
        <OrbitSwarm />
        <div className="absolute inset-0 rounded-full border border-hairline" />
        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-worker bg-panel text-center font-display text-base font-semibold text-worker">
          {t("core")}
        </div>
        {clusters.map(({ key, href, angle }) => {
          const radius = 48;
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <a
              key={key}
              href={href}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-panel text-sm font-medium text-fg transition-colors hover:border-foreman hover:text-foreman"
            >
              {t(key)}
            </a>
          );
        })}
      </div>
    </Section>
  );
}
