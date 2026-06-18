import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { locales, localizedPath, getAlternates } from '../i18n';

// Fully-localized pages (home + service landing pages), keyed by their German
// logical path. Each is emitted once per locale with xhtml:link hreflang
// alternates. Blog + legal pages are German-only and emitted as plain entries.
const LOCALIZED = [
  '/',
  '/leistungen/hubspot-migration/',
  '/leistungen/revops-fuer-startups/',
  '/leistungen/hubspot-fuer-b2b-saas/',
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://mohammad-chakrouf.de').replace(/\/$/, '');
  const abs = (p: string) => base + p;

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const plain = [
    '/blog/',
    ...posts.map((p) => `/blog/${p.id}/`),
    '/impressum/',
    '/datenschutz/',
    '/barrierefreiheit/',
  ];

  const entries: string[] = [];

  for (const logical of LOCALIZED) {
    const alts = getAlternates(logical);
    const links = alts
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${abs(a.path)}"/>`)
      .join('\n');
    for (const loc of locales) {
      entries.push(`  <url>\n    <loc>${abs(localizedPath(logical, loc))}</loc>\n${links}\n  </url>`);
    }
  }

  for (const p of plain) {
    entries.push(`  <url><loc>${abs(p)}</loc></url>`);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
