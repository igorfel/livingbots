import { setRequestLocale } from "next-intl/server";
import { ArcanesHero } from "@/components/arcanes-hero";
import { Arcanes } from "@/components/arcanes";
import { ArcanesWorld } from "@/components/arcanes-world";
import { Games } from "@/components/games";
import { ItchBand } from "@/components/itch-band";
import { StudioTeaser } from "@/components/studio-teaser";
import { Tools } from "@/components/tools";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ArcanesHero />
      <Arcanes />
      <ArcanesWorld />
      <Games />
      <ItchBand />
      <Tools />
      <StudioTeaser />
    </>
  );
}
