import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { AcaiMockup } from "@/components/acai-mockup";
import { webProjects } from "@/lib/content";

export function Web() {
  const t = useTranslations("Web");

  return (
    <Section id="web">
      <h2 className="font-display text-3xl font-semibold text-fg sm:text-4xl">
        {t("heading")}
      </h2>
      <p className="mt-3 max-w-2xl text-fg-muted">{t("intro")}</p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {webProjects.map((project) => (
          <li
            key={project.id}
            className="flex flex-col gap-4 rounded-2xl border border-hairline bg-panel p-6"
          >
            {project.id === "acai-joca" && <AcaiMockup />}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-fg">
                {t(`items.${project.id}.name`)}
              </h3>
              <span className="shrink-0 rounded-full border border-foreman/40 px-2 py-1 font-mono text-xs uppercase tracking-wide text-foreman">
                {t(`items.${project.id}.label`)}
              </span>
            </div>
            <p className="text-sm text-fg-muted">
              {t(`items.${project.id}.blurb`)}
            </p>
            <ul className="mt-auto flex flex-wrap gap-2 font-mono text-xs text-fg-muted">
              {project.stack.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-hairline px-2 py-1"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
