import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/section";
import Image from "next/image";
import { brand } from "@/lib/content";

const nowItems = ["arcanes", "advisory", "factory"] as const;
const skills = ["games", "web", "guidance"] as const;

export function AboutIntro() {
  const t = useTranslations("About");

  return (
    <Section id="about" navSection="about">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <SectionHeading label={t("label")} as="h1">
            {t("heading")}
          </SectionHeading>
          <p className="mt-6 text-pretty text-xl leading-relaxed text-fg">
            {t("lead")}
          </p>
          <p className="mt-5 text-pretty leading-relaxed text-fg-muted">{t("p1")}</p>
          <p className="mt-4 text-pretty leading-relaxed text-fg-muted">{t("p2")}</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* The studio mascot, big and crisp. */}
          <div className="relative flex items-center justify-center py-6" aria-hidden="true">
            <div className="absolute h-48 w-48 rounded-full bg-worker/15 blur-3xl" />
            <Image
              src={brand.botHead}
              alt=""
              width={192}
              height={144}
              priority
              className="pixelated relative w-40 sm:w-48"
            />
          </div>
          <div className="rounded-2xl border border-hairline bg-panel p-6">
            <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-worker">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-worker" />
              {t("now")}
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-fg">
              {nowItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-fg-muted">
                    →
                  </span>
                  {t(`nowItems.${item}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h2 className="mt-24 font-mono text-xs uppercase tracking-[0.2em] text-worker">
        {t("skillsHeading")}
      </h2>
      <ul className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-3">
        {skills.map((skill) => (
          <li key={skill} className="border-t border-hairline pt-5">
            <h3 className="font-display text-xl font-semibold text-fg">
              {t(`skills.${skill}.title`)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {t(`skills.${skill}.desc`)}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
