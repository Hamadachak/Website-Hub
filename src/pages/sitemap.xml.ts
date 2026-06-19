import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { locales, localizedPath, getAlternates } from '../i18n';

// Fully-localized marketing pages (de/en/ar), keyed by German logical path.
const LOCALIZED = [
  '/',
  '/leistungen/hubspot-migration/',
  '/leistungen/revops-fuer-startups/',
  '/leistungen/hubspot-fuer-b2b-saas/',
];

type Alt = { hreflang: string; path: string };

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://mohammad-chakrouf.de').replace(/\/$/, '');
  const abs = (p: string) => base + p;

  const entry = (loc: string, alts?: Alt[]) => {
    if (!alts || alts.length === 0) return `  <url><loc>${abs(loc)}</loc></url>`;
    const links = alts
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${abs(a.path)}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${abs(loc)}</loc>\n${links}\n  </url>`;
  };

  const entries: string[] = [];

  // Marketing pages — one URL per locale, each with de/en/ar/x-default alternates.
  for (const logical of LOCALIZED) {
    const alts = getAlternates(logical);
    for (const loc of locales) entries.push(entry(localizedPath(logical, loc), alts));
  }

  // Blog — DE always, EN where a translation exists. Index + every post.
  const blogIndexAlts: Alt[] = [
    { hreflang: 'de', path: '/blog/' },
    { hreflang: 'en', path: '/en/blog/' },
    { hreflang: 'x-default', path: '/blog/' },
  ];
  entries.push(entry('/blog/', blogIndexAlts));
  entries.push(entry('/en/blog/', blogIndexAlts));

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  for (const p of posts) {
    const deP = `/blog/${p.id}/`;
    const enP = `/en/blog/${p.id}/`;
    if (p.data.bodyEn) {
      const alts: Alt[] = [
        { hreflang: 'de', path: deP },
        { hreflang: 'en', path: enP },
        { hreflang: 'x-default', path: deP },
      ];
      entries.push(entry(deP, alts));
      entries.push(entry(enP, alts));
    } else {
      entries.push(entry(deP));
    }
  }

  // German-only legal pages.
  for (const p of ['/impressum/', '/datenschutz/', '/barrierefreiheit/']) entries.push(entry(p));

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
