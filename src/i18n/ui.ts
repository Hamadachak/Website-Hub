export type Lang = 'de' | 'en' | 'ar';
export const defaultLang: Lang = 'de';

export const ogLocale: Record<Lang, string> = {
  de: 'de_DE',
  en: 'en_US',
  ar: 'ar_AE',
};

export const ui = {
  de: {
    skip: 'Zum Inhalt springen / Skip to content',
    langLabel: 'Sprache / Language',
    nav: {
      work: 'Projekte',
      approach: 'Ansatz',
      build: 'Build',
      about: 'Über mich',
      services: 'Leistungen',
      blog: 'Blog',
      ctaLabel: 'Termin buchen',
      ctaAriaOpen: 'Termin buchen (öffnet in neuem Tab)',
    },
    footer: {
      role: 'Senior HubSpot Consultant · Berlin',
      built: 'Selbst gebaut',
      migration: 'HubSpot-Migration',
      revops: 'RevOps für Startups',
      saas: 'HubSpot für B2B-SaaS',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
      barrierefreiheit: 'Barrierefreiheit',
    },
  },
  en: {
    skip: 'Skip to content',
    langLabel: 'Language',
    nav: {
      work: 'Work',
      approach: 'Approach',
      build: 'Build',
      about: 'About',
      services: 'Services',
      blog: 'Blog',
      ctaLabel: 'Book a call',
      ctaAriaOpen: 'Book a call (opens in new tab)',
    },
    footer: {
      role: 'Senior HubSpot Consultant · Berlin',
      built: 'Built by hand',
      migration: 'HubSpot Migration',
      revops: 'RevOps for Startups',
      saas: 'HubSpot for B2B SaaS',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
      barrierefreiheit: 'Accessibility',
    },
  },
  ar: {
    skip: 'انتقل إلى المحتوى',
    langLabel: 'اللغة',
    nav: {
      work: 'المشاريع',
      approach: 'المنهجية',
      build: 'التطوير',
      about: 'عني',
      services: 'الخدمات',
      blog: 'المدونة',
      ctaLabel: 'احجز مكالمة',
      ctaAriaOpen: 'احجز مكالمة (يفتح في نافذة جديدة)',
    },
    footer: {
      role: 'مستشار HubSpot أول · برلين',
      built: 'من بنائي',
      migration: 'هجرة HubSpot',
      revops: 'RevOps للشركات الناشئة',
      saas: 'HubSpot لـ B2B SaaS',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
      barrierefreiheit: 'إمكانية الوصول',
    },
  },
} as const;

export type UI = typeof ui;

/** Strip /en or /ar prefix to get the locale-neutral path. */
export function getCanonicalPath(pathname: string): string {
  return pathname.replace(/^\/(en|ar)/, '') || '/';
}

/** Absolute alternate URLs for hreflang tags. */
export function getAlternates(site: string, canonicalPath: string) {
  const base = site.replace(/\/$/, '');
  return {
    de: `${base}${canonicalPath}`,
    en: `${base}/en${canonicalPath}`,
    ar: `${base}/ar${canonicalPath}`,
  };
}
