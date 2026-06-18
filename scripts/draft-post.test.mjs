// Tests for the blog generator's slug + collision guard.
// Run: node --test scripts/draft-post.test.mjs   (no deps, Node built-in runner)

import { test } from 'node:test';
import assert   from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join }   from 'node:path';
import { tmpdir } from 'node:os';

import {
  slugify, existingSlugs, assertSlugAvailable, writePostFile,
  normalizeUrl, isRelevant, publishedSourceUrls, selectTopic,
} from './draft-post.mjs';

function freshBlogDir() {
  return mkdtempSync(join(tmpdir(), 'blogtest-'));
}

test('slugify is lowercase, umlaut-safe, and punctuation-stripped', () => {
  assert.equal(slugify('Über Größe & Ärger!'), 'ueber-groesse-aerger');
  assert.equal(slugify('ChatGPT-Indexierung'), 'chatgpt-indexierung');
  assert.equal(slugify('  Mehrere   Leerzeichen  '), 'mehrere-leerzeichen');
  assert.equal(slugify('Fußball: Saison 2026/27'), 'fussball-saison-2026-27');
});

test('(a) a new unique slug writes fine', () => {
  const dir = freshBlogDir();
  try {
    assert.deepEqual(existingSlugs(dir), []);
    const p = writePostFile(dir, 'ein-neuer-beitrag', '---\ntitle: x\n---\n\nHallo\n');
    assert.ok(existsSync(p), 'file should exist after write');
    assert.equal(readFileSync(p, 'utf8'), '---\ntitle: x\n---\n\nHallo\n');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('(b) a colliding slug aborts with the error and writes nothing', () => {
  const dir = freshBlogDir();
  try {
    // Simulate an already-published post.
    writeFileSync(join(dir, 'chatgpt-indexierung.md'), 'ORIGINAL', 'utf-8');
    const before = readdirSync(dir).sort();

    assert.throws(
      () => writePostFile(dir, 'chatgpt-indexierung', 'OVERWRITE ATTEMPT'),
      /Slug collision/,
      'should throw a slug-collision error',
    );

    // Existing post is untouched and no new file appeared.
    assert.equal(readFileSync(join(dir, 'chatgpt-indexierung.md'), 'utf8'), 'ORIGINAL');
    assert.deepEqual(readdirSync(dir).sort(), before, 'directory contents must be unchanged');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('assertSlugAvailable is case-insensitive', () => {
  const dir = freshBlogDir();
  try {
    writeFileSync(join(dir, 'chatgpt-indexierung.md'), 'x', 'utf-8');
    assert.throws(() => assertSlugAvailable('ChatGPT-Indexierung', dir), /Slug collision/);
    assert.doesNotThrow(() => assertSlugAvailable('etwas-anderes', dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── source-URL dedup + relevance + freshest-unused selection ──────────────────

test('normalizeUrl strips protocol, www, query/UTM, hash and trailing slash', () => {
  const a = normalizeUrl('https://blog.hubspot.com/marketing/foo/?utm_source=rss&x=1#top');
  const b = normalizeUrl('http://www.blog.hubspot.com/marketing/foo');
  assert.equal(a, 'blog.hubspot.com/marketing/foo');
  assert.equal(a, b, 'differing protocol/www/query/slash must compare equal');
});

test('isRelevant keeps on-topic items and drops off-topic ones', () => {
  assert.equal(isRelevant({ title: 'New HubSpot workflow features', source: 'HubSpot Sales Blog' }), true);
  assert.equal(isRelevant({ title: 'How to fix your CRM reporting', source: 'X' }), true);
  assert.equal(isRelevant({ title: 'The 9 best fitness apps in 2026', source: 'Zapier Blog' }), false);
});

test('publishedSourceUrls reads sourceUrl from front-matter', () => {
  const dir = freshBlogDir();
  try {
    writeFileSync(join(dir, 'a.md'),
      '---\ntitle: "A"\nsourceUrl: "https://blog.hubspot.com/marketing/Get-Indexed/?utm_source=rss"\n---\n\nbody\n', 'utf-8');
    writeFileSync(join(dir, 'b.md'), '---\ntitle: "B"\n---\n\nno source here\n', 'utf-8');
    const set = publishedSourceUrls(dir);
    assert.ok(set.has('blog.hubspot.com/marketing/get-indexed'));
    assert.equal(set.size, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('(a) an article whose sourceUrl is already published is skipped', () => {
  const items = [
    { title: 'Covered piece',  link: 'https://hubspot.com/a?utm_source=x', pubDate: 'Wed, 17 Jun 2026 00:00:00 GMT', source: 'HubSpot' },
    { title: 'Brand new RevOps piece', link: 'https://hubspot.com/b', pubDate: 'Mon, 15 Jun 2026 00:00:00 GMT', source: 'HubSpot' },
  ];
  const publishedUrls = new Set([normalizeUrl('https://www.hubspot.com/a/')]);
  const chosen = selectTopic(items, { publishedUrls });
  assert.ok(chosen, 'should select something');
  assert.equal(chosen.title, 'Brand new RevOps piece', 'must skip the already-covered source');
});

test('(b) a fresh article is selected — and the freshest one wins', () => {
  const items = [
    { title: 'Older CRM update', link: 'https://hubspot.com/old', pubDate: 'Mon, 01 Jun 2026 00:00:00 GMT', source: 'HubSpot' },
    { title: 'Newest CRM update', link: 'https://hubspot.com/new', pubDate: 'Wed, 17 Jun 2026 00:00:00 GMT', source: 'HubSpot' },
  ];
  const chosen = selectTopic(items, {});
  assert.equal(chosen.title, 'Newest CRM update');
});

test('(c) when nothing is fresh, selectTopic returns null (clean exit, no write)', () => {
  const dir = freshBlogDir();
  try {
    const items = [
      { title: 'Covered CRM piece', link: 'https://hubspot.com/a', pubDate: 'Wed, 17 Jun 2026 00:00:00 GMT', source: 'HubSpot' },
      { title: 'Off-topic fitness apps', link: 'https://zapier.com/z', pubDate: 'Wed, 17 Jun 2026 00:00:00 GMT', source: 'Zapier Blog' },
    ];
    const publishedUrls = new Set([normalizeUrl('https://hubspot.com/a')]);
    const chosen = selectTopic(items, { publishedUrls });
    assert.equal(chosen, null, 'covered + off-topic ⇒ nothing to pick');

    // the main() guard returns before writing — directory stays empty
    assert.deepEqual(existingSlugs(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('selection also skips an article whose title-slug is already taken', () => {
  const items = [
    { title: 'ChatGPT Indexierung', link: 'https://hubspot.com/new-url', pubDate: 'Wed, 17 Jun 2026 00:00:00 GMT', source: 'HubSpot' },
  ];
  // same slug as an existing post, but a brand-new source URL
  const chosen = selectTopic(items, { slugs: ['chatgpt-indexierung'] });
  assert.equal(chosen, null, 'title-slug collision should exclude it pre-write');
});
