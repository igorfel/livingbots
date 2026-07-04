"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

export function LanguageToggle() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-hairline p-1 text-xs font-mono"
      role="group"
      aria-label={t("languageToggle")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={locale === loc ? "true" : undefined}
          className={`rounded-full px-2 py-1 uppercase transition-colors ${
            locale === loc
              ? "bg-worker text-ink"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
