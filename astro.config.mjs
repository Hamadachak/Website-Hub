import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mohammad-chakrouf.de',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de-DE',
          en: 'en-US',
          ar: 'ar-AE',
        },
      },
    }),
  ],
});
