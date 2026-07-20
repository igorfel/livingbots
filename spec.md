
# LivingBots Site

You are building my personal brand / studio website. I'm Igor Felipe, solo developer behind **LivingBots**. Work checkpoint by checkpoint (defined at the bottom) — **stop after each checkpoint, run the gates, and wait for my review before continuing.**

## Project setup

- Create the project at `/home/livingbot/dev/livingbots/livingbots-site/`
- Stack: **Next.js 15 (App Router) + TypeScript (strict) + Tailwind v4**
- Deploy target: Vercel (`livingbots.vercel.app`), so keep everything Vercel-default friendly (no custom server)
- Set up the quality gates I use on every project: `tsc --noEmit`, ESLint, Vitest. Add npm scripts `check` (runs all three) — every checkpoint must pass `npm run check` before you show it to me.
- i18n: bilingual **EN / pt-BR** with path-based locales (`/en`, `/pt`) using `next-intl` (or a lightweight dictionary approach if you justify it). Language toggle in the nav. Default locale by `Accept-Language`, persisted choice. I'm a native pt-BR speaker — write natural Brazilian Portuguese, not literal translation; I'll review it.

## The creative concept (this is the whole point — don't flatten it)

The studio name taken literally: **the site is inhabited by a swarm of tiny autonomous bots that build the page in front of the visitor.** Cyan bots are workers; rare magenta bots are "foremen." One small companion bot lives in the nav, perched on the active item, and follows the visitor through the site.

This isn't decoration — it's the pitch. I run an autonomous dev pipeline (bots that build software), and I build Canvas 2D games. A site visibly built by living bots, written in Canvas 2D + TypeScript, is itself my work sample.

## Design tokens

| Token | Value |
|---|---|
| Background ink | `#0B0E14` |
| Panel | `#12161F` |
| Hairline | `#232838` |
| Text primary / muted | `#E8ECF1` / `#7C8496` |
| Worker cyan | `#3DD6FF` |
| Foreman magenta | `#FF3D6E` — sparingly: CTAs, foreman bots, key labels |
| Display type | Space Grotesk |
| Body type | Inter |
| Mono | JetBrains Mono — tags, stats, labels |

Dark theme only. Flat, disciplined, generous spacing; the bots are the one bold element, everything else stays quiet.

## Bot engine (shared, build once)

One small engine module used by every scene:

- Steering behaviors: seek/arrive (spring toward home point), flee (pointer repulsion), wander (idle jitter), burst (scatter on tap)
- Bots render as ~3px squares; occasional blink/wobble for personality
- Each scene = its own `<canvas>`, mounted and animated **only while visible** (IntersectionObserver); rAF paused otherwise
- Particle caps: hero ~400 desktop / ~250 mobile; other scenes less
- `prefers-reduced-motion`: every scene renders its static final state, no animation loops
- Touch-first: everything works with one thumb; hover is enhancement only
- Fixed-aspect containers for every canvas — zero layout shift

## Site structure & sections

Nav: **Games · Web · Consulting · Factory · Contact** + EN/PT toggle. No hamburger if it fits; otherwise minimal sheet.

### 1. Hero — the swarm
Bots fly in from the edges and assemble the words **LIVING BOTS**. Pointer/touch scatters them; they always return home. Tap = burst. After the formation settles (~2s), the swarm loosens and the tagline + CTAs fade in beneath.

Copy (EN):
- H1 (visually: the swarm forms it; also present as real HTML for SEO): **LivingBots**
- Tagline: **"I build software that feels alive."**
- Sub: "Games, websites, and healthier codebases — by Igor Felipe, One developer with 16 years of code, breaking ambitious ideas into achievable milestones."
- CTAs: "Play the games" → Games · "Work with me" → Consulting

pt-BR tagline: **"Eu crio software que parece vivo."** (translate the rest naturally)

### 2. Studio map — the orbit
Right after the hero, the swarm regroups into a small orbital system: LivingBots core at center, three labeled clusters orbiting — **Games**, **Web**, **Consulting**. Tapping a cluster smooth-scrolls to that section. This is a living site map and the "what I do" statement; keep copy near zero.

### 3. Games — playable arena
A contained Canvas arena. The visitor's cursor/thumb is a small ship; the four games float as targets, each with its own visual identity:
- falling star → **Shooting Stars**
- synthwave block → **Stack Rivals**
- artillery arc → **Bomb Arena**
- orbiting planet → **Orbit Runner**

Shooting/flying into a target opens that game's card. **Plain tap on the target must always work too** — the shooting is a bonus, never a gate. Reduced-motion fallback: a plain tappable grid of the four cards.

Game data (be exactly this honest — no "shipped to CrazyGames" claims):

