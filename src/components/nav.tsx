import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { NavCompanion } from "@/components/nav-companion";

const sections = ["games", "web", "consulting", "factory", "contact"] as const;

export function Nav() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ink/90 backdrop-blur">
      <nav
        className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4"
        aria-label="Main"
      >
        <a
          href="#hero"
          data-nav-item="hero"
          className="font-display text-lg font-semibold tracking-tight"
        >
          LivingBots
        </a>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {sections.map((section) => (
            <li key={section}>
              <a
                href={`#${section}`}
                data-nav-item={section}
                className="text-fg-muted transition-colors hover:text-fg"
              >
                {t(section)}
              </a>
            </li>
          ))}
        </ul>
        <LanguageToggle />
        <NavCompanion />
      </nav>
    </header>
  );
}
