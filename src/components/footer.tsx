import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { brand, socialLinks } from "@/lib/content";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-hairline bg-panel/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={brand.botHead}
            alt=""
            width={40}
            height={30}
            className="pixelated"
          />
          <div>
            <p className="font-display font-semibold text-fg">{t("line")}</p>
            <p className="mt-1 text-sm text-fg-muted">{t("place")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">
            {t("follow")}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  {t(`socials.${link.id}`)}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
