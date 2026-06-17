#!/usr/bin/env node
/**
 * Weekly blog-post generator for mohammad-chakrouf.de
 *
 * Steps:
 *   1. Fetch RSS feeds listed in scripts/feeds.json
 *   2. Ask Together AI (Llama-3.3-70B-Free) to pick the best item and write a bilingual DE/EN post
 *   3. Generate a hero image via Together AI (FLUX.1-schnell-Free)
 *   4. Generate an SVG key-takeaways card in Node (no API)
 *   5. Write src/content/blog/<slug>.md + public/blog/{images,visuals}/
 *   6. Output slug + titel to $GITHUB_OUTPUT for the PR step
 *
 * Required env:  TOGETHER_API_KEY
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname }                           from 'node:path';
import { fileURLToPath }                           from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const TODAY     = new Date().toISOString().slice(0, 10);

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

async function togetherChat(prompt) {
  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
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
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: fullPrompt,
      width: 1200,
      height: 630,
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

  // Prefer items from the last 14 days; fall back to all if nothing recent
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recent = allItems.filter(({ pubDate }) => {
    if (!pubDate) return true;
    const d = new Date(pubDate);
    return isNaN(d.getTime()) || d.getTime() > cutoff;
  });
  const candidates = (recent.length ? recent : allItems).slice(0, 20);

  console.log(`\n✍  Sending ${candidates.length} items to Together AI (Llama-3.1-8B-Turbo)…`);

  const raw = await togetherChat(`\
You write for Mohammad Chakrouf — Freelance Senior HubSpot Consultant in Berlin.
Audience: B2B Ops teams, RevOps managers, SaaS decision-makers in the DACH region.
Language: German is primary (and must be thorough); English is secondary.

Recent items from HubSpot, AI, CRM, and RevOps sources:

${candidates.map((it, i) =>
  `[${i + 1}] ${it.source}\nTitle: ${it.title}\nURL: ${it.link}\nDate: ${it.pubDate || 'unknown'}\nSummary: ${it.description || '(none)'}`
).join('\n\n---\n\n')}

Choose the SINGLE most relevant and timely item for this audience.
Prefer: HubSpot product updates, AI in CRM, RevOps strategy, B2B SaaS operations.
Write ~600 words per language. Add a clear consultant perspective and practical takeaways.
If any fact is uncertain, hedge — do NOT invent specifics.

Return ONLY a single valid JSON object (no markdown fences, no commentary):
{
  "slug": "german-slug-no-special-chars-no-umlauts-max-60-chars",
  "titleDe": "German title (≤80 chars)",
  "titleEn": "English title (≤80 chars)",
  "descriptionDe": "German meta description (≤160 chars)",
  "descriptionEn": "English meta description (≤160 chars)",
  "heroImagePrompt": "Specific visual concept for an abstract hero image — what shapes, textures, metaphors fit this topic? No people, no text, no logos.",
  "takeawaysDe": ["3–5 key points in German, each ≤70 chars"],
  "takeawaysEn": ["3–5 key points in English, each ≤70 chars"],
  "bodyDe": "Complete German markdown body",
  "bodyEn": "Complete English markdown body",
  "sourceTitle": "Exact title of the chosen article",
  "sourceUrl": "Exact URL of the chosen article"
}`);

  // Strip accidental code fences
  const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const post = JSON.parse(text);

  const slug = post.slug
    .toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  console.log(`\n📝 Post: "${post.titleDe}"`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Source: ${post.sourceUrl}`);

  console.log('\n🎨 Generating visuals…');
  const [heroImage, takeawaysSvg] = await Promise.all([
    generateHeroImage(post.heroImagePrompt, slug),
    Promise.resolve(writeTakeawaysSVG(post.takeawaysDe, slug)),
  ]);

  // Build frontmatter — bodyEn as YAML literal block scalar (no quoting issues)
  const q          = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const blockScalar = post.bodyEn.split('\n').map(l => '  ' + l).join('\n');

  const lines = [
    '---',
    `title: "${q(post.titleDe)}"`,
    `titleEn: "${q(post.titleEn)}"`,
    `description: "${q(post.descriptionDe)}"`,
    `descriptionEn: "${q(post.descriptionEn)}"`,
    `pubDate: ${TODAY}`,
    `draft: true`,
    heroImage ? `heroImage: "${heroImage}"` : null,
    `visuals:\n  - "${takeawaysSvg}"`,
    `sourceTitle: "${q(post.sourceTitle || '')}"`,
    `sourceUrl: "${q(post.sourceUrl || '')}"`,
    `bodyEn: |\n${blockScalar}`,
    '---',
  ].filter(Boolean);

  const filePath = join(ROOT, `src/content/blog/${slug}.md`);
  writeFileSync(filePath, lines.join('\n') + '\n\n' + post.bodyDe + '\n', 'utf-8');
  console.log(`\n✅ Written: src/content/blog/${slug}.md`);

  // Write GitHub Actions outputs
  if (process.env.GITHUB_OUTPUT) {
    const out = [
      `file=src/content/blog/${slug}.md`,
      `slug=${slug}`,
      `titel<<POSTDELIM`,
      post.titleDe,
      `POSTDELIM`,
      '',
    ].join('\n');
    writeFileSync(process.env.GITHUB_OUTPUT, out, { flag: 'a', encoding: 'utf-8' });
  }
}

main().catch(e => { console.error('\n❌ Fatal:', e.message); process.exit(1); });
