# mohammad-chakrouf.de

Your portfolio + blog, built with [Astro](https://astro.build). Fast, SEO-ready, and easy to extend — adding a blog post is just adding a Markdown file.

## Run it locally

```bash
npm install     # first time only
npm run dev      # start dev server → http://localhost:4321
```

Other commands:

```bash
npm run build    # build the production site into dist/
npm run preview  # preview the production build locally
```

## What's inside

```
src/
  pages/
    index.astro            # your homepage (ported from the original design)
    blog/
      index.astro          # the blog listing page  → /blog
      [...slug].astro      # renders an individual post
  content/
    blog/
      sauberes-reporting.md  # sample post (German). Copy this to add more.
  layouts/Base.astro       # shared shell: <head>, nav, footer
  components/BaseHead.astro # all SEO: title, description, canonical, Open Graph, JSON-LD
  styles/global.css        # all styling (your original CSS + article "prose" styles)
  content.config.ts        # blog post schema (title, description, pubDate, draft)
public/
  favicon.svg              # browser-tab icon
  og.png                   # social-share preview image
  robots.txt               # points search engines to the sitemap
```

The sitemap (`/sitemap-index.xml`) is generated automatically on every build.

## Add a blog post

Create a new file in `src/content/blog/`, e.g. `mein-thema.md`:

```markdown
---
title: "Dein Titel"
description: "Ein bis zwei Sätze für Suchergebnisse und Vorschau."
pubDate: 2026-06-20
draft: false          # set true to keep it hidden / as a draft
---

Dein Inhalt in **Markdown**.

## Eine Zwischenüberschrift

Text, Listen, Links — alles ganz normal.
```

Save it, and it appears on `/blog` automatically. Set `draft: true` while you're still working on it.

## Next steps (we're doing these together)

1. ✅ Astro foundation (this).
2. ⬜ Push to GitHub + connect Netlify so every push auto-deploys.
3. ⬜ Service landing pages (HubSpot-Migration, RevOps für Startups, …) + Impressum & Datenschutz.
4. ⬜ Automation: a scheduled job drafts a post → opens a Pull Request → you approve → it publishes.
