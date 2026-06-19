#!/usr/bin/env node
/**
 * Weekly blog-post generator for mohammad-chakrouf.de
 *
 * Steps:
 *   1. Fetch RSS feeds listed in scripts/feeds.json
 *   2. Ask Together AI (Llama-3.3-70B-Instruct-Turbo) to pick the best item and write a bilingual DE/EN post
 *   3. Generate a hero image via Together AI (FLUX.1-schnell-Free)
 *   4. Generate an SVG key-takeaways card in Node (no API)
 *   5. Write src/content/blog/<slug>.md + public/blog/{images,visuals}/
 *   6. Output slug + titel to $GITHUB_OUTPUT for the PR step
 *
 * One .md is the source of truth (German body + bodyEn frontmatter). The Astro
 * routes split it into two real pages: German at /blog/<slug>/ and English at
 * /en/blog/<slug>/ — no client-side toggle. A post only gets an English page
 * when bodyEn is present.
 *
 * Required env:  TOGETHER_API_KEY
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname }                                       from 'node:path';
import { fileURLToPath, pathToFileURL }                        from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const BLOG_DIR  = join(ROOT, 'src/content/blog');
const TODAY     = new Date().toISOString().slice(0, 10);

// ── Slug helpers + collision guard ───────────────────────────────────────────
// The blog uses Astro's glob loader, so a post's slug IS its filename (minus
// .md). We never want a generated draft to silently overwrite a published post,
// so we slugify deterministically and abort loudly on any collision.

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')   // any non-alphanumeric run → single dash
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Existing slugs = basenames of every .md already in the blog dir (lowercased).
export function existingSlugs(blogDir) {
  try {
    return readdirSync(blogDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, '').toLowerCase());
  } catch {
    return [];
  }
}

// Throws a clear, non-zero-producing error if the slug is already taken.
export function assertSlugAvailable(slug, blogDir) {
  if (existingSlugs(blogDir).includes(slug.toLowerCase())) {
    throw new Error(
      `Slug collision: "${slug}" already exists at src/content/blog/${slug}.md. ` +
      `Refusing to overwrite a published post — a human should pick a different ` +
      `topic or rename the draft. Nothing was written.`,
    );
  }
}

// Guard-then-write: never writes if the slug collides. Returns the file path.
export function writePostFile(blogDir, slug, contents) {
  assertSlugAvailable(slug, blogDir);
  const filePath = join(blogDir, `${slug}.md`);
  writeFileSync(filePath, contents, 'utf-8');
  return filePath;
}

// ── Topic relevance + source-URL dedup + freshest-unused selection ────────────

// On-topic keyword filter (matched against title + summary + feed name). Keeps
// the post focused on the positioning and screens out off-topic items that slip
// in from broader feeds. Trusted feeds (HubSpot/CRM/Sales) pass via their name.
const TOPIC_RE = /\b(hubspot|crm|revops|revenue operations|sales ops|sales operations|gtm|go-to-market|pipeline|lifecycle|lead|leads|marketing automation|workflow|deal|deals|contact|contacts|property|properties|segmentation|attribution|reporting|dashboard|salesforce|b2b|saas|onboarding|churn|retention|forecast|forecasting|automation|ai|artificial intelligence|llm|chatgpt|copilot|agent|agents|integration|api|sdk)\b/i;

export function isRelevant(item) {
  const hay = `${item.title || ''} ${item.description || ''} ${item.source || ''}`;
  return TOPIC_RE.test(hay);
}

// Normalize a URL for dedup comparison: drop protocol + leading www, lowercase
// host+path, strip the entire query string (incl. UTM params), hash, and any
// trailing slash. Two URLs that point at the same article compare equal.
export function normalizeUrl(u) {
  if (!u) return '';
  const s = String(u).trim();
  try {
    const url = new URL(s);
    const host = url.host.replace(/^www\./i, '');
    const path = url.pathname.replace(/\/+$/, '');
    return (host + path).toLowerCase();
  } catch {
    return s.toLowerCase()
      .replace(/[?#].*$/, '')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '');
  }
}

// Collect the normalized sourceUrl of every published post (front-matter scan).
export function publishedSourceUrls(blogDir) {
  const set = new Set();
  let files = [];
  try { files = readdirSync(blogDir).filter(f => f.endsWith('.md')); } catch { return set; }
  for (const f of files) {
    let txt = '';
    try { txt = readFileSync(join(blogDir, f), 'utf8'); } catch { continue; }
    const fm = txt.split(/\n---\s*(?:\n|$)/)[0];           // front-matter region
    const m  = fm.match(/^sourceUrl:\s*["']?([^"'\n]+?)["']?\s*$/m);
    if (m) set.add(normalizeUrl(m[1]));
  }
  return set;
}

function dateValue(d) {
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

// Pick the freshest candidate that is BOTH on-topic and not-yet-covered:
//   - passes the relevance filter
//   - its source URL is not already published
//   - its title-derived slug is not already taken (best-effort; the fail-loud
//     assertSlugAvailable guard remains the final backstop at write time)
// Returns the chosen item, or null when nothing fresh remains.
export function selectTopic(items, { publishedUrls = new Set(), slugs = [] } = {}) {
  const taken = slugs.map(s => s.toLowerCase());
  const pool = items
    .filter(isRelevant)
    .filter(it => !publishedUrls.has(normalizeUrl(it.link)))
    .filter(it => !taken.includes(slugify(it.title)))
    .sort((a, b) => dateValue(b.pubDate) - dateValue(a.pubDate));
  return pool[0] || null;
}

// ── RSS helpers ──────────────────────────────────────────────────────────────

async function fetchFeed({ name, url }) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12_000),
      headers: { 'User-Agent': 'chakrouf-blog-bot/1.0' },
    });
    if (!res.ok) { console.warn(`  ⚠ ${name}: HTTP ${res.status}`); return []; }
    const items = parseRSS(await res.text(), name).slice(0, 5);
    console.log(`  ✓ ${name}: ${items.length} item(s)`);
    return items;
  } catch (e) {
    console.warn(`  ⚠ ${name}: ${e.message}`);
    return [];
  }
}

function parseRSS(xml, source) {
  const items = [];
  const re = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b     = m[1];
    const title = grab(b, 'title');
    const link  = grab(b, 'link') || hrefOf(b, 'link');
    const desc  = grab(b, 'description') || grab(b, 'summary') || grab(b, 'content:encoded') || grab(b, 'content');
    const date  = grab(b, 'pubDate') || grab(b, 'published') || grab(b, 'updated');
    if (title && link) items.push({ title, link, description: dehtml(desc).slice(0, 400), pubDate: date, source });
  }
  return items;
}

function grab(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}
function hrefOf(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]+href="([^"]+)"`, 'i'));
  return m ? m[1] : '';
}
function dehtml(h) {
  return h
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

// ── Together AI chat (text generation) ──────────────────────────────────────

async function togetherChat(prompt, attempt = 0) {
  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (res.status === 503 && attempt < 3) {
    const wait = (attempt + 1) * 8_000;
    console.warn(`  ⚠ Together AI 503 — retrying in ${wait / 1000}s (attempt ${attempt + 1}/3)…`);
    await new Promise(r => setTimeout(r, wait));
    return togetherChat(prompt, attempt + 1);
  }
  if (!res.ok) throw new Error(`Together AI ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

// ── Together AI image generation (FLUX.1-schnell-Free) ───────────────────────

async function generateHeroImage(conceptPrompt, slug) {
  if (!process.env.TOGETHER_API_KEY) {
    console.warn('  ⚠ TOGETHER_API_KEY not set — skipping hero image');
    return null;
  }

  const fullPrompt =
    `${conceptPrompt}. ` +
    'Abstract, minimalist digital art. Dark navy blue background (#0C0E12). Amber/orange glowing ' +
    'accent light (#FF9A3C). Clean geometric shapes, flowing data-visualization lines. ' +
    'Professional B2B consulting aesthetic. No text, no people, no logos, no faces, no buildings.';

  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: fullPrompt,
      width: 1200,   // multiple of 16 (75×16)
      height: 624,   // multiple of 16 (39×16) — FLUX requires both dims % 16 == 0
      steps: 4,
      n: 1,
    }),
  });

  if (!res.ok) { console.warn(`  ⚠ Image gen failed (${res.status}): ${await res.text()}`); return null; }

  const data  = await res.json();
  const entry = data.data?.[0];
  if (!entry) { console.warn('  ⚠ No image entry in response'); return null; }

  let buf;
  if (entry.b64_json) {
    buf = Buffer.from(entry.b64_json, 'base64');
  } else if (entry.url) {
    const r = await fetch(entry.url);
    buf = Buffer.from(await r.arrayBuffer());
  } else {
    console.warn('  ⚠ Image response has neither b64_json nor url');
    return null;
  }

  const dir = join(ROOT, 'public/blog/images');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}-hero.png`), buf);
  console.log(`  ✓ Hero image → public/blog/images/${slug}-hero.png`);
  return `/blog/images/${slug}-hero.png`;
}

// ── SVG key-takeaways card (generated in Node, no API) ───────────────────────

function writeTakeawaysSVG(takeaways, slug) {
  const lines = takeaways.slice(0, 5).map(t => (t.length > 70 ? t.slice(0, 67) + '…' : t));
  const H     = 62 + lines.length * 50;
  const esc   = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const items = lines.map((t, i) => `
  <g transform="translate(0,${i * 50})">
    <circle cx="14" cy="20" r="5" fill="#FF9A3C"/>
    <text x="30" y="25" fill="#E8EAED"
      font-family="'Hanken Grotesk',system-ui,sans-serif"
      font-size="14" font-weight="500">${esc(t)}</text>
  </g>`).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="${H}" viewBox="0 0 700 ${H}">
  <rect width="700" height="${H}" rx="13" fill="#14171D" stroke="#262C36" stroke-width="1"/>
  <text x="24" y="30" fill="#FF9A3C"
    font-family="'JetBrains Mono',ui-monospace,monospace"
    font-size="10" letter-spacing="0.18em">// KEY TAKEAWAYS</text>
  <line x1="24" y1="40" x2="676" y2="40" stroke="#262C36" stroke-width="1"/>
  <g transform="translate(24,46)">${items}
  </g>
</svg>`;

  const dir = join(ROOT, 'public/blog/visuals');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}-takeaways.svg`), svg, 'utf-8');
  console.log(`  ✓ Takeaways SVG → public/blog/visuals/${slug}-takeaways.svg`);
  return `/blog/visuals/${slug}-takeaways.svg`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { feeds } = JSON.parse(readFileSync(join(__dirname, 'feeds.json'), 'utf-8'));

  console.log('\n📡 Fetching RSS feeds…');
  const allItems = (await Promise.all(feeds.map(fetchFeed))).flat();
  if (!allItems.length) throw new Error('No items fetched from any feed. Check feed URLs and network.');

  // ── Topic selection: on-topic + source-URL-unused + freshest ───────────────
  // Already-covered sources and already-used slugs are excluded up front, so a
  // run can never re-pick an article we've published. The deterministic pick is
  // the most recent remaining item.
  const publishedUrls = publishedSourceUrls(BLOG_DIR);
  const usedSlugs     = existingSlugs(BLOG_DIR);

  // Prefer items from the last 14 days; fall back to all relevant if none recent.
  const cutoff   = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const relevant = allItems.filter(isRelevant);
  const recent   = relevant.filter(({ pubDate }) => {
    if (!pubDate) return true;
    const d = new Date(pubDate);
    return isNaN(d.getTime()) || d.getTime() > cutoff;
  });
  const pool   = recent.length ? recent : relevant;
  const chosen = selectTopic(pool, { publishedUrls, slugs: usedSlugs });

  if (!chosen) {
    console.log(
      '\n✅ No fresh topics: every on-topic candidate is already covered ' +
      '(source URL or slug) or nothing relevant was found. ' +
      'Exiting cleanly without opening a PR.',
    );
    return;
  }

  console.log(`\n🎯 Selected (freshest unused): "${chosen.title}"  [${chosen.source}]`);
  console.log(`   ${chosen.link}`);

  // Two model calls:
  //   1. Metadata as JSON (short strings only — avoids control-char parse errors)
  //   2. Body text as plain delimited sections (no JSON wrapping)
  // sourceUrl/sourceTitle are set from `chosen` (not the model) so future
  // dedup matches exactly what we covered.

  const metaRaw = await togetherChat(`\
You write for Mohammad Chakrouf — Freelance Senior HubSpot Consultant in Berlin.
Audience: B2B Ops teams, RevOps managers, SaaS decision-makers in the DACH region.

Write metadata for a bilingual (DE/EN) blog post based on THIS source article:
Source: ${chosen.source}
Title: ${chosen.title}
URL: ${chosen.link}
Summary: ${chosen.description || '(none)'}

Return ONLY this JSON object (no markdown fences, no extra text, short strings only — NO body content here):
{
  "slug": "german-slug-no-umlauts-max-60-chars",
  "titleDe": "German title max 80 chars",
  "titleEn": "English title max 80 chars",
  "descriptionDe": "German meta description max 160 chars",
  "descriptionEn": "English meta description max 160 chars",
  "heroImagePrompt": "Visual concept for abstract hero: shapes, light, metaphor. No people, text, logos.",
  "takeawaysDe": ["3-5 key points in German each max 70 chars"],
  "takeawaysEn": ["3-5 key points in English each max 70 chars"]
}`);

  const metaText = metaRaw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const meta = JSON.parse(metaText);

  const bodyRaw = await togetherChat(`\
You write for Mohammad Chakrouf — Freelance Senior HubSpot Consultant in Berlin.
Audience: B2B Ops teams, RevOps managers, SaaS decision-makers in the DACH region.

Write a bilingual blog post based on this source:
Title: ${chosen.title}
URL: ${chosen.link}
Summary: ${chosen.description}

Post metadata already decided:
- German title: ${meta.titleDe}
- English title: ${meta.titleEn}

Write ~600 words per language. Direct, practical, consultant perspective. Hedge if unsure — do not invent.

Respond with EXACTLY this structure (keep the delimiter lines verbatim):
===DE_BODY===
[Complete German markdown body here]
===EN_BODY===
[Complete English markdown body here]
===END===`);

  // Parse body sections
  const deMatch = bodyRaw.match(/===DE_BODY===\n([\s\S]*?)\n===EN_BODY===/);
  const enMatch = bodyRaw.match(/===EN_BODY===\n([\s\S]*?)\n===END===/);
  const bodyDe  = deMatch?.[1]?.trim() ?? '';
  const bodyEn  = enMatch?.[1]?.trim() ?? '';

  if (!bodyDe) throw new Error('Could not parse German body from model response');

  const slug = slugify(meta.slug || meta.titleDe);
  if (!slug) throw new Error('Could not derive a slug from the model response');

  console.log(`\n📝 Post: "${meta.titleDe}"`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Source: ${meta.sourceUrl}`);

  // Collision guard — abort BEFORE generating/writing any visuals so a colliding
  // run leaves nothing on disk and produces a non-zero exit (fails CI, no PR).
  assertSlugAvailable(slug, BLOG_DIR);

  console.log('\n🎨 Generating visuals…');
  const [heroImage, takeawaysSvg] = await Promise.all([
    generateHeroImage(meta.heroImagePrompt, slug),
    Promise.resolve(writeTakeawaysSVG(meta.takeawaysDe, slug)),
  ]);

  // Build frontmatter — bodyEn as YAML literal block scalar
  const q           = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const blockScalar = bodyEn.split('\n').map(l => '  ' + l).join('\n');

  const fmLines = [
    '---',
    `title: "${q(meta.titleDe)}"`,
    `titleEn: "${q(meta.titleEn)}"`,
    `description: "${q(meta.descriptionDe)}"`,
    `descriptionEn: "${q(meta.descriptionEn)}"`,
    `pubDate: ${TODAY}`,
    `draft: true`,
    heroImage ? `heroImage: "${heroImage}"` : null,
    `visuals:\n  - "${takeawaysSvg}"`,
    `sourceTitle: "${q(chosen.title || '')}"`,
    `sourceUrl: "${q(chosen.link || '')}"`,
    `bodyEn: |\n${blockScalar}`,
    '---',
  ].filter(Boolean);

  // writePostFile re-checks the guard, so we never overwrite even if a post with
  // this slug appeared between the early check and now.
  writePostFile(BLOG_DIR, slug, fmLines.join('\n') + '\n\n' + bodyDe + '\n');
  console.log(`\n✅ Written: src/content/blog/${slug}.md`);

  // Write GitHub Actions outputs
  if (process.env.GITHUB_OUTPUT) {
    const out = [
      `file=src/content/blog/${slug}.md`,
      `slug=${slug}`,
      `titel<<POSTDELIM`,
      meta.titleDe,
      `POSTDELIM`,
      '',
    ].join('\n');
    writeFileSync(process.env.GITHUB_OUTPUT, out, { flag: 'a', encoding: 'utf-8' });
  }
}

// Only run the pipeline when executed directly (not when imported by tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error('\n❌ Fatal:', e.message); process.exit(1); });
}
