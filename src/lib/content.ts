import type { StaticImageData } from "next/image";

import heroArt from "@/assets/arcanes/hero.webp";
import keyArt from "@/assets/arcanes/key-art.webp";
import itchCover from "@/assets/arcanes/itch-cover.webp";
import arcanesTitle from "@/assets/arcanes/title.webp";
import arcanesIcon from "@/assets/arcanes/icon.webp";
import botHead from "@/assets/arcanes/bot-head.png";

import shotFestival from "@/assets/arcanes/shots/graduates-festival.webp";
import shotHollowVessel from "@/assets/arcanes/shots/hollow-vessel.webp";
import shotValley from "@/assets/arcanes/shots/eons-valley.webp";
import shotDarkwoods from "@/assets/arcanes/shots/darkwoods.webp";
import shotCave from "@/assets/arcanes/shots/eons-cave.webp";
import shotLongAxe from "@/assets/arcanes/shots/long-axe.webp";
import shotBow from "@/assets/arcanes/shots/bow-at-the-lake.webp";
import shotMinotaur from "@/assets/arcanes/shots/minotaur-boss.webp";
import shotLich from "@/assets/arcanes/shots/lich-king-in-the-crypt.webp";
import shotRefining from "@/assets/arcanes/shots/equipment-refining.webp";
import shotBestiary from "@/assets/arcanes/shots/bestiary.webp";
import shotWardrobe from "@/assets/arcanes/shots/class-wardrobe.webp";

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
  playHref: "https://www.arcanes.com.br/",
  itchHref: "https://livingbots.itch.io/arcanes",
  discordHref: "https://discord.gg/bznrpkUNFM",
  heroArt,
  keyArt,
  itchCover,
  title: arcanesTitle,
  icon: arcanesIcon,
} as const;

/** Press kits on Google Drive, each labeled in its own language. */
export const arcanesPressKits = [
  {
    lang: "en",
    label: "English",
    href: "https://drive.google.com/drive/folders/1AqRIIq8X-KMUWoQ0DeJ1YGcOEki3KU_C",
  },
  {
    lang: "pt-BR",
    label: "Português",
    href: "https://drive.google.com/drive/folders/1wIfbHOgLgESy6Rx5il9IcoXpOQvyXSf7",
  },
] as const;

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
  { id: "fight", image: shotLongAxe },
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
  { id: "festival", image: shotFestival },
  { id: "darkwoods", image: shotDarkwoods },
  { id: "minotaur", image: shotMinotaur },
  { id: "hollowVessel", image: shotHollowVessel },
  { id: "cave", image: shotCave },
  { id: "lich", image: shotLich },
  { id: "bow", image: shotBow },
  { id: "wardrobe", image: shotWardrobe },
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
    id: "smplanes",
    name: "So Much Planes!",
    href: "https://livingbots.itch.io/smplanes",
  },
] as const;

/** FreeSpace, the studio's disk cleaner for dev machines. Targets are real paths/commands, so they stay untranslated. */
export const freespace = {
  href: {
    en: "https://freespace-now.vercel.app/",
    pt: "https://freespace-now.vercel.app/pt-br",
  },
  scans: [
    {
      name: "Windows",
      targets: ["node_modules", ".venv", "npm-cache", "%TEMP%", "SoftwareDistribution", "*.dmp"],
    },
    {
      name: "WSL",
      targets: ["/var/cache/apt", "journald", "/tmp", "~/.vscode-server", "~/.nvm", "ext4.vhdx"],
    },
    {
      name: "Docker",
      targets: ["builder prune", "image prune", "container prune", "volume prune"],
    },
  ],
} as const;

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
