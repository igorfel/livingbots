import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/section";
import { EmailCta } from "@/components/email-cta";
import { HeroSwarm } from "@/components/hero-swarm";
import { contactEmail, contactLinks } from "@/lib/content";

export function Contact() {
  const t = useTranslations("Contact");

  return (
    <Section id="contact" className="border-b-0">
      <SectionHeading index="05">{t("heading")}</SectionHeading>
      <p className="mt-4 max-w-2xl text-fg-muted">{t("copy")}</p>

      <div className="relative mt-10 aspect-21/6 min-h-36 w-full" aria-hidden="true">
        <HeroSwarm word={t("swarmWord")} />
      </div>

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
