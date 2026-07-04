import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { EmailCta } from "@/components/email-cta";
import { contactEmail, contactLinks } from "@/lib/content";

export function Contact() {
  const t = useTranslations("Contact");

  return (
    <Section id="contact" className="border-b-0">
      <h2 className="font-display text-3xl font-semibold text-fg sm:text-4xl">
        {t("heading")}
      </h2>
      <p className="mt-4 max-w-2xl text-fg-muted">{t("copy")}</p>

      <EmailCta label={t("emailCta")} email={contactEmail} />

      <h3 className="mt-14 font-display text-lg font-semibold text-fg">
        {t("linksHeading")}
      </h3>
      <ul className="mt-4 flex flex-wrap gap-6 text-sm">
        {contactLinks.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
            >
              {t(`links.${link.id}`)}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
