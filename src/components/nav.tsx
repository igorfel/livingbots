import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { NavCompanion } from "@/components/nav-companion";
import { brand, itchProfileHref } from "@/lib/content";

const linkClass =
  "whitespace-nowrap text-fg-muted transition-colors hover:text-fg focus-visible:text-fg";

export function Nav() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-ink/85 backdrop-blur-md">
      <nav
        className="relative mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4"
        aria-label="Main"
      >
        {/* Mobile: logo + toggle share the top row. Desktop: `contents`
            dissolves the wrapper so all three groups sit in one bar. */}
        <div className="flex items-center justify-between gap-4 sm:contents">
          <Link
            href="/"
            aria-label={t("home")}
            className="flex items-center gap-2 font-display text-base font-semibold tracking-tight sm:text-lg"
          >
            <Image
              src={brand.botHead}
              alt=""
              width={24}
              height={18}
              className="pixelated"
            />
            LivingBots
          </Link>
          <div className="sm:order-last">
            <LanguageToggle />
          </div>
        </div>
        {/* One line that scrolls if it overflows, so items never wrap and stay
            mounted for the companion bot. */}
        <ul className="-mx-1 flex items-center gap-x-5 overflow-x-auto px-1 pt-2 text-sm [scrollbar-width:none] sm:ml-auto sm:gap-x-7 sm:pt-0">
          <li>
            <Link
              href={{ pathname: "/", hash: "arcanes" }}
              data-nav-item="arcanes"
              className="whitespace-nowrap font-medium text-arcane transition-colors hover:text-[#ffd885]"
            >
              {t("arcanes")}
            </Link>
          </li>
          <li>
            <Link
              href={{ pathname: "/", hash: "games" }}
              data-nav-item="games"
              className={linkClass}
            >
              {t("games")}
            </Link>
          </li>
          <li>
            <a
              href={itchProfileHref}
              target="_blank"
              rel="noopener noreferrer"
              data-nav-item="itch"
              className={linkClass}
            >
              {t("itch")}
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> ({t("external")})</span>
            </a>
          </li>
          <li>
            <Link
              href={{ pathname: "/", hash: "tools" }}
              data-nav-item="tools"
              className={linkClass}
            >
              {t("tools")}
            </Link>
          </li>
          <li>
            <Link href="/about" data-nav-item="about" className={linkClass}>
              {t("about")}
            </Link>
          </li>
          <li>
            <Link
              href={{ pathname: "/about", hash: "contact" }}
              data-nav-item="contact"
              className={linkClass}
            >
              {t("contact")}
            </Link>
          </li>
        </ul>
        <NavCompanion />
      </nav>
    </header>
  );
}
