import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mohammad-chakrouf.de',
  integrations: [sitemap()],
});
