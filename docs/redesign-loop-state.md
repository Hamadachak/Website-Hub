# Redesign Loop State

Iterative loop: OBSERVE → PLAN → IMPLEMENT → RUN → CAPTURE → CRITIQUE → VERIFY → IMPROVE → REPEAT

## Current objective
Homepage cinematic redesign at quality threshold; propagate refinements to inner pages next.

## Phase 1 — Architecture audit (complete)
- **Framework:** Astro 5, fully static, zero client framework. One inline vanilla JS block (Base.astro): language swap, `.reveal` IntersectionObserver, year, burger menu.
- **Styling:** single `src/styles/global.css`; tokens: `--ink/--panel/--line/--text/--muted/--amber`; fonts self-hosted (Archivo 700–900 display, Hanken Grotesk body, JetBrains Mono, IBM Plex Sans Arabic for `[lang=ar]`).
- **i18n:** dictionaries `src/i18n/{de,en,ar}.ts` (Dict type derived from de); de unprefixed, `/en`, `/ar` prefixed; RTL via `dir` + scoped `[dir=rtl]` overrides; blog DE + optional EN (`bodyEn`), no AR blog (nav falls back to EN).
- **Pages:** shared components `Home/ServicePage/BlogPost/BlogIndex` rendered per locale. 27 routes.
- **SEO:** BaseHead canonical + hreflang + OG/Twitter + Person/ProfessionalService graph; Service + FAQPage LD on service pages; BlogPosting LD on posts; custom `sitemap.xml.ts` with xhtml alternates; robots.txt → sitemap.
- **Integrations:** Netlify (auto-deploy from main), Cal.com booking, mailto, LinkedIn, Malt. Weekly AI blog-draft GitHub Action.

## Protected functionality (verified after redesign)
- All routes & URLs unchanged; nav anchors `#work #approach #build #about #contact` kept.
- All dict content rendered verbatim — no invented metrics/clients/claims.
- Cal.com / mailto / LinkedIn / Malt links unchanged. Legal pages untouched.
- hreflang/canonical/LD untouched. Reduced-motion fully covered for all new animation.

## Design system (implemented)
- **Type scale:** hero `clamp(2.7rem,6.6vw,5.4rem)`; section h2 `.head-xl` `clamp(2.1rem,4.6vw,3.6rem)`; chapter h3 `clamp(1.7rem,3.4vw,2.6rem)`; outlined ghost numerals (`-webkit-text-stroke`) as editorial device.
- **Motion language:** masked h1 line rise; hero chaos-chips (CRM objects) dissolve into the record card = chaos→structure brand idea; SVG line-draw motifs (stroke-dashoffset) per case chapter; scaling timeline in approach; bar/waveform/pixel reveals in build panels. All CSS, driven by existing `.reveal` observer; no new JS, no animation library, no new dependencies.
- **Layouts:** full-viewport hero; full-width chapter rows (no cards) w/ 300px meta rail; 5-col flow with drawn line (vertical on mobile); services as editorial index rows; build = 4 crafted interface illustrations (aria-hidden, honest — no fake demos).

## Completed work
1. Homepage rebuilt (`Home.astro` + additive CSS block). Service/blog classes untouched.
2. Captured & reviewed: 1440/1280/768/390, sections work/approach/build/services, AR 1440 (hero + services), mobile approach/build.
3. Loop 2 fixes: LCP — h1 mask delay .15s→.05s (visible ~.8s), staggered delays tightened; ghost numeral stroke contrast raised (#39414e / #4a5464).

## Critique findings
- ~~P1 masked h1 delays LCP~~ → fixed (loop 2)
- ~~P1 ghost numerals too faint~~ → fixed (loop 2)
- P2 map-pin ping runs continuously (subtle; disabled under reduced motion) — accepted
- P2 caps stripe (pill tags) is the most conventional element left — candidate for ticker/marquee treatment later
- P3 chaos chips only ≥860px (hidden on mobile for space/perf) — intentional

## Verified
- Build: 27 pages, no errors. Console: no errors.
- AR RTL visually inspected: numerals/arrows/timeline mirror correctly; Arabic headings use IBM Plex Sans Arabic.
- Mobile: intentional layouts (vertical timeline, single-col chapters/panels, burger menu).
- Reduced motion: all new animation has static final-state overrides.
- No content invented; all copy from dictionaries.

## Rejected ideas
- Scroll-pinned sections (scroll-jacking risk, JS cost, INP)
- Animation framework (GSAP etc.) — unnecessary, CSS achieves direction
- Cal.com inline embed — GDPR/Datenschutz implications, separate decision
- Replacing record card — kept as the "trusted system" end-state of the hero metaphor

## Next iteration priorities
1. P1: visual regression pass on service pages / blog (shared CSS) — in progress
2. P2: propagate `.head-xl` scale to service-page section heads
3. P2: caps stripe → more editorial treatment
4. P3: keyboard/focus spot-check on new link rows (inherit global focus-visible)
