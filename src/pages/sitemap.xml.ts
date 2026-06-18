import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://mohammad-chakrouf.de').replace(/\/$/, '');

  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const staticPages = [
    '/',
    '/leistungen/hubspot-migration/',
    '/leistungen/revops-fuer-startups/',
    '/leistungen/hubspot-fuer-b2b-saas/',
    '/blog/',
    '/impressum/',
    '/datenschutz/',
    '/barrierefreiheit/',
  ];

  const localedPages = [
    '/',
    '/leistungen/hubspot-migration/',
    '/leistungen/revops-fuer-startups/',
    '/leistungen/hubspot-fuer-b2b-saas/',
    '/blog/',
  ];

  const blogSlugs = posts.map(p => `/blog/${p.id}/`);

  const urls: string[] = [
    ...staticPages.map(p => `${base}${p}`),
    ...localedPages.map(p => `${base}/en${p}`),
    ...localedPages.map(p => `${base}/ar${p}`),
    ...blogSlugs.map(s => `${base}${s}`),
    ...blogSlugs.map(s => `${base}/en${s}`),
    ...blogSlugs.map(s => `${base}/ar${s}`),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(loc => `  <url><loc>${loc}</loc></url>`),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
