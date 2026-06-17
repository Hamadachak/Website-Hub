#!/usr/bin/env python3
"""
Weekly blog-draft generator.
Called by .github/workflows/blog-draft.yml.
Writes the post file and outputs metadata to $GITHUB_OUTPUT.
"""
import json
import os
import random
import re
import urllib.request
from datetime import datetime

API_KEY = os.environ["ANTHROPIC_API_KEY"]
TODAY = datetime.utcnow().strftime("%Y-%m-%d")

TOPIC_PROMPTS = [
    "HubSpot Lifecycle-Stages: Warum die meisten Setups scheitern und wie man es richtig macht",
    "RevOps für B2B-SaaS: Wie Marketing, Sales und Service wirklich zusammenarbeiten",
    "Datenmigration zu HubSpot: Die häufigsten Fehler und wie man sie vermeidet",
    "KI in CRM-Prozessen: Wo KI wirklich hilft und wo sie mehr schadet als nutzt",
    "HubSpot Reporting verlässlich machen: Ursachen und Lösung",
    "Custom HubSpot UI Extensions mit React: Wann lohnt sich der Aufwand?",
    "Lead-Scoring in HubSpot richtig aufsetzen",
    "HubSpot Marketing Hub für B2B: Was wirklich funktioniert",
    "Property-Hygiene in HubSpot: Wie man Feldchaos verhindert",
    "HubSpot Sales Hub für Startups: Worauf es beim Aufbau ankommt",
    "Churn-Prävention mit HubSpot: Signale erkennen bevor es zu spät ist",
    "Automation in HubSpot: Welche Workflows wirklich Wert liefern",
]

topic_hint = random.choice(TOPIC_PROMPTS)

PROMPT = f"""Du schreibst für die Website von Mohammad Chakrouf, Freelance Senior HubSpot Consultant aus Berlin.

Themen-Impuls für diesen Post: {topic_hint}

Schreibe einen deutschen Blog-Post (ca. 600 Wörter) zu HubSpot, CRM, RevOps oder KI für B2B-Unternehmen.
Schreibe direkt, praktisch, ohne Plattitüden. Zielgruppe: Ops-Teams, RevOps-Verantwortliche und Entscheider in B2B-Unternehmen im DACH-Raum.
Keine Einleitung mit "In diesem Artikel...", kein schlechter Marketing-Text, keine generischen Ratschläge.

Antworte NUR mit einem validen JSON-Objekt (keine Markdown-Code-Fences darum):
{{
  "titel": "Titel des Posts (max. 80 Zeichen, konkret und direkt)",
  "slug": "url-freundlicher-slug-auf-deutsch-ohne-sonderzeichen",
  "beschreibung": "Meta-Beschreibung in 1-2 Sätzen (max. 160 Zeichen)",
  "inhalt": "Vollständiger Markdown-Inhalt mit ## Überschriften und ggf. Listen"
}}"""

payload = json.dumps({
    "model": "claude-opus-4-8",
    "max_tokens": 2048,
    "messages": [{"role": "user", "content": PROMPT}],
}).encode()

req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=payload,
    headers={
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    },
)

with urllib.request.urlopen(req) as resp:
    api_result = json.loads(resp.read())

raw = api_result["content"][0]["text"].strip()

# Strip accidental markdown code fences
if raw.startswith("```"):
    raw = raw.split("\n", 1)[1]
    raw = raw.rsplit("```", 1)[0].strip()

post = json.loads(raw)

slug = post["slug"].strip().lower()
slug = re.sub(r"[^a-z0-9\-]", "-", slug)
slug = re.sub(r"-+", "-", slug).strip("-")

filename = f"src/content/blog/{slug}.md"

titel = post["titel"].replace('"', '\\"')
beschreibung = post["beschreibung"].replace('"', '\\"')

frontmatter = f"""---
title: "{titel}"
description: "{beschreibung}"
pubDate: {TODAY}
draft: true
---

"""

with open(filename, "w", encoding="utf-8") as f:
    f.write(frontmatter + post["inhalt"])

print(f"Generated: {filename}")

github_output = os.environ.get("GITHUB_OUTPUT", "")
if github_output:
    with open(github_output, "a", encoding="utf-8") as f:
        f.write(f"file={filename}\n")
        f.write(f"slug={slug}\n")
        # Multiline-safe format for titel
        f.write(f"titel<<POSTDELIM\n{post['titel']}\nPOSTDELIM\n")
