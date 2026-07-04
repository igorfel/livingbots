import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-fg-muted">
        <p className="font-mono">{t("line")}</p>
        <LanguageToggle />
      </div>
    </footer>
  );
}
