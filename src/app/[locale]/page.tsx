import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero";
import { Orbit } from "@/components/orbit";
import { Games } from "@/components/games";
import { Web } from "@/components/web";
import { Consulting } from "@/components/consulting";
import { Factory } from "@/components/factory";
import { Contact } from "@/components/contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Orbit />
      <Games />
      <Web />
      <Consulting />
      <Factory />
      <Contact />
    </>
  );
}
