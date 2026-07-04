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

## Loop 3 — strict critique pass (complete)
Findings & resolutions:
- **P1 offer section = banned cliché** (rounded card + gradient + pill badge) → rebuilt as editorial statement block (`.offer-ed`): giant display questions (second muted), mono meta line, no container. FIXED
- **P1 caps stripe = generic pill chips** → editorial marquee ticker: borderless mono uppercase, amber slash separators, slow CSS scroll, hover-pause, RTL-reversed direction, reduced-motion → static wrapped row (duplicate set hidden). FIXED
- **P1 repetitive chapter rhythm** (meta rail always left) → even chapters mirror (meta right, end-aligned); reset on mobile. FIXED
- **P1 mobile hero lost the chaos→structure story** (chips hidden) → 4-chip reduced set repositioned around the record card on ≤860px. FIXED
- **P1 contact heading too safe** → scale raised to clamp(2.2rem,6vw,4.6rem). FIXED
- **P2 build grid symmetric 2×2** → asymmetric 12-col spans (7/5, 5/7). FIXED
- **P2 mobile chips grazed the status line** → top offsets nudged. FIXED
- P3 remaining: service-page section heads still at base `.head` scale (consistent, not wrong); consider `.head-xl` propagation next loop.

## Verified (loop 3)
- Rebuild green; ticker/offer/chapters/build/contact/mobile re-captured and reviewed at 1440 + 390.
- Verification pending on preview: AR ticker direction (RTL keyframes), reduced-motion ticker wrap.

## Loop 4 — final art direction & polish (complete)
- **Motion choreography:** single easing token `--ease` now drives reveal system, chips, panels — one motion voice sitewide.
- **Typography:** `text-wrap:balance` on all display headings (h1, section h2, chapter h3, offer questions, contact, service rows) — no more orphaned last words; art-directed breaks without hardcoding locale-specific `<br>`.
- **Hero legibility of the transformation:** chips previously settled in place and faded (absorption unreadable). Now each chip visibly converges toward the record card (`--tx/--ty` final translate) and scales down as it's absorbed. Chaos → record is now literal.
- **Chapter identity:** 01 keeps converging line-draw; 02's structure nodes climb step-by-step (staggered transition delays); 03's ring is dashed and slowly rotates (dashoffset animation) — rotation logic made visible. Same system, three behaviors.
- **Build credibility:** each scene gained interface chrome (`crm_record · company / ui_extension`, `activity · voice_note / recorder`, …) so panels read as real HubSpot UI-extension surfaces, not decoration. No functionality invented — labels are generic object/surface names.
- Verified: build green, no console errors, 1440/1280/768/390 re-captured, reduced-motion overrides extended to the new ring animation.

## Loop 5 — site-wide propagation (complete)
- Service pages: `.head-xl` display scale on all section heads (deferred P2 resolved); capability pills replaced with the editorial ticker (de/en/ar, RTL direction verified).
- Blog listing: card grid replaced with editorial index rows (date · title · description · arrow), matching the services index; h1 raised to display scale. Mobile stacks date above title.
- Article pages: deliberately unchanged beyond global balanced-heading wrapping — long-form reading stays calm (per brief).
- Global: `text-wrap:balance` on all h1/h2/h3.
- **Related articles (P3, documented not implemented):** blog frontmatter has no tags/categories/topic taxonomy; any "related" logic would be word-matching guesswork. Requires adding a `topics:` field to the schema + backfilling posts first — noted as future work, no weak recommendations shipped.
- QA: build green (27 pages), zero console errors on service/blog/article/AR routes, zero broken internal refs, RTL visually verified.

## Loop 6 — Build section: engineering archive (complete)
- Six numbered builds (BUILD_01–06) as alternating full-width ledger rows — no card grid.
- New concepts: Deal Intelligence (qualification checklist resolving into risk assessment), Buying Committee Map (stakeholder relationship SVG with dashed missing-EB node + warning), Account Intelligence (signal chips resolving into an account brief).
- Kept/repositioned: Company Health Score (+trend, attention flag), Voice Notes (input-friction value), Property Intelligence (location context without leaving HubSpot).
- Honest status system: INTERNAL BUILD (amber chip) for the three tools presented as built; PROTOTYPE · UI EXTENSION for the three concepts; GIF Generator demoted to LAB_01 · EXPERIMENTAL strip (dashed border). No client names, metrics, results or deployments claimed anywhere.
- Each viz has a distinct structure + motion (bars/trend, staggered checklist, line-drawn map, waveform, map grid, signals→brief); all CSS, reveal-driven, reduced-motion covered, RTL verified.
- Copy (problem + value per build) localized de/en/ar via new `build.items` dict shape.

## Remaining (accepted) issues
- P2: service-page section heads still at base scale — intentionally deferred until homepage direction is approved
- P3: footer untouched (functional, consistent, but plain)
- P3: chips can transiently overlap record rows mid-flight (reads as absorption; aria-hidden)
- P3: blog has no related-articles block (only related services)

## Intentionally NOT changed (loop 4)
- Overall concept, palette, section order, copy — direction approved, no re-design
- Offer/contact CTAs both booking-focused (conversion redundancy is deliberate)
- Record card composition (signature element)
- No parallax/pinning added — INP/scroll-jacking risk not worth it
