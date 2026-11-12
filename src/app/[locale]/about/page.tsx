import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutIntro } from "@/components/about-intro";
import { WorkWithMe } from "@/components/work-with-me";
import { Web } from "@/components/web";
import { Consulting } from "@/components/consulting";
import { Factory } from "@/components/factory";
import { Contact } from "@/components/contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: {
      languages: { en: "/en/about", pt: "/pt/about" },
    },
    openGraph: {
      title: t("aboutTitle"),
      description: t("aboutDescription"),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AboutIntro />
      <WorkWithMe />
      <Web />
      <Consulting />
      <Factory />
      <Contact />
    </>
  );
}
