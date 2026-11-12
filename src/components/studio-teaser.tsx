import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/section";
import { brand } from "@/lib/content";

export function StudioTeaser() {
  const t = useTranslations("Studio");

  return (
    <Section id="studio" navSection="about" className="border-t border-hairline">
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-panel px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-worker/10 blur-3xl"
        />
        <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr]">
          <Image
            src={brand.botHead}
            alt=""
            width={144}
            height={108}
            className="pixelated w-24 sm:w-36"
          />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-worker">
              {t("label")}
            </p>
            <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              {t("heading")}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-fg-muted">{t("copy")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="rounded-full bg-worker px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
              >
                {t("cta")}
              </Link>
              <Link
                href={{ pathname: "/about", hash: "contact" }}
                className="rounded-full border border-hairline px-6 py-3 font-medium text-fg transition-colors hover:border-foreman hover:text-foreman"
              >
                {t("contactCta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
