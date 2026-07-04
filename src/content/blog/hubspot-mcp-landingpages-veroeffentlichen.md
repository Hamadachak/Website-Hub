---
title: "KI-Agenten können jetzt Landingpages veröffentlichen — worauf RevOps achten sollte"
titleEn: "AI agents can now publish landing pages — what RevOps should watch"
description: "Der HubSpot MCP Server kann jetzt Content-Analytics lesen und Landingpages erstellen, bearbeiten und veröffentlichen. Warum das die Governance-Frage von CRM-Daten auf veröffentlichte Inhalte ausweitet."
descriptionEn: "The HubSpot MCP Server can now read content analytics and create, edit and publish landing pages. Why that extends the governance question from CRM data to published content."
pubDate: 2026-07-02
draft: false
sourceTitle: "HubSpot Developer Changelog — Developer updates for June 2026"
sourceUrl: "https://developers.hubspot.com/changelog/june-2026-rollup"
bodyEn: |
  A few weeks ago the story was: AI agents can now write to your CRM objects through the [MCP Server](/en/blog/hubspot-mcp-connector-governance/). The [June 2026 developer rollup](https://developers.hubspot.com/changelog/june-2026-rollup) quietly moves the line further — agents can now also generate, edit and **publish landing pages**, and read content analytics. Writing data was one thing. Publishing pages to your live site is another.

  A note up front: availability and scope depend on hub and tier, and features change. Verify in your own account.

  ## What shipped
  - **Landing page creation in the remote MCP Server** is now live. AI assistants can generate, edit and **publish** landing pages, including copy changes and form management ([HubSpot Developer Changelog](https://developers.hubspot.com/changelog/june-2026-rollup)).
  - **Content analytics in the MCP Server** now covers standalone web assets — not just campaign-linked pages — including views, form submissions, bounce rates and traffic sources.
  - **CLI improvements**: centralized authentication via `hs account` commands, and a new `hs app logs` command to pull serverless-function, webhook and API-call logs straight into the terminal.

  ## Why it matters for RevOps
  With CRM write access, a bad agent action shows up as a wrong field on a record — annoying, but internal and reversible. With publish access, a bad agent action is a live page on your domain: wrong pricing, an off-brand headline, a form wired to the wrong list. The blast radius moved from "internal data" to "public-facing content and lead capture."

  And it closes a loop that's easy to miss: the same agent can now read content analytics *and* publish pages. That's the raw material for an autonomous optimization loop — read bounce rate, rewrite the page, publish, repeat — running against your live site with no human in the diff.

  ## What to watch
  - **Decide who — or what — may publish.** Treat "publish to live" as a separate, higher permission than "read" or "draft." An agent that can suggest a page is very different from one that can push it live.
  - **Keep a human in the publish step.** Let agents draft and edit freely; require a person to approve the go-live. A review gate here costs minutes and prevents a public mistake.
  - **Watch the forms, not just the copy.** Form management means an agent can change where leads land. A page that looks fine can still route submissions into the wrong list or owner — check the plumbing, not only the words.
  - **Extend your connector inventory to content.** If you started a connector-governance policy for CRM writes, add content scopes to it now. Same policy, wider surface.

  ## My take
  This is a natural and useful step — drafting landing-page variants is exactly the kind of work AI is good at. But "publish" is the word that changes the risk profile. Reading and drafting are safe to hand off broadly; publishing to your live site is not, at least not yet. The teams that stay out of trouble will let agents do the 90% — research, copy, layout — and keep a human on the last click. Set that boundary while agent-published pages are a novelty, not a habit.

  If you want help defining where agents may act in your HubSpot — and where a human stays in the loop — [let's talk for 30 minutes](https://cal.com/mohammad-chakrouf-sp9k7e/hubspot-erstgesprach). Related: [RevOps for Startups](/en/leistungen/revops-fuer-startups/) and [HubSpot for B2B SaaS](/en/leistungen/hubspot-fuer-b2b-saas/).

  ---

  *HubSpot is a trademark of HubSpot, Inc. This post is independent and is not sponsored or endorsed by HubSpot; I am not a certified HubSpot partner. As of July 2, 2026. Availability can change and vary by hub and tier — check the linked HubSpot source.*
---

Vor ein paar Wochen lautete die Geschichte: KI-Agenten können jetzt über den [MCP Server](/blog/hubspot-mcp-connector-governance/) in eure CRM-Objekte schreiben. Der [Developer-Rollup für Juni 2026](https://developers.hubspot.com/changelog/june-2026-rollup) verschiebt die Linie still ein Stück weiter — Agenten können jetzt auch Landingpages erstellen, bearbeiten und **veröffentlichen** sowie Content-Analytics lesen. Daten schreiben war das eine. Seiten auf eurer Live-Website veröffentlichen ist etwas anderes.

Hinweis vorab: Verfügbarkeit und Funktionsumfang hängen vom Hub und Tier ab, Funktionen ändern sich. Prüft es im eigenen Account.

## Was ausgeliefert wurde
- **Landingpage-Erstellung im Remote MCP Server** ist jetzt live. KI-Assistenten können Landingpages generieren, bearbeiten und **veröffentlichen**, inklusive Text-Änderungen und Formular-Verwaltung ([HubSpot Developer Changelog](https://developers.hubspot.com/changelog/june-2026-rollup)).
- **Content-Analytics im MCP Server** deckt jetzt eigenständige Web-Assets ab — nicht nur kampagnengebundene Seiten — inklusive Views, Formular-Einsendungen, Bounce-Rates und Traffic-Quellen.
- **CLI-Verbesserungen**: zentrale Authentifizierung über `hs account`-Befehle sowie ein neuer `hs app logs`-Befehl, um Logs von Serverless-Funktionen, Webhooks und API-Calls direkt ins Terminal zu holen.

## Warum es für RevOps zählt
Mit CRM-Schreibzugriff zeigt sich eine falsche Agenten-Aktion als falsches Feld in einem Datensatz — ärgerlich, aber intern und rückgängig zu machen. Mit Veröffentlichungs-Zugriff ist eine falsche Agenten-Aktion eine Live-Seite auf eurer Domain: falscher Preis, eine Headline, die nicht zur Marke passt, ein Formular, das an die falsche Liste hängt. Der Wirkradius ist von „internen Daten" zu „öffentlichem Content und Lead-Erfassung" gewandert.

Und es schließt einen Kreis, den man leicht übersieht: Derselbe Agent kann jetzt Content-Analytics lesen *und* Seiten veröffentlichen. Das ist das Rohmaterial für eine autonome Optimierungs-Schleife — Bounce-Rate lesen, Seite umschreiben, veröffentlichen, wiederholen — die gegen eure Live-Website läuft, ohne dass ein Mensch je den Unterschied sieht.

## Worauf achten
- **Entscheidet, wer — oder was — veröffentlichen darf.** Behandelt „live veröffentlichen" als eigenes, höheres Recht als „lesen" oder „Entwurf". Ein Agent, der eine Seite vorschlagen darf, ist etwas ganz anderes als einer, der sie live schalten darf.
- **Haltet einen Menschen im Veröffentlichungs-Schritt.** Lasst Agenten frei entwerfen und bearbeiten; verlangt eine menschliche Freigabe fürs Go-live. Ein Review-Gate kostet hier Minuten und verhindert einen öffentlichen Fehler.
- **Achtet auf die Formulare, nicht nur den Text.** Formular-Verwaltung heißt, ein Agent kann ändern, wo Leads landen. Eine Seite, die gut aussieht, kann Einsendungen trotzdem in die falsche Liste oder zum falschen Owner leiten — prüft die Verkabelung, nicht nur die Worte.
- **Weitet euer Connector-Inventar auf Content aus.** Wenn ihr eine Connector-Governance-Richtlinie für CRM-Schreibzugriffe begonnen habt, nehmt Content-Scopes jetzt mit auf. Gleiche Richtlinie, größere Fläche.

## Meine Einschätzung
Das ist ein natürlicher und nützlicher Schritt — Landingpage-Varianten zu entwerfen ist genau die Art Arbeit, in der KI gut ist. Aber „veröffentlichen" ist das Wort, das das Risikoprofil ändert. Lesen und Entwerfen kann man breit abgeben; das Veröffentlichen auf der Live-Website nicht, zumindest noch nicht. Die Teams, die nicht in Schwierigkeiten geraten, lassen Agenten die 90 % machen — Recherche, Text, Layout — und behalten einen Menschen am letzten Klick. Zieht diese Grenze, solange von Agenten veröffentlichte Seiten eine Neuheit sind, keine Gewohnheit.

Wenn ihr Hilfe braucht, festzulegen, wo Agenten in eurem HubSpot handeln dürfen — und wo ein Mensch in der Schleife bleibt — [lasst uns 30 Minuten sprechen](https://cal.com/mohammad-chakrouf-sp9k7e/hubspot-erstgesprach). Passend dazu: [RevOps für Startups](/leistungen/revops-fuer-startups/) und [HubSpot für B2B-SaaS](/leistungen/hubspot-fuer-b2b-saas/).

---

*HubSpot ist eine Marke der HubSpot, Inc. Dieser Beitrag ist unabhängig und wird nicht von HubSpot gesponsert oder unterstützt; ich bin kein zertifizierter HubSpot-Partner. Stand: 2. Juli 2026. Verfügbarkeit kann sich ändern und variiert je nach Hub und Tier — prüft die verlinkte HubSpot-Quelle.*
