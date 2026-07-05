---
target: portfolio homepage (all sections)
total_score: 29
p0_count: 0
p1_count: 3
timestamp: 2026-07-05T05-27-02Z
slug: src-app-locale-page-tsx
---
# Assessment A — design review (recorded before detector)

## AI slop verdict
Concept: NO (swarm-builds-the-site is a real POV and a literal work sample).
Execution: PARTIAL YES. Strip the canvases and what remains is a generic dark-SaaS template: identical rounded-2xl border-hairline bg-panel card grids repeated 4×, uniform max-w-6xl centered column, uniform py-20 + border-b section rhythm, timid type scale, one small accent.

## Heuristic scores (Nielsen 0-4)
1 Visibility of status: 3 (arena has zero affordance hint; nav dot near-invisible)
2 Match real world: 3 (factory intro is a raw arrow-chain of jargon aimed at founders)
3 User control: 3
4 Consistency: 4
5 Error prevention: 3
6 Recognition vs recall: 2 (arena targets are unlabeled glyphs; user must guess which game is which)
7 Flexibility: 3
8 Aesthetic/minimalist: 2 (template card grammar, no display type, color timidity)
9 Error recovery: 3
10 Help/docs: 3 (interactive scenes unexplained)
Total: 29/40

## Strengths
1. Concept originality + honesty of copy (status labels, no invented numbers) = real voice.
2. Engineering craft: reduced-motion static states everywhere, IO-gated rAF, DPR cap, fixed-aspect no-CLS, real HTML content under every canvas.
3. Consistent token discipline; the bones are clean and maintainable.

## Priority issues
P1-A The concept is caged. Every scene lives inside a rounded-2xl bordered panel; hero swarm confined to max-w-3xl 21:9 box. "Bots inhabit the site" reads as "bots live in picture frames." Nothing crosses section boundaries except a 2px nav dot. Needs: full-bleed hero, bots escaping frames, swarm presence between sections (margin crew / heading assembly), bolder global layer.
P1-B Bots have no life at pixel level. Flat 3px rects, opacity blink only. No glow, no trails, no stretch-by-velocity, no foreman behavior difference. Hero formation = first impression, currently drama-free. Additive glow + trails + size/velocity variation = cheap, huge win. "Software that feels alive" currently reads mechanical.
P1-C Games invisible. Text-only cards for the strongest proof asset. No screenshots/gifs/embeds of 4 playable games. Highest-credibility fix: visual proof (screenshot per card at minimum; live iframe on demand ideal).
P2-D Template card grammar everywhere (identical card grids ban). Games cards, web cards, 4 consulting stage cards, published cards: same anatomy. Vary section anatomy per narrative.
P2-E Type scale timid: h2 30-36px, tagline 20-24px, no display moment anywhere; H1 only sr-only + dots. Brand register wants typographic risk.
P2-F Arena UX: unlabeled targets (recall problem), no "move / shoot / tap" hint, no hit feedback beyond scroll+ring. Also motion-reduce hides arena entirely (good) but non-reduced users get no fallback labels either.
P3-G Factory intro = spec text pasted as paragraph (arrow chain). Narrate for founders or annotate the conveyor and cut the paragraph.
P3-H Orbit section adds little at max-w-sm scale: tiny circles, tiny labels. Make it grand or cut it.
P3-I Peak-end: contact section is the flattest section; no final swarm moment. Envelope micro-anim exists but ending is quiet.
P3-J Nav companion imperceptible (h-2 w-2, blink 0.75-1.0 opacity). Personality doesn't land. Mobile flex-wrap positioning fragile.
P3-K No OpenGraph image configured in metadata (spec CP8 requires OG of swarm forming words). Share preview = nothing.

## Persona red flags
- Founder/vibe-coder client: consulting offers are 3 bare pills (no what-you-get/next-step), factory intro jargon wall, no artifacts of process (e.g., a real ticket screenshot).
- Phone-first recruiter/skimmer: no imagery anywhere, hero is dots + small text, nothing screenshot-worthy; arena needs pointer.
- Fellow dev (view-source audience): no "how this site is built by its own bots" link/note to repo or engine. Missed delight.

## Questions
- What if the swarm owned the whole page (single fixed canvas layer, scenes as regions) instead of per-section framed canvases?
- What if each game card were a tiny playable/animated vignette instead of text?
- What would 120px display type do for the tagline moment after the swarm settles?

## Assessment B — detector
CLI scan (detect.mjs --json src/components src/app): 0 findings, exit clean. No banned patterns (side-stripes, gradient text, glassmorphism, hero-metric template). Browser overlay pass unavailable this session (no browser automation); fallback = source review only. Detector agreement note: mechanical bans all avoided; the identical-card-grid and uniform-rhythm issues are compositional and invisible to the detector — LLM-only findings.
