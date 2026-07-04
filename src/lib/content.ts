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

export const publishedGames = [
  {
    id: "arcanes",
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
  { id: "itch", href: "https://livingbots.itch.io" },
  { id: "linkedin", href: "https://www.linkedin.com/in/igorfelipe/" },
] as const;

export const contactEmail = "appsigor@gmail.com";