| Game | Status label | Blurb | Links | Stack tags |
|---|---|---|---|---|
| Shooting Stars | In development — playable | "Face the endless war, and make the sky fall at your feet." Top-down Vampire Survivors × tower defense hybrid, targeting CrazyGames. i18n EN/pt-BR. | Play: https://shootingstars-conquest.vercel.app/ · itch.io: https://livingbots.itch.io/shooting-stars | Canvas 2D, TypeScript, Vite |
| Stack Rivals | In development — playable | Precision stacking game. Synthwave aesthetic, heatmap death-tracking, seeded daily challenge, 7 locales. CrazyGames SDK integrated, release pending. | Play: https://stack-rivals.vercel.app/ | Canvas 2D, TypeScript, CrazyGames SDK |
| Bomb Arena | Playable proof of capability | Gunbound-style artillery with real server-side physics — built as a technical demo for a competitive-gaming-platform client. | Play: https://bombarena.vercel.app/ | SpacetimeDB, TypeScript |
| Orbit Runner | Playable prototype | One-thumb arcade — a dot latching onto orbiting planets. Anti-cheat architecture (replay verification), modifier-fork economy design. | Play: https://orbital-runner.vercel.app/ | HTML5, SpacetimeDB |

Below the arena — **Published on itch.io**, as cards that bots visibly assemble on scroll (borders draw in, content settles):
- **Arcanes: A Brief Story** — "Explore the land of Hyperion and all its trials." → https://livingbots.itch.io/arcanes-a-brief-story
- **So Much Planes!** — "Play against everyone in this frenetic game." → https://livingbots.itch.io/smplanes

One closing line, generic (do NOT name titles): earlier games were published on Google Play and have since been delisted.

### 4. Web — concept work
Framed honestly as concept/demo work: "sites built to show what I'd build for you."
- **Açaí do Joca Jr.** — one-scroll landing concept for a local açaí brand, B2B lead capture. Next.js 15, Tailwind v4, Framer Motion. Label: *Concept*. Card is assembled by bots on scroll: a browser-frame mockup whose layout blocks are carried in piece by piece.
- **Competitive gaming platform (anonymized — never name the client)** — ongoing technical advisory: engagement proposal tiers + backend architecture analysis (SpacetimeDB vs. Nakama), Bomb Arena as capability demo. Label: *Active engagement*.

### 5. Consulting — the Sixth Sense, acted out
A stylized code-block visual with red glitch "bug" bots crawling on it. On scroll, four stages play in sequence (scroll-scrubbed or auto-advancing when in view):
1. **Ver / See** — scanner sweep highlights the bugs
2. **Pressentir / Sense** — warning pulses where failures *will* happen
3. **Corrigir / Fix** — worker bots swarm and repair
4. **Fortalecer / Strengthen** — a lattice draws around the healed block

Copy: technical guidance for founders and "vibe coders" building with AI — dev workflow, security, architecture. Offer shapes: one-time audit · ongoing accompaniment · build partnership. No client counts, no testimonials, no invented numbers.

### 6. The Factory — the showpiece
A conveyor scene: ticket squares (GitHub issues) enter left; bots carry them through **three gates labeled tsc · ESLint · Vitest**; passing tickets fly into a "main" trunk; failing tickets bounce back with an `agent:feedback` tag and get re-carried. A magenta foreman bot stamps tickets at the start (that's me as PM).

Accompanying copy for readers: GitHub Issues → Inngest workflows → Claude Code running headless → deterministic CI gates → per-ticket release branches, two-stage regression, trusted-ref adapter pattern so untrusted PR branches can't escalate permissions. Framing: "I run my own software factory — I write the tickets, the pipeline implements."

### 7. Contact
Copy: "Tell me what you're building — I'll tell you honestly whether I can help and what the first checkpoint looks like."
- Email CTA: **appsigor@gmail.com** — on click, a bot picks up an envelope and flies it off-screen (then the mailto fires)
- Links: GitHub https://github.com/igorfel · itch.io https://livingbots.itch.io · LinkedIn https://www.linkedin.com/in/igorfelipe/
- Footer: "LivingBots — Igor Felipe" + language toggle repeat

## Hard constraints

- **All real content lives in HTML** (server-rendered), never trapped inside canvas — SEO and screen readers get the full site with zero JS
- Full keyboard path: nav, cards, links, toggle
- Lighthouse mobile ≥90 performance; no CLS from canvas scenes
- No "Gynx" anywhere. No claims of published CrazyGames titles, sold websites, or closed contracts. Never name the gaming-platform client.
- Proper metadata: per-locale titles/descriptions, OpenGraph image (a static render of the swarm forming LIVING BOTS), favicon (single bot glyph)

## Checkpoints (stop + `npm run check` + show me after each)

1. **CP1 — Static site complete.** Scaffold, i18n routing EN/pt, all sections with full real content and tokens, responsive, accessible, deployable. Zero animation. (Site must be 100% shippable at this point.)
2. **CP2 — Bot engine + hero swarm.** Engine module with tests for steering math; hero formation/scatter/reform; reduced-motion static render.
3. **CP3 — Orbit studio map** with tap-to-navigate.
4. **CP4 — Scroll assembly** for Web cards + published-games cards.
5. **CP5 — Games arena** (ship + targets + tap fallback + reduced-motion grid).
6. **CP6 — Sixth Sense sequence.**
7. **CP7 — Factory conveyor.**
8. **CP8 — Contact bot, companion nav bot, polish, perf audit** (report Lighthouse numbers), OG image, deploy-ready.

At each checkpoint tell me: what you built, what you decided that wasn't in this spec and why, and what you'd flag as risk for the next checkpoint.