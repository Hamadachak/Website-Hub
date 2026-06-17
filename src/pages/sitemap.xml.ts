import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://mohammad-chakrouf.de').replace(/\/$/, '');

  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const urls = [
    `${base}/`,
    `${base}/leistungen/hubspot-migration/`,
    `${base}/leistungen/revops-fuer-startups/`,
    `${base}/leistungen/hubspot-fuer-b2b-saas/`,
    `${base}/blog/`,
    ...posts.map(p => `${base}/blog/${p.id}/`),
    `${base}/impressum/`,
    `${base}/datenschutz/`,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(loc => `  <url><loc>${loc}</loc></url>`),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
