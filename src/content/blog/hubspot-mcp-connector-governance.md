---
title: "Wer darf eure CRM-Daten anzapfen? MCP und KI-Connector-Governance in HubSpot"
titleEn: "Who gets to tap your CRM data? MCP and AI-connector governance in HubSpot"
description: "Der HubSpot MCP Server ist GA, dazu Governance-Tools in Public Beta. Warum KI-Connectoren eine Daten-Governance-Frage für RevOps sind — und worauf ihr achten solltet."
descriptionEn: "The HubSpot MCP Server is GA, with governance tools in public beta. Why AI connectors are a data-governance question for RevOps — and what to watch."
pubDate: 2026-06-19
draft: true
sourceTitle: "HubSpot Spring 2026 Spotlight — Developer Changelog"
sourceUrl: "https://developers.hubspot.com/changelog/spring-2026-spotlight"
bodyEn: |
  Most of the [Spring 2026 Spotlight](https://www.hubspot.com/company-news/spring-2026-spotlight) coverage went to AI agents. The quieter, more consequential part for RevOps is in the [developer changelog](https://developers.hubspot.com/changelog/spring-2026-spotlight): AI agents can now read and write your CRM data through a standard protocol — and the tools to govern that access are still in beta. That ordering matters.

  A note up front: availability and scope depend on hub and tier, and beta features change. Verify in your own account.

  ## What shipped
  - **HubSpot MCP Server (remote)** is now **generally available (GA)**. It gives agents read access to campaigns, landing pages, website pages and blog posts, and **write access to CRM objects** ([HubSpot Developer Changelog](https://developers.hubspot.com/changelog/spring-2026-spotlight)).
  - **MCP Auth Apps** — a self-service tool for building AI connectors to the MCP Server with OAuth 2.1 credential management — is in **public beta**.
  - **App Install Governance Tool** — admin controls for approving apps, managing user access and customizing data permissions, including AI connectors — is in **public beta**.

  ## Why it matters for RevOps
  "MCP" sounds like a developer topic. It isn't, the moment an agent can write to your deals, contacts and companies. Then "who connected which AI tool, with what scopes, to which objects?" becomes a data-governance question — and data governance is squarely RevOps territory. This is exactly where the next wave of CRM chaos comes from: not a bad import, but three different AI connectors quietly writing to the same fields with no owner and no policy.

  The uncomfortable detail is the sequencing: the write-capable server is GA, while the tools to govern installs and connector auth are still public beta. So the capability to create mess is fully available before the guardrails are finished.

  ## What to watch
  - **Write your policy now, not after.** Decide which AI connectors are allowed, who approves them, and which objects/fields they may write — before someone connects one "just to try."
  - **Treat beta as beta.** MCP Auth Apps and the App Install Governance Tool can change; pilot them, don't bet a compliance process on their current shape.
  - **Audit scopes, not just installs.** Read access to content is low-risk; write access to CRM objects is not. Review what each connector can actually change.

  ## My take
  This is genuinely useful — a standard way to let AI act on CRM data is overdue. But it shifts work onto RevOps: you now own a connector inventory and an approval policy the same way you own properties and lifecycle stages. Set that up while you have two connectors, not twenty. The teams that treat AI-connector governance as part of their data model will avoid a cleanup project later.

  If you want help defining a connector-governance policy that fits your account, [let's talk for 30 minutes](https://cal.com/mohammad-chakrouf-sp9k7e/hubspot-erstgesprach). Related: [RevOps for Startups](/en/leistungen/revops-fuer-startups/) and [HubSpot Migration](/en/leistungen/hubspot-migration/).

  ---

  *HubSpot is a trademark of HubSpot, Inc. This post is independent and is not sponsored or endorsed by HubSpot; I am not a certified HubSpot partner. As of June 19, 2026. Availability and beta status can change and vary by hub and tier — check the linked HubSpot source.*
---

Der Großteil der Berichterstattung zum [Spring 2026 Spotlight](https://www.hubspot.com/company-news/spring-2026-spotlight) ging an die KI-Agenten. Der leisere, für RevOps folgenreichere Teil steckt im [Developer Changelog](https://developers.hubspot.com/changelog/spring-2026-spotlight): KI-Agenten können eure CRM-Daten jetzt über ein Standardprotokoll lesen und schreiben — und die Werkzeuge, um diesen Zugriff zu steuern, sind noch Beta. Diese Reihenfolge ist das Thema.

Hinweis vorab: Verfügbarkeit und Funktionsumfang hängen vom Hub und Tier ab, Beta-Funktionen ändern sich. Prüft es im eigenen Account.

## Was ausgeliefert wurde
- **HubSpot MCP Server (remote)** ist jetzt **allgemein verfügbar (GA)**. Er gibt Agenten Lese-Zugriff auf Kampagnen, Landing Pages, Website-Seiten und Blogposts sowie **Schreib-Zugriff auf CRM-Objekte** ([HubSpot Developer Changelog](https://developers.hubspot.com/changelog/spring-2026-spotlight)).
- **MCP Auth Apps** — ein Self-Service-Werkzeug, um KI-Connectoren mit OAuth-2.1-Verwaltung an den MCP Server anzubinden — ist in **Public Beta**.
- **App Install Governance Tool** — Admin-Steuerung für App-Freigaben, Nutzerzugriff und anpassbare Datenrechte, inklusive KI-Connectoren — ist in **Public Beta**.

## Warum es für RevOps zählt
„MCP" klingt nach einem Entwicklerthema. Ist es nicht — in dem Moment, in dem ein Agent in eure Deals, Kontakte und Unternehmen schreiben darf. Dann wird „wer hat welches KI-Tool mit welchen Scopes an welche Objekte angebunden?" zur Daten-Governance-Frage — und Daten-Governance ist klar RevOps-Gebiet. Genau hier entsteht die nächste Welle an CRM-Chaos: nicht ein schlechter Import, sondern drei verschiedene KI-Connectoren, die still in dieselben Felder schreiben, ohne Owner und ohne Richtlinie.

Das unbequeme Detail ist die Reihenfolge: Der schreibfähige Server ist GA, während die Werkzeuge zur Steuerung von Installationen und Connector-Auth noch Public Beta sind. Die Fähigkeit, Chaos zu erzeugen, ist also voll verfügbar, bevor die Leitplanken fertig sind.

## Worauf achten
- **Schreibt eure Richtlinie jetzt, nicht später.** Legt fest, welche KI-Connectoren erlaubt sind, wer sie freigibt und in welche Objekte/Felder sie schreiben dürfen — bevor jemand einen „nur zum Ausprobieren" anbindet.
- **Behandelt Beta als Beta.** MCP Auth Apps und das App Install Governance Tool können sich ändern; pilotiert sie, baut aber keinen Compliance-Prozess auf ihrem heutigen Stand auf.
- **Prüft Scopes, nicht nur Installationen.** Lese-Zugriff auf Inhalte ist risikoarm; Schreib-Zugriff auf CRM-Objekte nicht. Prüft, was jeder Connector tatsächlich ändern kann.

## Meine Einschätzung
Das ist echt nützlich — ein Standardweg, KI auf CRM-Daten handeln zu lassen, ist überfällig. Aber es verlagert Arbeit auf RevOps: Ihr besitzt jetzt ein Connector-Inventar und eine Freigabe-Richtlinie, genauso wie ihr Properties und Lifecycle-Stages besitzt. Richtet das ein, solange ihr zwei Connectoren habt, nicht zwanzig. Teams, die KI-Connector-Governance als Teil ihres Datenmodells behandeln, ersparen sich später ein Aufräumprojekt.

Wenn ihr Hilfe braucht, eine Connector-Governance-Richtlinie für euren Account zu definieren, [lasst uns 30 Minuten sprechen](https://cal.com/mohammad-chakrouf-sp9k7e/hubspot-erstgesprach). Passend dazu: [RevOps für Startups](/leistungen/revops-fuer-startups/) und [HubSpot-Migration](/leistungen/hubspot-migration/).

---

*HubSpot ist eine Marke der HubSpot, Inc. Dieser Beitrag ist unabhängig und wird nicht von HubSpot gesponsert oder unterstützt; ich bin kein zertifizierter HubSpot-Partner. Stand: 19. Juni 2026. Verfügbarkeit und Beta-Status können sich ändern und variieren je nach Hub und Tier — prüft die verlinkte HubSpot-Quelle.*
