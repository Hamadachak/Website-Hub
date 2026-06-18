import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mohammad-chakrouf.de',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
});
