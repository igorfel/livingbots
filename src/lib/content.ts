import type { StaticImageData } from "next/image";

import heroArt from "@/assets/arcanes/hero.webp";
import keyArt from "@/assets/arcanes/key-art.webp";
import itchCover from "@/assets/arcanes/itch-cover.webp";
import arcanesTitle from "@/assets/arcanes/title.webp";
import arcanesIcon from "@/assets/arcanes/icon.webp";
import botHead from "@/assets/arcanes/bot-head.png";

import shotVillage from "@/assets/arcanes/shots/lunethiel-village.webp";
import shotBlacksmith from "@/assets/arcanes/shots/lunethiel-blacksmith-boron.webp";
import shotValley from "@/assets/arcanes/shots/eons-valley.webp";
import shotDarkwoods from "@/assets/arcanes/shots/darkwoods.webp";
import shotCave from "@/assets/arcanes/shots/eons-cave.webp";
import shotDaggers from "@/assets/arcanes/shots/daggers-vs-nightborne.webp";
import shotShield from "@/assets/arcanes/shots/shield-block.webp";
import shotMinotaur from "@/assets/arcanes/shots/minotaur-boss.webp";
import shotLich from "@/assets/arcanes/shots/lich-king-in-the-crypt.webp";
import shotShop from "@/assets/arcanes/shots/shop-selling-loot.webp";
import shotRefining from "@/assets/arcanes/shots/equipment-refining.webp";
import shotBestiary from "@/assets/arcanes/shots/bestiary.webp";

import artLuffendor from "@/assets/arcanes/art/luffendor-before-the-great-rupture.webp";
import artLunethiel from "@/assets/arcanes/art/lunethiel-at-its-height.webp";
import artOak from "@/assets/arcanes/art/sacred-ancient-oak.webp";
import artGate from "@/assets/arcanes/art/lyff-before-the-ancient-gate.webp";

import charLyff from "@/assets/arcanes/chars/lyff-idle-with-sword.png";
import charLethriel from "@/assets/arcanes/chars/lethriel-forest-guardian.png";
import charBoron from "@/assets/arcanes/chars/boron.png";
import charMinotaur from "@/assets/arcanes/chars/minotaur-boss.png";

export const brand = { botHead };

export const arcanes = {
  playHref: "https://arcanes.vercel.app/",
  itchHref: "https://livingbots.itch.io/arcanes",
  discordHref: "https://discord.gg/bznrpkUNFM",
  heroArt,
  keyArt,
  itchCover,
  title: arcanesTitle,
  icon: arcanesIcon,
} as const;

/** Spec-sheet rows; labels and values live in messages under Arcanes.facts. */
export const arcanesFacts = [
  "genre",
  "platforms",
  "controls",
  "languages",
  "status",
  "price",
] as const;

/** Three headline pillars, each paired with the screenshot that proves it. */
export const arcanesPillars = [
  { id: "explore", image: shotValley },
  { id: "fight", image: shotShield },
  { id: "gear", image: shotRefining },
] as const satisfies readonly { id: string; image: StaticImageData }[];

export const arcanesExtras = [
  "classes",
  "economy",
  "world",
  "systems",
  "cinematic",
  "anywhere",
] as const;

export const arcanesGallery = [
  { id: "village", image: shotVillage },
  { id: "darkwoods", image: shotDarkwoods },
  { id: "minotaur", image: shotMinotaur },
  { id: "daggers", image: shotDaggers },
  { id: "cave", image: shotCave },
  { id: "lich", image: shotLich },
  { id: "blacksmith", image: shotBlacksmith },
  { id: "shop", image: shotShop },
  { id: "bestiary", image: shotBestiary },
] as const satisfies readonly { id: string; image: StaticImageData }[];

export const arcanesLore = [
  { id: "luffendor", image: artLuffendor },
  { id: "lunethiel", image: artLunethiel },
  { id: "oak", image: artOak },
  { id: "gate", image: artGate },
] as const satisfies readonly { id: string; image: StaticImageData }[];

export const arcanesCharacters = [
  { id: "lyff", image: charLyff },
  { id: "lethriel", image: charLethriel },
  { id: "boron", image: charBoron },
  { id: "minotaur", image: charMinotaur },
] as const satisfies readonly { id: string; image: StaticImageData }[];

export const games = [
  {
    id: "shooting-stars",
    name: "Shooting Stars",
    playHref: "https://shootingstars-conquest.vercel.app/",
    itchHref: "https://livingbots.itch.io/shooting-stars",
    stack: ["Canvas 2D", "TypeScript", "Vite"],
  },
  {
    id: "stack-rivals",
    name: "Stack Rivals",
    playHref: "https://stack-rivals.vercel.app/",
    stack: ["Canvas 2D", "TypeScript", "CrazyGames SDK"],
  },
  {
    id: "bomb-arena",
    name: "Bomb Arena",
    playHref: "https://bombarena.vercel.app/",
    stack: ["SpacetimeDB", "TypeScript"],
  },
  {
    id: "orbit-runner",
    name: "Orbit Runner",
    playHref: "https://orbital-runner.vercel.app/",
    stack: ["HTML5", "SpacetimeDB"],
  },
] as const;

export const itchProfileHref = "https://livingbots.itch.io";

/** Everything live on the itch.io page, newest first. */
export const itchGames = [
  { id: "arcanes", name: "Arcanes", href: "https://livingbots.itch.io/arcanes" },
  {
    id: "shooting-stars",
    name: "Shooting Stars",
    href: "https://livingbots.itch.io/shooting-stars",
  },
  {
    id: "arcanes-brief-story",
    name: "Arcanes: A Brief Story",
    href: "https://livingbots.itch.io/arcanes-a-brief-story",
  },
  {
    id: "smplanes",
    name: "So Much Planes!",
    href: "https://livingbots.itch.io/smplanes",
  },
] as const;

export const webProjects = [
  {
    id: "acai-joca",
    stack: ["Next.js 15", "Tailwind v4", "Framer Motion"],
  },
  {
    id: "gaming-platform",
    stack: ["SpacetimeDB", "Nakama"],
  },
] as const;

export const factoryGates = ["tsc", "ESLint", "Vitest"] as const;

export const contactLinks = [
  { id: "github", href: "https://github.com/igorfel" },
  { id: "itch", href: itchProfileHref },
  { id: "linkedin", href: "https://www.linkedin.com/in/igorfelipe/" },
] as const;

export const socialLinks = [
  { id: "discord", href: "https://discord.gg/bznrpkUNFM" },
  { id: "youtube", href: "https://www.youtube.com/@livingbotsstudio" },
  { id: "instagram", href: "https://www.instagram.com/livingbots_/" },
  { id: "itch", href: itchProfileHref },
] as const;

export const contactEmail = "appsigor@gmail.com";
