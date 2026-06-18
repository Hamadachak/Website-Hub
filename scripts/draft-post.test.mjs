// Tests for the blog generator's slug + collision guard.
// Run: node --test scripts/draft-post.test.mjs   (no deps, Node built-in runner)

import { test } from 'node:test';
import assert   from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join }   from 'node:path';
import { tmpdir } from 'node:os';

import { slugify, existingSlugs, assertSlugAvailable, writePostFile } from './draft-post.mjs';

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
