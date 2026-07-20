import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { NavCompanion } from "@/components/nav-companion";

const sections = ["games", "web", "consulting", "factory", "contact"] as const;

export function Nav() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ink/90 backdrop-blur">
      <nav
        className="relative mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-4"
        aria-label="Main"
      >
        {/* On mobile: logo + toggle share the top row. On desktop: `contents`
            dissolves this wrapper so the three groups lay out in one flex bar. */}
        <div className="flex items-center justify-between gap-4 sm:contents">
          <a
            href="#hero"
            data-nav-item="hero"
            className="font-display text-base font-semibold tracking-tight sm:text-lg"
          >
            LivingBots
          </a>
          <div className="sm:order-last">
            <LanguageToggle />
          </div>
        </div>
        {/* Single line that scrolls if it overflows, so the links never wrap into
            extra rows — and every item stays mounted for the companion bot. */}
        <ul className="flex items-center gap-x-5 overflow-x-auto text-sm [scrollbar-width:none] sm:flex-wrap sm:gap-x-6">
          {sections.map((section) => (
            <li key={section}>
              <a
                href={`#${section}`}
                data-nav-item={section}
                className="whitespace-nowrap text-fg-muted transition-colors hover:text-fg"
              >
                {t(section)}
              </a>
            </li>
          ))}
        </ul>
        <NavCompanion />
      </nav>
    </header>
  );
}
